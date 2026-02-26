/**
 * ケアプラン作成：薬剤カテゴリの型定義
 *
 * リスク薬剤照合、オピオイド薬剤表示、代替薬剤提案に関する型を定義する。
 */

// =============================================================================
// 処方薬剤とリスク薬剤照合
// =============================================================================

/** 処方薬剤の表示用型 */
export interface PrescriptionEntry {
  /** 処方ID */
  id: number;
  /** YJコード */
  yjCode: string | null;
  /** 薬剤名 */
  drugName: string;
  /** 処方種別 */
  prescriptionType: "ORAL" | "INJECTION" | "EXTERNAL";
  /** 処方日時 */
  prescribedAt: string;
  /** リスク薬剤フラグ */
  isRiskDrug: boolean;
  /** オピオイド（麻薬）フラグ */
  isOpioid: boolean;
  /** リスク薬剤のカテゴリーID（リスク薬剤の場合） */
  riskCategoryId: number | null;
}

/** リスク薬剤の照合結果 */
export interface RiskDrugMatch {
  /** 処方薬剤情報 */
  prescription: PrescriptionEntry;
  /** リスク回避/調整メッセージ */
  warningMessage: string;
  /** 代替薬剤の提案 */
  alternatives: AlternativeDrug[];
  /** 変更理由 */
  changeReason: string;
}

/** 代替薬剤 */
export interface AlternativeDrug {
  /** 薬剤名 */
  drugName: string;
  /** 薬剤コード */
  medicinesCode: string;
  /** 推奨理由 */
  reason: string;
}

// =============================================================================
// 薬剤カテゴリ定数
// =============================================================================

/** オピオイド（麻薬）のカテゴリID */
export const OPIOID_CATEGORY_ID = 1;

/** リスク薬剤カテゴリ定義 */
export const RISK_DRUG_CATEGORIES: Record<number, string> = {
  1: "オピオイド（麻薬）",
  2: "ベンゾジアゼピン系",
  3: "抗コリン薬",
  4: "H2ブロッカー",
  5: "抗精神病薬",
  6: "ステロイド",
};

/** 処方種別の表示ラベル */
export const PRESCRIPTION_TYPE_LABELS: Record<string, string> = {
  ORAL: "内服",
  INJECTION: "注射",
  EXTERNAL: "外用",
};

// =============================================================================
// 一問一答形式のステップ定義
// =============================================================================

/** 薬剤ケアプランの質問ID */
export type MedicationQuestionId =
  | "risk_drug_review"
  | "opioid_review"
  | "alternative_selection"
  | "confirmation";

/** 質問ステップ定義 */
export interface MedicationStep {
  /** 質問ID */
  id: MedicationQuestionId;
  /** 質問タイトル */
  title: string;
  /** 質問の説明 */
  description: string;
  /** ステップ番号（1始まり） */
  stepNumber: number;
}

/** 薬剤ケアプランの全ステップ */
export const MEDICATION_STEPS: MedicationStep[] = [
  {
    id: "risk_drug_review",
    title: "リスク薬剤の確認",
    description: "処方されているリスク薬剤を確認します",
    stepNumber: 1,
  },
  {
    id: "opioid_review",
    title: "オピオイド薬剤の確認",
    description: "オピオイド（麻薬）として取り扱う薬剤を確認します",
    stepNumber: 2,
  },
  {
    id: "alternative_selection",
    title: "薬剤変更提案",
    description: "リスク薬剤の代替案を確認し、変更を検討します",
    stepNumber: 3,
  },
  {
    id: "confirmation",
    title: "確認",
    description: "入力内容を確認して保存します",
    stepNumber: 4,
  },
];

// =============================================================================
// 薬剤ケアプランの詳細データ（CarePlanItem.detailsに保存）
// =============================================================================

/** 薬剤ケアプランの保存データ */
export interface MedicationCarePlanDetails {
  /** リスク薬剤照合結果 */
  riskDrugMatches: RiskDrugMatch[];
  /** オピオイド薬剤一覧 */
  opioidDrugs: PrescriptionEntry[];
  /** 選択された代替薬剤の提案 */
  selectedAlternatives: SelectedAlternative[];
  /** ケアプラン指示内容 */
  instructions: string;
  /** 完了日時 */
  completedAt?: string;
}

