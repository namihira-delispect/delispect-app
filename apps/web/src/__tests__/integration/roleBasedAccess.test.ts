/**
 * 統合テスト: ロール別アクセス制御
 *
 * 要件定義に基づく3つのロールのアクセス制御を検証する:
 * - 一般ユーザー（GENERAL）: 患者情報・ケアプラン操作可、管理画面不可
 * - システム管理者（SYSTEM_ADMIN）: マスタ管理・システム設定可、患者情報不可
 * - 全権管理者（SUPER_ADMIN）: すべての操作が可能
 */
import { describe, it, expect } from "vitest";
import {
  hasRole,
  hasAnyRole,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getPermissionsForRoles,
  canAccessPage,
} from "@/lib/auth/authorization";
import { PERMISSION_CODES, ROLE_PERMISSIONS } from "@/lib/auth/permissions";
import type { UserRole } from "@/shared/types";

// ============================================================
// テスト用ロール定義
// ============================================================
const GENERAL_ROLES: UserRole[] = ["GENERAL"];
const SYSTEM_ADMIN_ROLES: UserRole[] = ["SYSTEM_ADMIN"];
const SUPER_ADMIN_ROLES: UserRole[] = ["SUPER_ADMIN"];

describe("統合テスト: ロール別アクセス制御", () => {
  describe("一般ユーザーのアクセス権限", () => {
    it("患者情報の表示権限を持つ", () => {
      expect(hasPermission(GENERAL_ROLES, PERMISSION_CODES.PATIENT_VIEW)).toBe(true);
    });

    it("患者情報の編集権限を持つ", () => {
      expect(hasPermission(GENERAL_ROLES, PERMISSION_CODES.PATIENT_EDIT)).toBe(true);
    });

    it("ケアプランの作成・編集・閲覧権限を持つ", () => {
      expect(hasPermission(GENERAL_ROLES, PERMISSION_CODES.CARE_PLAN_CREATE)).toBe(true);
      expect(hasPermission(GENERAL_ROLES, PERMISSION_CODES.CARE_PLAN_EDIT)).toBe(true);
      expect(hasPermission(GENERAL_ROLES, PERMISSION_CODES.CARE_PLAN_VIEW)).toBe(true);
    });

    it("電子カルテ同期権限を持つ", () => {
      expect(hasPermission(GENERAL_ROLES, PERMISSION_CODES.EMR_SYNC)).toBe(true);
    });

    it("リスク評価の閲覧・作成権限を持つ", () => {
      expect(hasPermission(GENERAL_ROLES, PERMISSION_CODES.RISK_ASSESSMENT_VIEW)).toBe(true);
      expect(hasPermission(GENERAL_ROLES, PERMISSION_CODES.RISK_ASSESSMENT_CREATE)).toBe(true);
    });

    it("ハイリスクケア加算の閲覧・評価権限を持つ", () => {
      expect(hasPermission(GENERAL_ROLES, PERMISSION_CODES.HIGH_RISK_CARE_VIEW)).toBe(true);
      expect(hasPermission(GENERAL_ROLES, PERMISSION_CODES.HIGH_RISK_CARE_ASSESS)).toBe(true);
    });

    it("マスタデータ管理権限を持たない", () => {
      expect(hasPermission(GENERAL_ROLES, PERMISSION_CODES.MASTER_DATA_VIEW)).toBe(false);
      expect(hasPermission(GENERAL_ROLES, PERMISSION_CODES.MASTER_DATA_EDIT)).toBe(false);
    });

    it("システム設定権限を持たない", () => {
      expect(hasPermission(GENERAL_ROLES, PERMISSION_CODES.SYSTEM_SETTING_VIEW)).toBe(false);
      expect(hasPermission(GENERAL_ROLES, PERMISSION_CODES.SYSTEM_SETTING_EDIT)).toBe(false);
    });

    it("監査ログ閲覧権限を持たない", () => {
      expect(hasPermission(GENERAL_ROLES, PERMISSION_CODES.AUDIT_LOG_VIEW)).toBe(false);
    });

    it("ユーザー管理権限を持たない", () => {
      expect(hasPermission(GENERAL_ROLES, PERMISSION_CODES.USER_MANAGE)).toBe(false);
    });

    it("管理画面（/admin）にアクセスできない", () => {
      expect(canAccessPage(GENERAL_ROLES, "/admin")).toBe(false);
      expect(canAccessPage(GENERAL_ROLES, "/admin/medicines")).toBe(false);
      expect(canAccessPage(GENERAL_ROLES, "/admin/reference-values")).toBe(false);
      expect(canAccessPage(GENERAL_ROLES, "/admin/settings")).toBe(false);
      expect(canAccessPage(GENERAL_ROLES, "/admin/audit-logs")).toBe(false);
      expect(canAccessPage(GENERAL_ROLES, "/admin/users")).toBe(false);
    });

    it("患者ページ（/patients）にアクセスできる", () => {
      expect(canAccessPage(GENERAL_ROLES, "/patients")).toBe(true);
    });

    it("設定ページ（/settings）にアクセスできる", () => {
      expect(canAccessPage(GENERAL_ROLES, "/settings")).toBe(true);
    });
  });

  describe("システム管理者のアクセス権限", () => {
    it("患者情報の表示権限を持たない", () => {
      expect(hasPermission(SYSTEM_ADMIN_ROLES, PERMISSION_CODES.PATIENT_VIEW)).toBe(false);
    });

    it("患者情報の編集権限を持たない", () => {
      expect(hasPermission(SYSTEM_ADMIN_ROLES, PERMISSION_CODES.PATIENT_EDIT)).toBe(false);
    });

    it("ケアプラン操作権限を持たない", () => {
      expect(hasPermission(SYSTEM_ADMIN_ROLES, PERMISSION_CODES.CARE_PLAN_CREATE)).toBe(false);
      expect(hasPermission(SYSTEM_ADMIN_ROLES, PERMISSION_CODES.CARE_PLAN_EDIT)).toBe(false);
      expect(hasPermission(SYSTEM_ADMIN_ROLES, PERMISSION_CODES.CARE_PLAN_VIEW)).toBe(false);
    });

    it("マスタデータ管理権限を持つ", () => {
      expect(hasPermission(SYSTEM_ADMIN_ROLES, PERMISSION_CODES.MASTER_DATA_VIEW)).toBe(true);
      expect(hasPermission(SYSTEM_ADMIN_ROLES, PERMISSION_CODES.MASTER_DATA_EDIT)).toBe(true);
    });

    it("基準値設定権限を持つ", () => {
      expect(hasPermission(SYSTEM_ADMIN_ROLES, PERMISSION_CODES.REFERENCE_VALUE_VIEW)).toBe(true);
      expect(hasPermission(SYSTEM_ADMIN_ROLES, PERMISSION_CODES.REFERENCE_VALUE_EDIT)).toBe(true);
    });

    it("監査ログ閲覧権限を持つ", () => {
      expect(hasPermission(SYSTEM_ADMIN_ROLES, PERMISSION_CODES.AUDIT_LOG_VIEW)).toBe(true);
    });

    it("システム設定権限を持つ", () => {
      expect(hasPermission(SYSTEM_ADMIN_ROLES, PERMISSION_CODES.SYSTEM_SETTING_VIEW)).toBe(true);
      expect(hasPermission(SYSTEM_ADMIN_ROLES, PERMISSION_CODES.SYSTEM_SETTING_EDIT)).toBe(true);
    });

    it("データマッピング権限を持つ", () => {
      expect(hasPermission(SYSTEM_ADMIN_ROLES, PERMISSION_CODES.DATA_MAPPING_VIEW)).toBe(true);
      expect(hasPermission(SYSTEM_ADMIN_ROLES, PERMISSION_CODES.DATA_MAPPING_EDIT)).toBe(true);
    });

    it("解析用操作ログ権限を持つ", () => {
      expect(hasPermission(SYSTEM_ADMIN_ROLES, PERMISSION_CODES.RESEARCH_LOG_VIEW)).toBe(true);
      expect(hasPermission(SYSTEM_ADMIN_ROLES, PERMISSION_CODES.RESEARCH_LOG_EXPORT)).toBe(true);
    });

    it("ユーザー管理権限を持たない", () => {
      expect(hasPermission(SYSTEM_ADMIN_ROLES, PERMISSION_CODES.USER_MANAGE)).toBe(false);
    });

    it("管理画面（/admin）にアクセスできる", () => {
      expect(canAccessPage(SYSTEM_ADMIN_ROLES, "/admin")).toBe(true);
      expect(canAccessPage(SYSTEM_ADMIN_ROLES, "/admin/medicines")).toBe(true);
      expect(canAccessPage(SYSTEM_ADMIN_ROLES, "/admin/reference-values")).toBe(true);
      expect(canAccessPage(SYSTEM_ADMIN_ROLES, "/admin/settings")).toBe(true);
      expect(canAccessPage(SYSTEM_ADMIN_ROLES, "/admin/audit-logs")).toBe(true);
    });

    it("ユーザー管理ページ（/admin/users）にアクセスできない", () => {
      expect(canAccessPage(SYSTEM_ADMIN_ROLES, "/admin/users")).toBe(false);
    });

    it("患者ページ（/patients）にアクセスできない", () => {
      expect(canAccessPage(SYSTEM_ADMIN_ROLES, "/patients")).toBe(false);
    });

    it("設定ページ（/settings）にアクセスできる", () => {
      expect(canAccessPage(SYSTEM_ADMIN_ROLES, "/settings")).toBe(true);
    });
  });

  describe("全権管理者のアクセス権限", () => {
    it("すべての権限コードを持つ", () => {
      const allPermissions = Object.values(PERMISSION_CODES);
      for (const perm of allPermissions) {
        expect(hasPermission(SUPER_ADMIN_ROLES, perm)).toBe(true);
      }
    });

    it("患者情報の操作ができる", () => {
      expect(hasPermission(SUPER_ADMIN_ROLES, PERMISSION_CODES.PATIENT_VIEW)).toBe(true);
      expect(hasPermission(SUPER_ADMIN_ROLES, PERMISSION_CODES.PATIENT_EDIT)).toBe(true);
    });

    it("ケアプラン操作ができる", () => {
      expect(hasPermission(SUPER_ADMIN_ROLES, PERMISSION_CODES.CARE_PLAN_CREATE)).toBe(true);
      expect(hasPermission(SUPER_ADMIN_ROLES, PERMISSION_CODES.CARE_PLAN_EDIT)).toBe(true);
      expect(hasPermission(SUPER_ADMIN_ROLES, PERMISSION_CODES.CARE_PLAN_VIEW)).toBe(true);
    });

    it("マスタデータ管理ができる", () => {
      expect(hasPermission(SUPER_ADMIN_ROLES, PERMISSION_CODES.MASTER_DATA_VIEW)).toBe(true);
      expect(hasPermission(SUPER_ADMIN_ROLES, PERMISSION_CODES.MASTER_DATA_EDIT)).toBe(true);
    });

    it("ユーザー管理ができる", () => {
      expect(hasPermission(SUPER_ADMIN_ROLES, PERMISSION_CODES.USER_MANAGE)).toBe(true);
    });

    it("ロール管理ができる", () => {
      expect(hasPermission(SUPER_ADMIN_ROLES, PERMISSION_CODES.ROLE_MANAGE)).toBe(true);
    });

    it("すべてのページにアクセスできる", () => {
      expect(canAccessPage(SUPER_ADMIN_ROLES, "/patients")).toBe(true);
      expect(canAccessPage(SUPER_ADMIN_ROLES, "/admin")).toBe(true);
      expect(canAccessPage(SUPER_ADMIN_ROLES, "/admin/users")).toBe(true);
      expect(canAccessPage(SUPER_ADMIN_ROLES, "/admin/medicines")).toBe(true);
      expect(canAccessPage(SUPER_ADMIN_ROLES, "/admin/reference-values")).toBe(true);
      expect(canAccessPage(SUPER_ADMIN_ROLES, "/admin/settings")).toBe(true);
      expect(canAccessPage(SUPER_ADMIN_ROLES, "/admin/audit-logs")).toBe(true);
      expect(canAccessPage(SUPER_ADMIN_ROLES, "/settings")).toBe(true);
    });
  });

  describe("ロール判定ユーティリティ", () => {
    it("hasRoleが正しくロールを判定する", () => {
      expect(hasRole(GENERAL_ROLES, "GENERAL")).toBe(true);
      expect(hasRole(GENERAL_ROLES, "SYSTEM_ADMIN")).toBe(false);
      expect(hasRole(SYSTEM_ADMIN_ROLES, "SYSTEM_ADMIN")).toBe(true);
      expect(hasRole(SUPER_ADMIN_ROLES, "SUPER_ADMIN")).toBe(true);
    });

    it("hasAnyRoleが複数ロールの判定を正しく行う", () => {
      expect(hasAnyRole(GENERAL_ROLES, ["GENERAL", "SYSTEM_ADMIN"])).toBe(true);
      expect(hasAnyRole(GENERAL_ROLES, ["SYSTEM_ADMIN", "SUPER_ADMIN"])).toBe(false);
      expect(hasAnyRole(SYSTEM_ADMIN_ROLES, ["SYSTEM_ADMIN", "SUPER_ADMIN"])).toBe(true);
    });

    it("getPermissionsForRolesがロールに対応する権限一覧を返す", () => {
      const generalPerms = getPermissionsForRoles(GENERAL_ROLES);
      expect(generalPerms).toContain(PERMISSION_CODES.PATIENT_VIEW);
      expect(generalPerms).not.toContain(PERMISSION_CODES.MASTER_DATA_VIEW);

      const systemAdminPerms = getPermissionsForRoles(SYSTEM_ADMIN_ROLES);
      expect(systemAdminPerms).toContain(PERMISSION_CODES.MASTER_DATA_VIEW);
      expect(systemAdminPerms).not.toContain(PERMISSION_CODES.PATIENT_VIEW);

      const superAdminPerms = getPermissionsForRoles(SUPER_ADMIN_ROLES);
      expect(superAdminPerms).toContain(PERMISSION_CODES.PATIENT_VIEW);
      expect(superAdminPerms).toContain(PERMISSION_CODES.MASTER_DATA_VIEW);
      expect(superAdminPerms).toContain(PERMISSION_CODES.USER_MANAGE);
    });

    it("hasAnyPermissionが複数権限のいずれかを持つか判定する", () => {
      expect(
        hasAnyPermission(GENERAL_ROLES, [
          PERMISSION_CODES.PATIENT_VIEW,
          PERMISSION_CODES.MASTER_DATA_VIEW,
        ]),
      ).toBe(true);
      expect(
        hasAnyPermission(GENERAL_ROLES, [
          PERMISSION_CODES.MASTER_DATA_VIEW,
          PERMISSION_CODES.SYSTEM_SETTING_VIEW,
        ]),
      ).toBe(false);
    });

    it("hasAllPermissionsが全権限を持つか判定する", () => {
      expect(
        hasAllPermissions(GENERAL_ROLES, [
          PERMISSION_CODES.PATIENT_VIEW,
          PERMISSION_CODES.CARE_PLAN_VIEW,
        ]),
      ).toBe(true);
      expect(
        hasAllPermissions(GENERAL_ROLES, [
          PERMISSION_CODES.PATIENT_VIEW,
          PERMISSION_CODES.MASTER_DATA_VIEW,
        ]),
      ).toBe(false);
    });
  });

  describe("ページアクセス制御の境界テスト", () => {
    it("PAGE_ROLE_MAPに登録されていないパスはすべてのロールでアクセス可能", () => {
      expect(canAccessPage(GENERAL_ROLES, "/unknown-path")).toBe(true);
      expect(canAccessPage(SYSTEM_ADMIN_ROLES, "/unknown-path")).toBe(true);
      expect(canAccessPage(SUPER_ADMIN_ROLES, "/unknown-path")).toBe(true);
    });

    it("サブパスのアクセス制御が正しく機能する", () => {
      // /admin/users は SUPER_ADMIN のみ
      expect(canAccessPage(SYSTEM_ADMIN_ROLES, "/admin/users")).toBe(false);
      expect(canAccessPage(SUPER_ADMIN_ROLES, "/admin/users")).toBe(true);

      // /admin/users/123 も /admin/users のルールに従う
      expect(canAccessPage(SYSTEM_ADMIN_ROLES, "/admin/users/123")).toBe(false);
      expect(canAccessPage(SUPER_ADMIN_ROLES, "/admin/users/123")).toBe(true);
    });

    it("最長プレフィックスマッチが正しく機能する", () => {
      // /admin は SYSTEM_ADMIN, SUPER_ADMIN
      // /admin/users は SUPER_ADMIN のみ
      // /admin/users/xxx は /admin/users のルールに従う（最長マッチ）
      expect(canAccessPage(SYSTEM_ADMIN_ROLES, "/admin/users/edit")).toBe(false);
    });
  });

  describe("ROLE_PERMISSIONS定義の整合性テスト", () => {
    it("一般ユーザーの権限数が正しい", () => {
      expect(ROLE_PERMISSIONS.GENERAL).toHaveLength(10);
    });

    it("システム管理者の権限数が正しい", () => {
      expect(ROLE_PERMISSIONS.SYSTEM_ADMIN).toHaveLength(11);
    });

    it("全権管理者の権限にすべてのパーミッションコードが含まれる", () => {
      const allPermissions = Object.values(PERMISSION_CODES);
      for (const perm of allPermissions) {
        expect(ROLE_PERMISSIONS.SUPER_ADMIN).toContain(perm);
      }
    });

    it("全権管理者の権限数がパーミッションコード総数と一致する", () => {
      const allPermissions = Object.values(PERMISSION_CODES);
      expect(ROLE_PERMISSIONS.SUPER_ADMIN).toHaveLength(allPermissions.length);
    });
  });
});
