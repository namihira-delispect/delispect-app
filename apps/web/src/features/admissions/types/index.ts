import type { SortDirection } from "@/shared/types";

/** リスク評価レベル表示用 */
export type RiskLevelDisplay = "HIGH" | "LOW" | "NOT_ASSESSED";

/** ケア実施状況表示用 */
export type CareStatusDisplay = "COMPLETED" | "IN_PROGRESS" | "NOT_STARTED";

/** 性別の表示ラベル */
export const GENDER_LABELS: Record<string, string> = {
  MALE: "男",
  FEMALE: "女",
  OTHER: "他",
  UNKNOWN: "不明",
};

/** リスク評価の表示ラベル */
export const RISK_LEVEL_LABELS: Record<RiskLevelDisplay, string> = {
  HIGH: "高",
  LOW: "低",
  NOT_ASSESSED: "未実施",
};

/** ケア実施状況の表示ラベル */
export const CARE_STATUS_LABELS: Record<CareStatusDisplay, string> = {
  COMPLETED: "完了",
  IN_PROGRESS: "実施中",
  NOT_STARTED: "未実施",
};

/** リスク評価フィルター選択肢 */
export const RISK_LEVEL_OPTIONS: { value: RiskLevelDisplay; label: string }[] = [
  { value: "HIGH", label: "高" },
  { value: "LOW", label: "低" },
  { value: "NOT_ASSESSED", label: "未実施" },
];

/** ケア実施状況フィルター選択肢 */
export const CARE_STATUS_OPTIONS: { value: CareStatusDisplay; label: string }[] = [
  { value: "COMPLETED", label: "完了" },
  { value: "IN_PROGRESS", label: "実施中" },
  { value: "NOT_STARTED", label: "未実施" },
];

/** 患者入院一覧の表示用レコード */
export interface AdmissionListEntry {
  /** 入院レコードID */
  admissionId: number;
  /** 患者ID（外部） */
  patientId: string;
  /** 患者内部ID */
  patientInternalId: number;
  /** 患者氏名 */
  patientName: string;
  /** 患者フリガナ */
  patientNameKana: string | null;
  /** 年齢（入院時） */
  age: number | null;
  /** 性別 */
  gender: string;
  /** 入院日 */
  admissionDate: string; // YYYY-MM-DD
  /** 70歳以上 */
  isOver70: boolean;
  /** リスク薬剤の有無 */
  hasRiskDrug: boolean;
  /** 認知症の有無 */
  hasDementia: boolean | null;
  /** 脳器質的障害の有無 */
  hasOrganicBrainDamage: boolean | null;
  /** アルコール多飲の有無 */
  isHeavyAlcohol: boolean | null;
  /** せん妄既往の有無 */
  hasDeliriumHistory: boolean | null;
  /** 全身麻酔の有無 */
  hasGeneralAnesthesia: boolean | null;
  /** せん妄ハイリスク判定 */
  isHighRisk: boolean;
  /** AIリスク判定 */
  aiRiskLevel: RiskLevelDisplay;
  /** ケア実施状況 */
  careStatus: CareStatusDisplay;
  /** ケアプランID（遷移用） */
  carePlanId: number | null;
  /** 最新リスク評価日 */
  latestAssessmentDate: string | null;
}

/** 患者入院一覧の検索条件 */
export interface AdmissionSearchParams {
  /** リスク評価フィルター */
  riskLevel?: RiskLevelDisplay;
  /** ケア実施状況フィルター */
  careStatus?: CareStatusDisplay;
  /** 入院日（開始） */
  admissionDateFrom?: string;
  /** 入院日（終了） */
  admissionDateTo?: string;
  /** 評価日（開始） */
  assessmentDateFrom?: string;
  /** 評価日（終了） */
  assessmentDateTo?: string;
  /** 名前（部分一致） */
  name?: string;
  /** ソートカラム */
  sortColumn?: string;
  /** ソート方向 */
  sortDirection?: SortDirection;
  /** ページ番号（1始まり） */
  page?: number;
  /** ページサイズ */
  pageSize?: number;
}

/** 患者入院一覧レスポンス */
export interface AdmissionListResponse {
  admissions: AdmissionListEntry[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** 一括リスク評価リクエスト */
export interface BatchRiskAssessmentRequest {
  admissionIds: number[];
}

/** 一括リスク評価レスポンス */
export interface BatchRiskAssessmentResponse {
  successCount: number;
  failureCount: number;
  results: {
    admissionId: number;
    success: boolean;
    error?: string;
  }[];
}
