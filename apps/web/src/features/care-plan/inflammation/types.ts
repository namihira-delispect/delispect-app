/**
 * ケアプラン作成：炎症カテゴリの型定義
 *
 * 採血結果（CRP/WBC）の確認、バイタルサイン確認、
 * 炎症にともなう痛みの確認と対処提案に関する型を定義する。
 */

// =============================================================================
// 質問フロー関連の型
// =============================================================================

/** 炎症カテゴリの質問ID */
export type InflammationQuestionId = "lab_results" | "vital_signs" | "pain_check" | "suggestion";

/** 質問定義 */
export interface InflammationQuestion {
  /** 質問ID */
  id: InflammationQuestionId;
  /** 表示タイトル */
  title: string;
  /** 説明文 */
  description: string;
  /** 質問の順序 */
  order: number;
}

/** 質問フロー順序 */
export const INFLAMMATION_QUESTION_ORDER: InflammationQuestionId[] = [
  "lab_results",
  "vital_signs",
  "pain_check",
  "suggestion",
];

/** 質問定義マスタ */
export const INFLAMMATION_QUESTIONS: Record<InflammationQuestionId, InflammationQuestion> = {
  lab_results: {
    id: "lab_results",
    title: "採血結果の確認",
    description: "CRP・WBCの値を確認します。基準値と比較して逸脱がないか確認してください。",
    order: 1,
  },
  vital_signs: {
    id: "vital_signs",
    title: "バイタルサインの確認",
    description: "脈拍・血圧・SpO2を確認します。年齢の影響が出やすいため基準値は表示しません。",
    order: 2,
  },
  pain_check: {
    id: "pain_check",
    title: "炎症にともなう痛みの確認",
    description: "炎症に関連する痛みの有無を確認します。",
    order: 3,
  },
  suggestion: {
    id: "suggestion",
    title: "対処提案",
    description: "炎症・発熱の有無に応じた対処方法を提案します。",
    order: 4,
  },
};

// =============================================================================
// 採血結果関連の型
// =============================================================================

/** 逸脱判定結果 */
export type DeviationStatus = "NORMAL" | "HIGH" | "LOW";

/** 採血結果エントリ */
export interface LabResultEntry {
  /** 項目コード */
  itemCode: "CRP" | "WBC";
  /** 項目名 */
  itemName: string;
  /** 測定値 */
  value: number | null;
  /** 単位 */
  unit: string;
  /** 基準値下限 */
  lowerLimit: number | null;
  /** 基準値上限 */
  upperLimit: number | null;
  /** 逸脱判定 */
  deviationStatus: DeviationStatus | null;
  /** 測定日時 */
  measuredAt: string | null;
}

// =============================================================================
// バイタルサイン関連の型
// =============================================================================

/** バイタルサインエントリ */
export interface VitalSignEntry {
  /** 脈拍（bpm） */
  pulse: number | null;
  /** 収縮期血圧（mmHg） */
  systolicBp: number | null;
  /** 拡張期血圧（mmHg） */
  diastolicBp: number | null;
  /** SpO2（%） */
  spo2: number | null;
  /** 体温（度） */
  bodyTemperature: number | null;
  /** 測定日時 */
  measuredAt: string | null;
}

// =============================================================================
// 炎症詳細データの型
// =============================================================================

/** 炎症ケアプランの詳細データ（CarePlanItem.detailsに保存される） */
export interface InflammationDetails {
  /** 採血結果 */
  labResults: LabResultEntry[];
  /** バイタルサイン */
  vitalSigns: VitalSignEntry | null;
  /** 炎症にともなう痛みの有無 */
  hasPain: boolean | null;
  /** 発熱の有無（体温 >= 37.5度） */
  hasFever: boolean | null;
  /** 炎症の有無（CRP/WBCが逸脱） */
  hasInflammation: boolean | null;
}

// =============================================================================
// 対処提案の型
// =============================================================================

/** 対処提案 */
export interface InflammationSuggestion {
  /** 提案ID */
  id: string;
  /** 提案カテゴリ */
  category: "inflammation" | "fever" | "pain";
  /** 提案内容 */
  message: string;
  /** 優先度 */
  priority: number;
}

/** 炎症対処提案レスポンス */
export interface InflammationSuggestionResponse {
  /** 提案一覧 */
  suggestions: InflammationSuggestion[];
  /** 疼痛カテゴリへの誘導が必要か */
  shouldNavigateToPain: boolean;
}

// =============================================================================
// API レスポンスの型
// =============================================================================

