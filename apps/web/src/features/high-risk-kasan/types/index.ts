/**
 * せん妄ハイリスクケア加算アセスメント機能の型定義
 */

/** アセスメント項目のカテゴリー */
export type AssessmentCategory = "MEDICAL_HISTORY" | "AGE" | "RISK_DRUG";

/** アセスメント項目の判定ソース */
export type AssessmentSource = "MANUAL" | "AUTO";

/** 個別アセスメント項目の表示用 */
export interface AssessmentItemDisplay {
  /** 項目キー */
  key: string;
  /** 項目ラベル */
  label: string;
  /** カテゴリー */
  category: AssessmentCategory;
  /** 判定ソース（手動/自動） */
  source: AssessmentSource;
  /** 該当/非該当（nullは未評価） */
  isApplicable: boolean | null;
  /** 判定基準の説明 */
  criteria: string;
}

/** ハイリスクケア加算アセスメント結果の表示用 */
export interface HighRiskKasanAssessmentDisplay {
  /** 入院ID */
  admissionId: number;
  /** 全体の加算対象判定 */
  isEligible: boolean;
  /** 判定済みかどうか */
  isAssessed: boolean;
  /** アセスメント項目一覧 */
  items: AssessmentItemDisplay[];
  /** 評価者名（判定済みの場合） */
  assessedBy: string | null;
  /** 評価日時（判定済みの場合） */
  assessedAt: string | null;
}

/** アセスメント保存リクエスト */
export interface SaveAssessmentRequest {
  /** 入院ID */
  admissionId: number;
  /** MedicalHistory項目のチェック状態 */
  medicalHistoryItems: {
    hasDementia: boolean;
    hasOrganicBrainDamage: boolean;
    isHeavyAlcohol: boolean;
    hasDeliriumHistory: boolean;
    hasGeneralAnesthesia: boolean;
  };
}

/** アセスメント項目定義（静的データ） */
export const ASSESSMENT_ITEM_DEFINITIONS: {
  key: string;
  label: string;
  category: AssessmentCategory;
  source: AssessmentSource;
  criteria: string;
}[] = [
  {
    key: "hasDementia",
    label: "認知症",
    category: "MEDICAL_HISTORY",
    source: "MANUAL",
    criteria: "認知症の診断がある",
  },
  {
    key: "hasOrganicBrainDamage",
    label: "脳器質的障害",
    category: "MEDICAL_HISTORY",
    source: "MANUAL",
    criteria: "脳血管障害、脳腫瘍等の脳器質的障害がある",
  },
  {
    key: "isHeavyAlcohol",
    label: "アルコール多飲",
    category: "MEDICAL_HISTORY",
    source: "MANUAL",
    criteria: "アルコールの多量摂取歴がある",
  },
  {
    key: "hasDeliriumHistory",
    label: "せん妄の既往",
    category: "MEDICAL_HISTORY",
    source: "MANUAL",
    criteria: "過去にせん妄を発症したことがある",
  },
  {
    key: "hasGeneralAnesthesia",
    label: "全身麻酔の予定",
    category: "MEDICAL_HISTORY",
    source: "MANUAL",
    criteria: "全身麻酔を伴う手術の予定がある",
  },
  {
    key: "isOver70",
    label: "70歳以上",
    category: "AGE",
    source: "AUTO",
    criteria: "患者の年齢が70歳以上（生年月日から自動算出）",
  },
  {
    key: "hasRiskDrug",
    label: "リスク薬剤の使用",
    category: "RISK_DRUG",
    source: "AUTO",
    criteria: "せん妄リスクのある薬剤が処方されている（薬剤マスタで照合）",
  },
];

/** カテゴリーの表示ラベル */
export const ASSESSMENT_CATEGORY_LABELS: Record<AssessmentCategory, string> = {
  MEDICAL_HISTORY: "既往歴・手術歴（手動入力）",
  AGE: "年齢（自動判定）",
  RISK_DRUG: "リスク薬剤（自動判定）",
};

/** 判定ソースの表示ラベル */
export const ASSESSMENT_SOURCE_LABELS: Record<AssessmentSource, string> = {
  MANUAL: "手動入力",
  AUTO: "自動判定",
};
