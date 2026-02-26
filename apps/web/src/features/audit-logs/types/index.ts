import type { SortDirection } from "@/shared/types";

/** 監査ログ一覧の表示用レコード */
export interface AuditLogEntry {
  id: string; // bigintをstringで表現（JSON互換）
  actorId: number;
  actorUsername: string;
  action: string;
  targetType: string;
  targetId: string;
  occurredAt: string; // ISO8601文字列
  ipAddress: string | null;
  beforeData: Record<string, unknown> | null;
  afterData: Record<string, unknown> | null;
}

/** マスキング済み監査ログレコード */
export interface MaskedAuditLogEntry extends AuditLogEntry {
  /** マスキング済みユーザー名 */
  maskedActorUsername: string;
  /** マスキング済み患者名（afterData/beforeDataから抽出した場合） */
  maskedPatientName: string | null;
}

/** 監査ログ検索条件 */
export interface AuditLogSearchParams {
  /** 開始日時 */
  startDate?: string;
  /** 終了日時 */
  endDate?: string;
  /** ユーザーID（部分一致） */
  username?: string;
  /** 操作種別（複数選択） */
  actions?: string[];
  /** 患者ID */
  patientId?: string;
  /** IPアドレス */
  ipAddress?: string;
  /** フリーワード */
  keyword?: string;
  /** ソートカラム */
  sortColumn?: string;
  /** ソート方向 */
  sortDirection?: SortDirection;
  /** ページ番号（1始まり） */
  page?: number;
  /** ページサイズ */
  pageSize?: number;
}

/** 監査ログ一覧レスポンス */
export interface AuditLogListResponse {
  logs: MaskedAuditLogEntry[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** 検索条件保存データ */
export interface SavedSearchCondition {
  name: string;
  params: AuditLogSearchParams;
  createdAt: string;
}

/** 操作種別の表示ラベル */
export const ACTION_LABELS: Record<string, string> = {
  LOGIN: "ログイン",
  LOGOUT: "ログアウト",
  LOGIN_FAILED: "ログイン失敗",
  VIEW: "閲覧",
  CREATE: "登録",
  UPDATE: "更新",
  DELETE: "削除",
  SETTINGS_CHANGE: "設定変更",
  EMR_SYNC: "電子カルテ同期",
};

/** 操作対象種別の表示ラベル */
export const TARGET_TYPE_LABELS: Record<string, string> = {
  SESSION: "セッション",
  PATIENT: "患者",
  ADMISSION: "入院",
  RISK_ASSESSMENT: "リスク評価",
  CARE_PLAN: "ケアプラン",
  HIGH_RISK_CARE_KASAN: "ハイリスクケア加算",
  USER: "ユーザー",
  ROLE: "ロール",
  SYSTEM_SETTING: "システム設定",
  EMR_DATA: "電子カルテデータ",
  IMPORT: "インポート",
};