/** 炎症データ取得レスポンス */
export interface InflammationDataResponse {
  /** ケアプランアイテムID */
  itemId: number;
  /** 現在の質問ID */
  currentQuestionId: InflammationQuestionId | null;
  /** 採血結果 */
  labResults: LabResultEntry[];
  /** バイタルサイン */
  vitalSigns: VitalSignEntry | null;
  /** 詳細データ（既に保存されている場合） */
  details: InflammationDetails | null;
}

/** 炎症ケアプラン保存リクエスト */
export interface SaveInflammationInput {
  /** ケアプランアイテムID */
  itemId: number;
  /** 入院ID */
  admissionId: number;
  /** 現在の質問ID */
  currentQuestionId: InflammationQuestionId;
  /** 炎症にともなう痛みの有無 */
  hasPain: boolean | null;
}

// =============================================================================
// ビジネスロジック関数
// =============================================================================

/** 発熱閾値（度） */
export const FEVER_THRESHOLD = 37.5;

/**
 * 採血結果の逸脱判定を行う
 *
 * @param value - 測定値
 * @param lowerLimit - 基準値下限
 * @param upperLimit - 基準値上限
 * @returns 逸脱判定結果
 */
export function judgeDeviation(
  value: number | null,
  lowerLimit: number | null,
  upperLimit: number | null,
): DeviationStatus | null {
  if (value === null) {
    return null;
  }

  if (upperLimit !== null && value > upperLimit) {
    return "HIGH";
  }

  if (lowerLimit !== null && value < lowerLimit) {
    return "LOW";
  }

  return "NORMAL";
}

/**
 * 発熱の判定を行う
 *
 * @param bodyTemperature - 体温
 * @returns 発熱有無（null: データなし）
 */
export function judgeFever(bodyTemperature: number | null): boolean | null {
  if (bodyTemperature === null) {
    return null;
  }
  return bodyTemperature >= FEVER_THRESHOLD;
}

/**
 * 炎症の有無を判定する
 *
 * CRP/WBCのいずれかが基準値を上回っている場合に炎症ありとする。
 *
 * @param labResults - 採血結果一覧
 * @returns 炎症有無（null: データなし）
 */
export function judgeInflammation(labResults: LabResultEntry[]): boolean | null {
  if (labResults.length === 0) {
    return null;
  }

  const hasData = labResults.some((r) => r.value !== null);
  if (!hasData) {
    return null;
  }

  return labResults.some((r) => r.deviationStatus === "HIGH");
}

/**
 * 炎症の対処提案を生成する
 *
 * @param details - 炎症詳細データ
 * @returns 対処提案レスポンス
 */
export function generateInflammationSuggestions(
  details: InflammationDetails,
): InflammationSuggestionResponse {
  const suggestions: InflammationSuggestion[] = [];
  let shouldNavigateToPain = false;

  // 炎症がある場合の提案
  if (details.hasInflammation === true) {
    suggestions.push({
      id: "inflammation_detected",
      category: "inflammation",
      message:
        "採血結果で炎症反応が認められます。感染症の有無を確認し、必要に応じて抗菌薬の投与を検討してください。",
      priority: 1,
    });
    suggestions.push({
      id: "inflammation_monitor",
      category: "inflammation",
      message: "CRP・WBCの推移を定期的にモニタリングしてください。",
      priority: 2,
    });
  } else if (details.hasInflammation === false) {
    suggestions.push({
      id: "inflammation_normal",
      category: "inflammation",
      message: "採血結果では明らかな炎症反応は認められません。経過観察を継続してください。",
      priority: 3,
    });
  }

  // 発熱がある場合の提案
  if (details.hasFever === true) {
    suggestions.push({
      id: "fever_detected",
      category: "fever",
      message:
        "発熱が認められます。クーリングの実施、水分補給の促進、解熱剤の使用を検討してください。",
      priority: 1,
    });
    suggestions.push({
      id: "fever_environment",
      category: "fever",
      message: "室温の調整、寝具の調整など環境整備を行ってください。",
      priority: 2,
    });
  } else if (details.hasFever === false) {
    suggestions.push({
      id: "fever_normal",
      category: "fever",
      message: "現時点では発熱は認められません。引き続き体温の変動に注意してください。",
      priority: 3,
    });
  }

  // 痛みがある場合の提案
  if (details.hasPain === true) {
    suggestions.push({
      id: "pain_detected",
      category: "pain",
      message: "炎症にともなう痛みが認められます。疼痛管理のケアプランも合わせて作成してください。",
      priority: 1,
    });
    shouldNavigateToPain = true;
  } else if (details.hasPain === false) {
    suggestions.push({
      id: "pain_normal",
      category: "pain",
      message: "現時点では炎症にともなう痛みは認められません。",
      priority: 3,
    });
  }

  // 優先度でソート
  suggestions.sort((a, b) => a.priority - b.priority);

  return { suggestions, shouldNavigateToPain };
}
