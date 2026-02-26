import { describe, it, expect } from "vitest";
import {
  RoleName,
  hasPermission,
  ROLE_PERMISSIONS,
  PermissionCode,
} from "../roles";

describe("ロールベースアクセス制御", () => {
  describe("ロール定義", () => {
    it("3つのロールが定義されている", () => {
      const roles = Object.values(RoleName);
      expect(roles).toHaveLength(3);
      expect(roles).toContain("GENERAL_USER");
      expect(roles).toContain("SYSTEM_ADMIN");
      expect(roles).toContain("SUPER_ADMIN");
    });
  });

  describe("一般ユーザーの権限", () => {
    it("患者情報の閲覧が可能", () => {
      expect(
        hasPermission(RoleName.GENERAL_USER, PermissionCode.PATIENT_VIEW)
      ).toBe(true);
    });

    it("ケアプランの作成・編集が可能", () => {
      expect(
        hasPermission(RoleName.GENERAL_USER, PermissionCode.CARE_PLAN_EDIT)
      ).toBe(true);
    });

    it("ユーザー管理にはアクセス不可", () => {
      expect(
        hasPermission(RoleName.GENERAL_USER, PermissionCode.USER_MANAGE)
      ).toBe(false);
    });

    it("システム設定にはアクセス不可", () => {
      expect(
        hasPermission(RoleName.GENERAL_USER, PermissionCode.SYSTEM_SETTINGS)
      ).toBe(false);
    });
  });

  describe("システム管理者の権限", () => {
    it("マスタデータ管理が可能", () => {
      expect(
        hasPermission(RoleName.SYSTEM_ADMIN, PermissionCode.MASTER_DATA_MANAGE)
      ).toBe(true);
    });

    it("監査ログ閲覧が可能", () => {
      expect(
        hasPermission(RoleName.SYSTEM_ADMIN, PermissionCode.AUDIT_LOG_VIEW)
      ).toBe(true);
    });

    it("患者情報にはアクセス不可", () => {
      expect(
        hasPermission(RoleName.SYSTEM_ADMIN, PermissionCode.PATIENT_VIEW)
      ).toBe(false);
    });

    it("ユーザー管理にはアクセス不可", () => {
      expect(
        hasPermission(RoleName.SYSTEM_ADMIN, PermissionCode.USER_MANAGE)
      ).toBe(false);
    });
  });

  describe("全権管理者の権限", () => {
    it("すべての操作が可能", () => {
      const allPermissions = Object.values(PermissionCode);
      for (const permission of allPermissions) {
        expect(hasPermission(RoleName.SUPER_ADMIN, permission)).toBe(true);
      }
    });
  });

  describe("hasPermission", () => {
    it("複数ロールのいずれかが権限を持てばtrue", () => {
      const roles = [RoleName.GENERAL_USER, RoleName.SYSTEM_ADMIN];
      const hasAny = roles.some((role) =>
        hasPermission(role, PermissionCode.PATIENT_VIEW)
      );
      expect(hasAny).toBe(true);
    });
  });

  describe("ROLE_PERMISSIONS", () => {
    it("各ロールの権限セットが定義されている", () => {
      expect(ROLE_PERMISSIONS[RoleName.GENERAL_USER]).toBeDefined();
      expect(ROLE_PERMISSIONS[RoleName.SYSTEM_ADMIN]).toBeDefined();
      expect(ROLE_PERMISSIONS[RoleName.SUPER_ADMIN]).toBeDefined();
    });
  });
});
