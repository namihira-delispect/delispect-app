/**
 * 監査ログの型定義
 *
 * 医療情報セキュリティガイドライン準拠の監査ログ記録に必要な
 * 型・定数を定義する。
 */

/** 操作種別 */
export const AUDIT_ACTIONS = {
  // アクセス系
  LOGIN: "LOGIN",
  LOGOUT: "LOGOUT",
  LOGIN_FAILED: "LOGIN_FAILED",

  // CRUD操作系
  VIEW: "VIEW",
  CREATE: "CREATE",
  UPDATE: "UPDATE",
  DELETE: "DELETE",

  // システム設定変更
  SETTINGS_CHANGE: "SETTINGS_CHANGE",

  // 電子カルテ連携
  EMR_SYNC: "EMR_SYNC",
} as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS];

/** 操作対象種別 */
export const AUDIT_TARGET_TYPES = {
  SESSION: "SESSION",
  PATIENT: "PATIENT",
  ADMISSION: "ADMISSION",
  RISK_ASSESSMENT: "RISK_ASSESSMENT",
  CARE_PLAN: "CARE_PLAN",
  HIGH_RISK_CARE_KASAN: "HIGH_RISK_CARE_KASAN",
  USER: "USER",
  ROLE: "ROLE",
  SYSTEM_SETTING: "SYSTEM_SETTING",
  EMR_DATA: "EMR_DATA",
  IMPORT: "IMPORT",
  DATA_MAPPING: "DATA_MAPPING",
} as const;

export type AuditTargetType = (typeof AUDIT_TARGET_TYPES)[keyof typeof AUDIT_TARGET_TYPES];

/** 監査ログ記録の入力パラメータ */
export interface AuditLogInput {
  /** 操作を行ったユーザーのID */
  actorId: number;
  /** 操作種別 */
  action: AuditAction;
  /** 操作対象の種別 */
  targetType: AuditTargetType;
  /** 操作対象のID */
  targetId: string;
  /** 操作前のデータ（更新・削除時） */
  beforeData?: Record<string, unknown> | null;
  /** 操作後のデータ（登録・更新時） */
  afterData?: Record<string, unknown> | null;
  /** アクセス元IPアドレス */
  ipAddress?: string;
}

/** 監査ログレコード（DB保存後） */
export interface AuditLogRecord {
  id: bigint;
  actorId: number;
  action: string;
  targetType: string;
  targetId: string;
  beforeData: Record<string, unknown> | null;
  afterData: Record<string, unknown> | null;
  hash: string;
  prevHash: string | null;
  occurredAt: Date;
}
