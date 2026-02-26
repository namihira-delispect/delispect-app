/**
 * ML APIリスク評価 Mockサービス
 *
 * 入院IDリストを受け取り、DBから特徴量を抽出してリスク評価を行うMock実装。
 * 実際のML APIとの連携は後続チケットで実装する。
 *
 * Mock判定ロジック:
 * - データ不足（既往歴未入力等）の場合 → INDETERMINATE
 * - 以下の条件のいずれかに該当する場合 → HIGH
 *   - 70歳以上
 *   - 認知症あり
 *   - せん妄既往あり
 *   - リスク薬剤2剤以上
 *   - CRP > 5.0
 * - 上記以外 → LOW
 */

import type {
  MlInputFeatures,
  MlAssessmentResult,
  MlBatchAssessmentResponse,
  MlRiskLevel,
} from "@/features/risk-assessment/types";

/** 判定不能と判断する不足項目のチェック */
interface MissingFieldCheck {
  field: string;
  label: string;
  isMissing: boolean;
}

/**
 * 不足項目を検出する
 */
export function detectMissingFields(input: MlInputFeatures): string[] {
  const checks: MissingFieldCheck[] = [
    {
      field: "age",
      label: "年齢",
      isMissing: input.age == null,
    },
    {
      field: "medicalHistory",
      label: "既往歴",
      isMissing: input.medicalHistory == null,
    },
    {
      field: "vitalSigns",
      label: "バイタルサイン",
      isMissing: input.vitalSigns == null,
    },
  ];

  return checks.filter((c) => c.isMissing).map((c) => c.label);
}

/**
 * Mock判定ロジック
 *
 * 特徴量からリスクレベルを判定する。
 * データ不足時はINDETERMINATEを返す。
 */
export function assessRiskLevel(input: MlInputFeatures): {
  riskLevel: MlRiskLevel;
  riskFactors: Record<string, unknown>;
  missingFields?: string[];
} {
  // 不足項目チェック
  const missingFields = detectMissingFields(input);
  if (missingFields.length > 0) {
    return {
      riskLevel: "INDETERMINATE",
      riskFactors: {},
      missingFields,
    };
  }

  // リスク因子の抽出
  const riskFactors: Record<string, unknown> = {};

  // 年齢因子
  if (input.age != null && input.age >= 70) {
    riskFactors["isOver70"] = true;
  }

  // 既往歴因子
  if (input.medicalHistory) {
    if (input.medicalHistory.hasDementia === true) {
      riskFactors["hasDementia"] = true;
    }
    if (input.medicalHistory.hasOrganicBrainDamage === true) {
      riskFactors["hasOrganicBrainDamage"] = true;
    }
    if (input.medicalHistory.isHeavyAlcohol === true) {
      riskFactors["isHeavyAlcohol"] = true;
    }
    if (input.medicalHistory.hasDeliriumHistory === true) {
      riskFactors["hasDeliriumHistory"] = true;
    }
    if (input.medicalHistory.usesPsychotropicDrugs === true) {
      riskFactors["usesPsychotropicDrugs"] = true;
    }
    if (input.medicalHistory.hasGeneralAnesthesia === true) {
      riskFactors["hasGeneralAnesthesia"] = true;
    }
    if (input.medicalHistory.hasEmergencySurgery === true) {
      riskFactors["hasEmergencySurgery"] = true;
    }
  }

  // 薬剤因子
  if (input.riskDrugCount >= 2) {
    riskFactors["hasMultipleRiskDrugs"] = true;
  }

  // 検査値因子
  const crp = input.labResults["CRP"];
  if (crp != null && crp > 5.0) {
    riskFactors["highCrp"] = true;
  }

  // HIGH判定条件: いずれかのリスク因子が存在する
  const isHighRisk = Object.keys(riskFactors).length > 0;

  return {
    riskLevel: isHighRisk ? "HIGH" : "LOW",
    riskFactors,
  };
}

/**
 * ML APIリスク評価を実行する（Mock実装）
 *
 * 入力特徴量リストに対してリスク評価を行い、結果を返す。
 * 実際の運用ではML APIサーバーへのHTTPリクエストに置き換える。
 *
 * @param inputs - ML入力特徴量リスト
 * @returns 一括評価結果
 */
export async function predictRisk(inputs: MlInputFeatures[]): Promise<MlBatchAssessmentResponse> {
  // 非同期処理のシミュレーション（実際のAPI呼び出し時間をシミュレート）
  await new Promise((resolve) => setTimeout(resolve, 50));

  const results: MlAssessmentResult[] = inputs.map((input) => {
    const { riskLevel, riskFactors, missingFields } = assessRiskLevel(input);

    return {
      admissionId: input.admissionId,
      riskLevel,
      riskFactors,
      mlInputSnapshot: input,
      ...(missingFields && missingFields.length > 0 ? { missingFields } : {}),
    };
  });

  return { results };
}
