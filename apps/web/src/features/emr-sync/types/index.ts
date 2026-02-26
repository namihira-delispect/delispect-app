/**
 * 電子カルテ同期機能の型定義
 */

/** 同期ステータス */
export type EmrSyncStatus = "idle" | "syncing" | "success" | "error" | "locked";

/** 同期結果の概要 */
export interface EmrSyncResult {
  /** 処理した入院レコード数 */
  totalAdmissions: number;
  /** 成功した入院レコード数 */
  successCount: number;
  /** 失敗した入院レコード数 */
  failedCount: number;
  /** 失敗した入院ID一覧 */
  failedAdmissionIds: string[];
  /** バイタルサイン件数 */
  vitalSignCount: number;
  /** 検査値件数 */
  labResultCount: number;
  /** 処方件数 */
  prescriptionCount: number;
  /** 同期開始時刻 */
  startedAt: string;
  /** 同期完了時刻 */
  completedAt: string;
}

/** 手動インポートの入力パラメータ */
export interface ManualImportInput {
  startDate: string;
  endDate: string;
}

/** 電子カルテAPIのバイタルサインデータ */
export interface EmrVitalSignData {
  admissionId: string;
  bodyTemperature?: number;
  pulse?: number;
  systolicBp?: number;
  diastolicBp?: number;
  spo2?: number;
  respiratoryRate?: number;
  measuredAt: string;
}

/** 電子カルテAPIの検査値データ */
export interface EmrLabResultData {
  admissionId: string;
  itemCode: string;
  value: number;
  measuredAt: string;
}

/** 電子カルテAPIの処方データ */
export interface EmrPrescriptionData {
  admissionId: string;
  yjCode?: string;
  drugName: string;
  prescriptionType: string;
  prescribedAt: string;
}

/** 電子カルテAPIの入院データ */
export interface EmrAdmissionData {
  externalAdmissionId: string;
  patientId: string;
  lastName: string;
  firstName: string;
  lastNameKana?: string;
  firstNameKana?: string;
  birthday: string;
  sex: string;
  admissionDate: string;
  admissionTime?: string;
  ageAtAdmission?: number;
  height?: number;
  weight?: number;
  ward?: string;
  room?: string;
}

/** 電子カルテAPIレスポンス（入院ごとの統合データ） */
export interface EmrPatientDataResponse {
  admission: EmrAdmissionData;
  vitalSigns: EmrVitalSignData[];
  labResults: EmrLabResultData[];
  prescriptions: EmrPrescriptionData[];
}

/** インポートロック情報 */
export interface ImportLockInfo {
  id: number;
  lockKey: string;
  userId: number;
  isActive: boolean;
  expiresAt: string;
}

/** バッチインポート設定 */
export interface BatchImportConfig {
  /** 実行時刻 (HH:mm) */
  executionTime: string;
  /** 対象日数（実行日の何日前から） */
  daysBack: number;
  /** リトライ上限回数 */
  maxRetries: number;
}

/** バッチインポートのデフォルト設定 */
export const DEFAULT_BATCH_CONFIG: BatchImportConfig = {
  executionTime: "03:00",
  daysBack: 2,
  maxRetries: 3,
};

/** 日付範囲の最大日数 */
export const MAX_DATE_RANGE_DAYS = 7;

/** インポートロックキー */
export const IMPORT_LOCK_KEY = "emr_sync";

/** ロックの有効期間（ミリ秒）：30分 */
export const LOCK_EXPIRY_MS = 30 * 60 * 1000;
