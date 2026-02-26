import type { UserRole } from "@/shared/types";

/**
 * パーミッションコード一覧
 *
 * カテゴリごとにグループ化された権限定義。
 * Seedデータ及びアクセス制御で使用する。
 */
export const PERMISSION_CODES = {
  // 患者情報
  PATIENT_VIEW: "patient:view",
  PATIENT_EDIT: "patient:edit",

  // ケアプラン
  CARE_PLAN_CREATE: "care_plan:create",
  CARE_PLAN_EDIT: "care_plan:edit",
  CARE_PLAN_VIEW: "care_plan:view",

  // 電子カルテ同期
  EMR_SYNC: "emr:sync",

  // リスク評価
  RISK_ASSESSMENT_VIEW: "risk_assessment:view",
  RISK_ASSESSMENT_CREATE: "risk_assessment:create",

  // ハイリスクケア加算
  HIGH_RISK_CARE_VIEW: "high_risk_care:view",
  HIGH_RISK_CARE_ASSESS: "high_risk_care:assess",

  // マスタデータ管理
  MASTER_DATA_VIEW: "master_data:view",
  MASTER_DATA_EDIT: "master_data:edit",

  // 基準値設定
  REFERENCE_VALUE_VIEW: "reference_value:view",
  REFERENCE_VALUE_EDIT: "reference_value:edit",

  // 監査ログ
  AUDIT_LOG_VIEW: "audit_log:view",

  // システム設定
  SYSTEM_SETTING_VIEW: "system_setting:view",
  SYSTEM_SETTING_EDIT: "system_setting:edit",

  // データマッピング
  DATA_MAPPING_VIEW: "data_mapping:view",
  DATA_MAPPING_EDIT: "data_mapping:edit",

  // ユーザー管理
  USER_MANAGE: "user:manage",

  // ロール管理
  ROLE_MANAGE: "role:manage",
} as const;

export type PermissionCode =
  (typeof PERMISSION_CODES)[keyof typeof PERMISSION_CODES];

/**
 * ロール名の定数定義
 */
export const ROLE_NAMES = {
  GENERAL: "GENERAL",
  SYSTEM_ADMIN: "SYSTEM_ADMIN",
  SUPER_ADMIN: "SUPER_ADMIN",
} as const;

/**
 * ロール別の権限マッピング
 *
 * 要件定義1.2節に基づく:
 * - 一般ユーザー: 患者情報表示、ケアプラン作成・編集、電子カルテ同期
 * - システム管理者: マスタデータ管理・基準値設定・監査ログ閲覧。患者情報アクセス不可
 * - 全権管理者: すべての操作
 */
export const ROLE_PERMISSIONS: Record<UserRole, PermissionCode[]> = {
  GENERAL: [
    PERMISSION_CODES.PATIENT_VIEW,
    PERMISSION_CODES.PATIENT_EDIT,
    PERMISSION_CODES.CARE_PLAN_CREATE,
    PERMISSION_CODES.CARE_PLAN_EDIT,
    PERMISSION_CODES.CARE_PLAN_VIEW,
    PERMISSION_CODES.EMR_SYNC,
    PERMISSION_CODES.RISK_ASSESSMENT_VIEW,
    PERMISSION_CODES.RISK_ASSESSMENT_CREATE,
    PERMISSION_CODES.HIGH_RISK_CARE_VIEW,
    PERMISSION_CODES.HIGH_RISK_CARE_ASSESS,
  ],
  SYSTEM_ADMIN: [
    PERMISSION_CODES.MASTER_DATA_VIEW,
    PERMISSION_CODES.MASTER_DATA_EDIT,
    PERMISSION_CODES.REFERENCE_VALUE_VIEW,
    PERMISSION_CODES.REFERENCE_VALUE_EDIT,
    PERMISSION_CODES.AUDIT_LOG_VIEW,
    PERMISSION_CODES.SYSTEM_SETTING_VIEW,
    PERMISSION_CODES.SYSTEM_SETTING_EDIT,
    PERMISSION_CODES.DATA_MAPPING_VIEW,
    PERMISSION_CODES.DATA_MAPPING_EDIT,
  ],
  SUPER_ADMIN: [
    // 全権管理者はすべての権限を持つ
    PERMISSION_CODES.PATIENT_VIEW,
    PERMISSION_CODES.PATIENT_EDIT,
    PERMISSION_CODES.CARE_PLAN_CREATE,
    PERMISSION_CODES.CARE_PLAN_EDIT,
    PERMISSION_CODES.CARE_PLAN_VIEW,
    PERMISSION_CODES.EMR_SYNC,
    PERMISSION_CODES.RISK_ASSESSMENT_VIEW,
    PERMISSION_CODES.RISK_ASSESSMENT_CREATE,
    PERMISSION_CODES.HIGH_RISK_CARE_VIEW,
    PERMISSION_CODES.HIGH_RISK_CARE_ASSESS,
    PERMISSION_CODES.MASTER_DATA_VIEW,
    PERMISSION_CODES.MASTER_DATA_EDIT,
    PERMISSION_CODES.REFERENCE_VALUE_VIEW,
    PERMISSION_CODES.REFERENCE_VALUE_EDIT,
    PERMISSION_CODES.AUDIT_LOG_VIEW,
    PERMISSION_CODES.SYSTEM_SETTING_VIEW,
    PERMISSION_CODES.SYSTEM_SETTING_EDIT,
    PERMISSION_CODES.DATA_MAPPING_VIEW,
    PERMISSION_CODES.DATA_MAPPING_EDIT,
    PERMISSION_CODES.USER_MANAGE,
    PERMISSION_CODES.ROLE_MANAGE,
  ],
};

/**
 * ページパスとアクセス可能ロールのマッピング
 *
 * 要件定義のメニュー構造に基づく。
 * 指定なしのパスはすべてのロールでアクセス可能。
 */
export const PAGE_ROLE_MAP: Record<string, UserRole[]> = {
  "/patients": ["GENERAL", "SUPER_ADMIN"],
  "/admin": ["SYSTEM_ADMIN", "SUPER_ADMIN"],
  "/admin/users": ["SUPER_ADMIN"],
  "/admin/medicines": ["SYSTEM_ADMIN", "SUPER_ADMIN"],
  "/admin/reference-values": ["SYSTEM_ADMIN", "SUPER_ADMIN"],
  "/admin/settings": ["SYSTEM_ADMIN", "SUPER_ADMIN"],
  "/admin/data-mapping": ["SYSTEM_ADMIN", "SUPER_ADMIN"],
  "/admin/audit-logs": ["SYSTEM_ADMIN", "SUPER_ADMIN"],
  "/settings": ["GENERAL", "SYSTEM_ADMIN", "SUPER_ADMIN"],
};
