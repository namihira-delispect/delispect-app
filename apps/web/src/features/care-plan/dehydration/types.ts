/**
 * 脱水ケアプラン：型定義・定数
 *
 * 脱水アセスメントの一問一答フローにおける
 * 質問ID、回答値、詳細データ型、および対処提案型を定義する。
 */

// =============================================================================
// 質問ID
// =============================================================================

/** 脱水アセスメント質問ID */
export type DehydrationQuestionId =
  | "lab_ht"
  | "lab_hb"
  | "vital_pulse"
  | "vital_bp"
  | "visual_skin"
  | "visual_oral"
  | "visual_dizziness"
  | "visual_urine"
  | "intake_frequency"
  | "intake_amount";

/** 質問フローの順序 */
export const DEHYDRATION_QUESTION_ORDER: DehydrationQuestionId[] = [
  "lab_ht",
  "lab_hb",
  "vital_pulse",
  "vital_bp",
  "visual_skin",
  "visual_oral",
  "visual_dizziness",
  "visual_urine",
  "intake_frequency",
  "intake_amount",
];

// =============================================================================
// 質問メタデータ
// =============================================================================

/** 質問メタデータ */
export interface DehydrationQuestionMeta {
  /** 質問ID */
  id: DehydrationQuestionId;
  /** 質問タイトル */
  title: string;
  /** 質問説明文 */
  description: string;
  /** 質問グループ */
  group: "lab" | "vital" | "visual" | "intake";
  /** 入力タイプ */
  inputType: "lab_value" | "vital_value" | "select" | "number";
}

/** 質問メタデータマップ */
export const DEHYDRATION_QUESTIONS: Record<DehydrationQuestionId, DehydrationQuestionMeta> = {
  lab_ht: {
    id: "lab_ht",
    title: "Ht（ヘマトクリット）",
    description: "採血結果のHt値を確認してください。基準値からの逸脱を判定します。",
    group: "lab",
    inputType: "lab_value",
  },
  lab_hb: {
    id: "lab_hb",
    title: "Hb（ヘモグロビン）",
    description: "採血結果のHb値を確認してください。基準値からの逸脱を判定します。",
    group: "lab",
    inputType: "lab_value",
  },
  vital_pulse: {
    id: "vital_pulse",
    title: "脈拍",
    description: "現在の脈拍（bpm）を入力してください。",
    group: "vital",
    inputType: "vital_value",
  },
  vital_bp: {
    id: "vital_bp",
    title: "血圧",
    description: "現在の血圧（収縮期/拡張期 mmHg）を入力してください。",
    group: "vital",
    inputType: "vital_value",
  },
  visual_skin: {
    id: "visual_skin",
    title: "皮膚の状態",
    description: "皮膚の乾燥、弾力低下（ツルゴール低下）の有無を選択してください。",
    group: "visual",
    inputType: "select",
  },
  visual_oral: {
    id: "visual_oral",
    title: "口腔の状態",
    description: "口腔内の乾燥、舌の乾燥の有無を選択してください。",
    group: "visual",
    inputType: "select",
  },
  visual_dizziness: {
    id: "visual_dizziness",
    title: "たちくらみ・ふらつき",
    description: "たちくらみやふらつきの有無を選択してください。",
    group: "visual",
    inputType: "select",
  },
  visual_urine: {
    id: "visual_urine",
    title: "尿の色合い・状態",
    description: "尿の濃縮・色調変化の有無を選択してください。",
    group: "visual",
    inputType: "select",
  },
  intake_frequency: {
    id: "intake_frequency",
    title: "水分摂取頻度",
    description: "1日の水分摂取頻度を選択してください。",
    group: "intake",
    inputType: "select",
  },
  intake_amount: {
    id: "intake_amount",
    title: "1日の水分摂取量",
    description: "1日の水分摂取量（ml）を入力してください。",
    group: "intake",
    inputType: "number",
  },
};

/** 質問グループの表示ラベル */
export const DEHYDRATION_GROUP_LABELS: Record<string, string> = {
  lab: "採血結果の確認",
  vital: "脈拍・血圧の確認",
  visual: "目視確認",
  intake: "水分摂取確認",
};

// =============================================================================
// 選択肢
// =============================================================================

/** 目視確認の選択肢 */
export type VisualCondition = "NORMAL" | "MILD" | "SEVERE";

export const VISUAL_CONDITION_LABELS: Record<VisualCondition, string> = {
  NORMAL: "正常",
  MILD: "軽度異常",
  SEVERE: "重度異常",
};

