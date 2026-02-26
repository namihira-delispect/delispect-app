/** ロール名の定義 */
export const RoleName = {
  /** 一般ユーザー（看護師・医師） */
  GENERAL_USER: "GENERAL_USER",
  /** システム管理者 */
  SYSTEM_ADMIN: "SYSTEM_ADMIN",
  /** 全権管理者 */
  SUPER_ADMIN: "SUPER_ADMIN",
} as const;

export type RoleName = (typeof RoleName)[keyof typeof RoleName];

/** 権限コードの定義 */
export const PermissionCode = {
  /** 患者情報の閲覧 */
  PATIENT_VIEW: "PATIENT_VIEW",
  /** ケアプランの編集 */
  CARE_PLAN_EDIT: "CARE_PLAN_EDIT",
  /** 電子カルテ同期 */
  EMR_SYNC: "EMR_SYNC",
  /** リスク評価 */
  RISK_ASSESSMENT: "RISK_ASSESSMENT",
  /** マスタデータ管理 */
  MASTER_DATA_MANAGE: "MASTER_DATA_MANAGE",
  /** 基準値設定 */
  REFERENCE_VALUE_SETTINGS: "REFERENCE_VALUE_SETTINGS",
  /** 監査ログ閲覧 */
  AUDIT_LOG_VIEW: "AUDIT_LOG_VIEW",
  /** システム設定 */
  SYSTEM_SETTINGS: "SYSTEM_SETTINGS",
  /** データマッピング管理 */
  DATA_MAPPING_MANAGE: "DATA_MAPPING_MANAGE",
  /** ユーザー管理 */
  USER_MANAGE: "USER_MANAGE",
  /** ロール管理 */
  ROLE_MANAGE: "ROLE_MANAGE",
} as const;

export type PermissionCode =
  (typeof PermissionCode)[keyof typeof PermissionCode];

/** ロールごとの権限マッピング */
export const ROLE_PERMISSIONS: Record<RoleName, ReadonlySet<PermissionCode>> = {
  [RoleName.GENERAL_USER]: new Set<PermissionCode>([
    PermissionCode.PATIENT_VIEW,
    PermissionCode.CARE_PLAN_EDIT,
    PermissionCode.EMR_SYNC,
    PermissionCode.RISK_ASSESSMENT,
  ]),
  [RoleName.SYSTEM_ADMIN]: new Set<PermissionCode>([
    PermissionCode.MASTER_DATA_MANAGE,
    PermissionCode.REFERENCE_VALUE_SETTINGS,
    PermissionCode.AUDIT_LOG_VIEW,
    PermissionCode.SYSTEM_SETTINGS,
    PermissionCode.DATA_MAPPING_MANAGE,
  ]),
  [RoleName.SUPER_ADMIN]: new Set<PermissionCode>(
    Object.values(PermissionCode) as PermissionCode[]
  ),
};

/**
 * 指定されたロールが特定の権限を持つかどうかを確認する
 */
export function hasPermission(
  role: RoleName,
  permission: PermissionCode
): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  return permissions.has(permission);
}

/**
 * ユーザーが持つ複数ロールのいずれかが特定の権限を持つかどうかを確認する
 */
export function hasAnyPermission(
  roles: RoleName[],
  permission: PermissionCode
): boolean {
  return roles.some((role) => hasPermission(role, permission));
}