/** 選択された代替薬剤 */
export interface SelectedAlternative {
  /** 元の処方ID */
  originalPrescriptionId: number;
  /** 元の薬剤名 */
  originalDrugName: string;
  /** 代替薬剤名 */
  alternativeDrugName: string;
  /** 変更理由 */
  changeReason: string;
}

// =============================================================================
// レスポンス型
// =============================================================================

/** 薬剤ケアプラン作成画面のデータ取得レスポンス */
export interface MedicationCarePlanResponse {
  /** 入院ID */
  admissionId: number;
  /** ケアプランアイテムID */
  carePlanItemId: number;
  /** ステータス */
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "NOT_APPLICABLE";
  /** 現在の質問ID */
  currentQuestionId: MedicationQuestionId | null;
  /** 全処方薬剤一覧 */
  prescriptions: PrescriptionEntry[];
  /** リスク薬剤照合結果 */
  riskDrugMatches: RiskDrugMatch[];
  /** オピオイド薬剤 */
  opioidDrugs: PrescriptionEntry[];
  /** 保存済みの詳細データ */
  savedDetails: MedicationCarePlanDetails | null;
}

/** 薬剤ケアプラン保存リクエスト */
export interface SaveMedicationCarePlanRequest {
  /** ケアプランアイテムID */
  carePlanItemId: number;
  /** 現在の質問ID */
  currentQuestionId: MedicationQuestionId;
  /** 保存データ */
  details: MedicationCarePlanDetails;
  /** ステータス更新 */
  status: "IN_PROGRESS" | "COMPLETED";
}

/** 回避/調整メッセージの生成ルール */
export const RISK_DRUG_WARNING_MESSAGES: Record<number, string> = {
  1: "オピオイド薬剤が処方されています。投与量の調整または代替薬剤への変更を検討してください。",
  2: "ベンゾジアゼピン系薬剤が処方されています。せん妄リスクが高いため、投与を回避または減量を検討してください。",
  3: "抗コリン薬が処方されています。せん妄リスクが高いため、投与を回避または代替薬剤への変更を検討してください。",
  4: "H2ブロッカーが処方されています。プロトンポンプ阻害薬（PPI）への変更を検討してください。",
  5: "抗精神病薬が処方されています。必要最小量での使用を検討してください。",
  6: "ステロイドが処方されています。投与量の漸減または代替療法を検討してください。",
};

/** カテゴリ別の代替薬剤マッピング（モック） */
export const ALTERNATIVE_DRUG_MAP: Record<number, AlternativeDrug[]> = {
  2: [
    {
      drugName: "ラメルテオン（ロゼレム）",
      medicinesCode: "ALT001",
      reason: "メラトニン受容体作動薬。せん妄リスクが低い睡眠薬。",
    },
    {
      drugName: "スボレキサント（ベルソムラ）",
      medicinesCode: "ALT002",
      reason: "オレキシン受容体拮抗薬。ベンゾジアゼピン系より安全性が高い。",
    },
  ],
  3: [
    {
      drugName: "ファモチジン（ガスター）",
      medicinesCode: "ALT003",
      reason: "抗コリン作用のないH2ブロッカー。",
    },
  ],
  4: [
    {
      drugName: "ランソプラゾール（タケプロン）",
      medicinesCode: "ALT004",
      reason: "プロトンポンプ阻害薬（PPI）。H2ブロッカーより安全性が高い。",
    },
    {
      drugName: "ラベプラゾール（パリエット）",
      medicinesCode: "ALT005",
      reason: "PPI。せん妄リスクが低い。",
    },
  ],
  6: [
    {
      drugName: "NSAIDS（非ステロイド性消炎鎮痛薬）",
      medicinesCode: "ALT006",
      reason: "ステロイドの代替として使用可能な場合がある。",
    },
  ],
};