/** 水分摂取頻度の選択肢 */
export type IntakeFrequency = "FREQUENT" | "MODERATE" | "RARE";

export const INTAKE_FREQUENCY_LABELS: Record<IntakeFrequency, string> = {
  FREQUENT: "十分（1時間に1回以上）",
  MODERATE: "普通（2-3時間に1回）",
  RARE: "少ない（ほとんど摂取しない）",
};

// =============================================================================
// 回答データ型
// =============================================================================

/** 採血結果の回答 */
export interface LabValueAnswer {
  /** 検査値 */
  value: number | null;
  /** 基準値下限 */
  lowerLimit: number | null;
  /** 基準値上限 */
  upperLimit: number | null;
  /** 単位 */
  unit: string | null;
  /** 逸脱状態 */
  deviationStatus: "NORMAL" | "HIGH" | "LOW" | "NO_DATA";
}

/** バイタルサインの回答 */
export interface VitalValueAnswer {
  /** 脈拍 */
  pulse?: number | null;
  /** 収縮期血圧 */
  systolicBp?: number | null;
  /** 拡張期血圧 */
  diastolicBp?: number | null;
}

/** 脱水アセスメント詳細データ（CarePlanItem.detailsに保存） */
export interface DehydrationDetails {
  /** Ht値 */
  labHt: LabValueAnswer | null;
  /** Hb値 */
  labHb: LabValueAnswer | null;
  /** 脈拍 */
  vitalPulse: number | null;
  /** 収縮期血圧 */
  vitalSystolicBp: number | null;
  /** 拡張期血圧 */
  vitalDiastolicBp: number | null;
  /** 皮膚の状態 */
  visualSkin: VisualCondition | null;
  /** 口腔の状態 */
  visualOral: VisualCondition | null;
  /** たちくらみ・ふらつき */
  visualDizziness: VisualCondition | null;
  /** 尿の色合い・状態 */
  visualUrine: VisualCondition | null;
  /** 水分摂取頻度 */
  intakeFrequency: IntakeFrequency | null;
  /** 1日の水分摂取量（ml） */
  intakeAmount: number | null;
}

/** 初期値 */
export const EMPTY_DEHYDRATION_DETAILS: DehydrationDetails = {
  labHt: null,
  labHb: null,
  vitalPulse: null,
  vitalSystolicBp: null,
  vitalDiastolicBp: null,
  visualSkin: null,
  visualOral: null,
  visualDizziness: null,
  visualUrine: null,
  intakeFrequency: null,
  intakeAmount: null,
};

// =============================================================================
// 対処提案
// =============================================================================

/** 対処提案 */
export interface DehydrationProposal {
  /** 提案ID */
  id: string;
  /** 提案カテゴリ */
  category: "dehydration" | "intake";
  /** 提案内容 */
  message: string;
  /** 優先度（1が最高） */
  priority: number;
}

/** 脱水判定結果 */
export interface DehydrationAssessmentResult {
  /** 脱水リスクレベル */
  riskLevel: "HIGH" | "MODERATE" | "LOW" | "NONE";
  /** 脱水リスクレベルラベル */
  riskLevelLabel: string;
  /** 対処提案一覧 */
  proposals: DehydrationProposal[];
  /** 指示テキスト（CarePlanItem.instructionsに保存） */
  instructions: string;
}

/** リスクレベルの表示ラベル */
export const DEHYDRATION_RISK_LEVEL_LABELS: Record<string, string> = {
  HIGH: "脱水リスク高",
  MODERATE: "脱水リスク中",
  LOW: "脱水リスク低",
  NONE: "脱水リスクなし",
};

// =============================================================================
// サーバーレスポンス型
// =============================================================================

/** 脱水アセスメント保存リクエスト */
export interface SaveDehydrationRequest {
  /** ケアプランアイテムID */
  itemId: number;
  /** 現在の質問ID */
  currentQuestionId: DehydrationQuestionId;
  /** アセスメント詳細 */
  details: DehydrationDetails;
}

/** 脱水アセスメント完了リクエスト */
export interface CompleteDehydrationRequest {
  /** ケアプランアイテムID */
  itemId: number;
  /** アセスメント詳細 */
  details: DehydrationDetails;
}

/** 脱水アセスメントレスポンス */
export interface DehydrationResponse {
  /** ケアプランアイテムID */
  itemId: number;
  /** ステータス */
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  /** 現在の質問ID */
  currentQuestionId: DehydrationQuestionId | null;
  /** アセスメント詳細 */
  details: DehydrationDetails;
  /** 評価結果（完了時のみ） */
  assessmentResult: DehydrationAssessmentResult | null;
}
