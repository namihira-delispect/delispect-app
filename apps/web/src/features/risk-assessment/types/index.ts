/**
 * せん妄リスク評価機能の型定義
 *
 * ML APIとの連携によるリスク評価に関する型を定義する。
 * リスクレベルは HIGH / LOW / INDETERMINATE の3段階。
 */

/** ML APIリスク評価レベル */
export type MlRiskLevel = "HIGH" | "LOW" | "INDETERMINATE";

/** ML APIリスク評価レベルの表示ラベル */
export const ML_RISK_LEVEL_LABELS: Record<MlRiskLevel, string> = {
  HIGH: "高リスク",
  LOW: "低リスク",
  INDETERMINATE: "判定不能",
};

/** 一括評価の上限件数 */
export const BATCH_ASSESSMENT_LIMIT = 50;

// =============================================================================
// ML API入出力型
// =============================================================================

/** ML APIへの入力データ（特徴量） */
export interface MlInputFeatures {
  /** 入院ID */
  admissionId: number;
  /** 患者の年齢 */
  age: number | null;
  /** 性別 */
  gender: string;
  /** 身長(cm) */
  height: number | null;
  /** 体重(kg) */
  weight: number | null;
  /** 既往歴データ */
  medicalHistory: {
    hasDementia: boolean | null;
    hasOrganicBrainDamage: boolean | null;
    isHeavyAlcohol: boolean | null;
    hasDeliriumHistory: boolean | null;
    usesPsychotropicDrugs: boolean | null;
    hasGeneralAnesthesia: boolean | null;
    hasEmergencySurgery: boolean | null;
    hasScheduledSurgery: boolean | null;
    hasHeadNeckSurgery: boolean | null;
    hasChestSurgery: boolean | null;
    hasAbdominalSurgery: boolean | null;
    hasAdmissionOxygenUse: boolean | null;
    oxygenLevel: number | null;
  } | null;
  /** 最新バイタルサイン */
  vitalSigns: {
    bodyTemperature: number | null;
    pulse: number | null;
    systolicBp: number | null;
    diastolicBp: number | null;
    spo2: number | null;
    respiratoryRate: number | null;
  } | null;
  /** 最新の検査値 */
  labResults: Record<string, number>;
  /** 処方薬剤のリスク薬剤該当数 */
  riskDrugCount: number;
  /** 処方薬剤の総数 */
  totalDrugCount: number;
}

/** ML API個別結果 */
export interface MlAssessmentResult {
  /** 入院ID */
  admissionId: number;
  /** リスクレベル */
  riskLevel: MlRiskLevel;
  /** リスク因子のキーと値 */
  riskFactors: Record<string, unknown>;
  /** ML入力スナップショット */
  mlInputSnapshot: MlInputFeatures;
  /** 不足項目（判定不能時のみ） */
  missingFields?: string[];
}

/** ML API一括評価レスポンス */
export interface MlBatchAssessmentResponse {
  /** 評価結果一覧 */
  results: MlAssessmentResult[];
}

// =============================================================================
// Server Action入出力型
// =============================================================================

/** リスク評価実行リクエスト */
export interface ExecuteRiskAssessmentRequest {
  admissionIds: number[];
}

/** 個別の評価結果（Server Actionレスポンス用） */
export interface RiskAssessmentResultEntry {
  /** 入院ID */
  admissionId: number;
  /** 処理成否 */
  success: boolean;
  /** リスクレベル（成功時） */
  riskLevel?: MlRiskLevel;
  /** エラーメッセージ（失敗時） */
  error?: string;
  /** 不足項目名（判定不能時） */
  missingFields?: string[];
}

/** リスク評価実行レスポンス */
export interface ExecuteRiskAssessmentResponse {
  /** 成功件数 */
  successCount: number;
  /** 失敗件数 */
  failureCount: number;
  /** 判定不能件数 */
  indeterminateCount: number;
  /** 個別結果一覧 */
  results: RiskAssessmentResultEntry[];
}
