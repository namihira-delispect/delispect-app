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

// =============================================================================
// 患者入院詳細画面用の型定義
// =============================================================================

/** バイタルサイン表示用 */
export interface VitalSignDisplay {
  /** 体温 */
  bodyTemperature: number | null;
  /** 脈拍 */
  pulse: number | null;
  /** 収縮期血圧 */
  systolicBp: number | null;
  /** 拡張期血圧 */
  diastolicBp: number | null;
  /** SpO2 */
  spo2: number | null;
  /** 測定日時 */
  measuredAt: string;
}

/** 採血結果表示用 */
export interface LabResultDisplay {
  /** 項目コード */
  itemCode: string;
  /** 項目名 */
  itemName: string;
  /** 値 */
  value: number;
  /** 測定日時 */
  measuredAt: string;
}

/** 処方薬剤表示用 */
export interface PrescriptionDisplay {
  /** 薬剤名 */
  drugName: string;
  /** 処方種別 */
  prescriptionType: string;
  /** 処方日時 */
  prescribedAt: string;
  /** リスク薬剤フラグ */
  isRiskDrug: boolean;
}

/** ケア関連情報表示用 */
export interface CareInfoDisplay {
  /** 痛みの状態 */
  painStatus: string | null;
  /** 便秘の状態 */
  constipationStatus: string | null;
  /** 処方薬剤一覧 */
  prescriptions: PrescriptionDisplay[];
  /** 評価日時 */
  assessedAt: string | null;
}

/** リスク評価情報表示用 */
export interface RiskAssessmentDisplay {
  /** リスク評価結果 */
  riskLevel: string;
  /** リスク要因 */
  riskFactors: Record<string, unknown>;
  /** リスクスコア（MLスナップショットから） */
  riskScore: number | null;
  /** 評価日時 */
  assessedAt: string;
  /** 評価者名 */
  assessedBy: string;
}

/** ケアプランアイテム表示用 */
export interface CarePlanItemDisplay {
  /** カテゴリー */
  category: string;
  /** ステータス */
  status: string;
  /** 指示内容 */
  instructions: string | null;
}

/** ケアプラン情報表示用 */
export interface CarePlanDisplay {
  /** ケアプランID */
  id: number;
  /** ケアプランアイテム一覧 */
  items: CarePlanItemDisplay[];
  /** 作成日時 */
  createdAt: string;
  /** 更新日時 */
  updatedAt: string;
  /** 作成者名 */
  createdBy: string;
}

/** 患者入院詳細レスポンス */
export interface AdmissionDetailResponse {
  /** 入院レコードID */
  admissionId: number;
  /** バージョン（楽観的ロック用） */
  version: number;
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
  admissionDate: string;
  /** 退院日 */
  dischargeDate: string | null;
  /** 病棟 */
  ward: string | null;
  /** 病室 */
  room: string | null;
  /** 主治医（最新リスク評価の評価者） */
  attendingDoctor: string | null;
  /** 最新バイタルサイン */
  latestVitalSign: VitalSignDisplay | null;
  /** 採血結果一覧（最新のもの） */
  labResults: LabResultDisplay[];
  /** ケア関連情報 */
  careInfo: CareInfoDisplay;
  /** リスク評価情報一覧 */
  riskAssessments: RiskAssessmentDisplay[];
  /** ケアプラン情報 */
  carePlan: CarePlanDisplay | null;
  /** せん妄ハイリスク判定 */
  isHighRisk: boolean;
}

/** 処方種別の表示ラベル */
export const PRESCRIPTION_TYPE_LABELS: Record<string, string> = {
  ORAL: "内服",
  INJECTION: "注射",
  EXTERNAL: "外用",
};

/** ケアプランカテゴリーの表示ラベル */
export const CARE_PLAN_CATEGORY_LABELS: Record<string, string> = {
  MEDICATION: "薬剤管理",
  PAIN: "疼痛管理",
  DEHYDRATION: "脱水管理",
  CONSTIPATION: "便秘管理",
  INFLAMMATION: "炎症管理",
  MOBILITY: "離床促進",
  DEMENTIA: "認知症ケア",
  SAFETY: "安全管理",
  SLEEP: "睡眠管理",
  INFORMATION: "情報提供",
};

/** ケアプランアイテムステータスの表示ラベル */
export const CARE_PLAN_ITEM_STATUS_LABELS: Record<string, string> = {
  NOT_STARTED: "未着手",
  IN_PROGRESS: "実施中",
  COMPLETED: "完了",
  NOT_APPLICABLE: "該当なし",
};

/** 採血項目コードの表示名 */
export const LAB_ITEM_NAMES: Record<string, string> = {
  CRP: "CRP",
  WBC: "WBC",
  HCT: "Ht",
  HGB: "Hb",
  RBC: "RBC",
  PLT: "PLT",
  ALB: "ALB",
  BUN: "BUN",
  CRE: "CRE",
  NA: "Na",
  K: "K",
  CL: "Cl",
  AST: "AST",
  ALT: "ALT",
  LDH: "LDH",
  GGT: "GGT",
  TBIL: "TBIL",
  GLU: "GLU",
};
