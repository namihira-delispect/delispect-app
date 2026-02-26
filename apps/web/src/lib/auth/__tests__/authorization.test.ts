import { describe, it, expect } from "vitest";
import type { UserRole } from "@/shared/types";
import { PERMISSION_CODES } from "../permissions";

// DB依存の関数はモック化してテストするため、純粋関数のみをテストする
// getCurrentUser, getUserRoles, authorizeServerActionはDB依存のため統合テスト対象

// 動的インポートでモック化前に関数を取得
const {
  hasRole,
  hasAnyRole,
  getPermissionsForRoles,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  canAccessPage,
} = await import("../authorization");

describe("認可ユーティリティ関数", () => {
  describe("hasRole", () => {
    it("ユーザーが指定ロールを持っている場合trueを返す", () => {
      const roles: UserRole[] = ["GENERAL", "SYSTEM_ADMIN"];
      expect(hasRole(roles, "GENERAL")).toBe(true);
      expect(hasRole(roles, "SYSTEM_ADMIN")).toBe(true);
    });

    it("ユーザーが指定ロールを持っていない場合falseを返す", () => {
      const roles: UserRole[] = ["GENERAL"];
      expect(hasRole(roles, "SUPER_ADMIN")).toBe(false);
      expect(hasRole(roles, "SYSTEM_ADMIN")).toBe(false);
    });

    it("空のロール一覧の場合falseを返す", () => {
      const roles: UserRole[] = [];
      expect(hasRole(roles, "GENERAL")).toBe(false);
    });
  });

  describe("hasAnyRole", () => {
    it("必要なロールのいずれかを持っている場合trueを返す", () => {
      const userRoles: UserRole[] = ["GENERAL"];
      expect(hasAnyRole(userRoles, ["GENERAL", "SUPER_ADMIN"])).toBe(true);
    });

    it("必要なロールをいずれも持っていない場合falseを返す", () => {
      const userRoles: UserRole[] = ["GENERAL"];
      expect(hasAnyRole(userRoles, ["SYSTEM_ADMIN", "SUPER_ADMIN"])).toBe(
        false,
      );
    });

    it("空の必要ロール一覧の場合falseを返す", () => {
      const userRoles: UserRole[] = ["GENERAL"];
      expect(hasAnyRole(userRoles, [])).toBe(false);
    });

    it("空のユーザーロール一覧の場合falseを返す", () => {
      const userRoles: UserRole[] = [];
      expect(hasAnyRole(userRoles, ["GENERAL"])).toBe(false);
    });
  });

  describe("getPermissionsForRoles", () => {
    it("一般ユーザーの権限一覧を返す", () => {
      const perms = getPermissionsForRoles(["GENERAL"]);
      expect(perms).toContain(PERMISSION_CODES.PATIENT_VIEW);
      expect(perms).toContain(PERMISSION_CODES.CARE_PLAN_CREATE);
      expect(perms).not.toContain(PERMISSION_CODES.MASTER_DATA_VIEW);
    });

    it("複数ロールの権限を統合して返す", () => {
      const perms = getPermissionsForRoles(["GENERAL", "SYSTEM_ADMIN"]);
      expect(perms).toContain(PERMISSION_CODES.PATIENT_VIEW);
      expect(perms).toContain(PERMISSION_CODES.MASTER_DATA_VIEW);
      expect(perms).toContain(PERMISSION_CODES.AUDIT_LOG_VIEW);
    });

    it("重複する権限は排除される", () => {
      const perms = getPermissionsForRoles(["GENERAL", "SUPER_ADMIN"]);
      const patientViewCount = perms.filter(
        (p) => p === PERMISSION_CODES.PATIENT_VIEW,
      ).length;
      expect(patientViewCount).toBe(1);
    });

    it("空のロール一覧の場合は空配列を返す", () => {
      const perms = getPermissionsForRoles([]);
      expect(perms).toEqual([]);
    });
  });

  describe("hasPermission", () => {
    it("権限を持っている場合trueを返す", () => {
      expect(
        hasPermission(["GENERAL"], PERMISSION_CODES.PATIENT_VIEW),
      ).toBe(true);
    });

    it("権限を持っていない場合falseを返す", () => {
      expect(
        hasPermission(["GENERAL"], PERMISSION_CODES.MASTER_DATA_VIEW),
      ).toBe(false);
    });

    it("全権管理者はすべての権限を持つ", () => {
      const allPermissions = Object.values(PERMISSION_CODES);
      for (const perm of allPermissions) {
        expect(hasPermission(["SUPER_ADMIN"], perm)).toBe(true);
      }
    });
  });

  describe("hasAnyPermission", () => {
    it("必要な権限のいずれかを持っている場合trueを返す", () => {
      expect(
        hasAnyPermission(["GENERAL"], [
          PERMISSION_CODES.PATIENT_VIEW,
          PERMISSION_CODES.MASTER_DATA_VIEW,
        ]),
      ).toBe(true);
    });

    it("必要な権限をいずれも持っていない場合falseを返す", () => {
      expect(
        hasAnyPermission(["GENERAL"], [
          PERMISSION_CODES.MASTER_DATA_VIEW,
          PERMISSION_CODES.AUDIT_LOG_VIEW,
        ]),
      ).toBe(false);
    });
  });

  describe("hasAllPermissions", () => {
    it("必要な権限をすべて持っている場合trueを返す", () => {
      expect(
        hasAllPermissions(["GENERAL"], [
          PERMISSION_CODES.PATIENT_VIEW,
          PERMISSION_CODES.CARE_PLAN_CREATE,
        ]),
      ).toBe(true);
    });

    it("必要な権限の一部を持っていない場合falseを返す", () => {
      expect(
        hasAllPermissions(["GENERAL"], [
          PERMISSION_CODES.PATIENT_VIEW,
          PERMISSION_CODES.MASTER_DATA_VIEW,
        ]),
      ).toBe(false);
    });

    it("空の権限一覧の場合trueを返す", () => {
      expect(hasAllPermissions(["GENERAL"], [])).toBe(true);
    });
  });

  describe("canAccessPage", () => {
    it("一般ユーザーは患者一覧にアクセスできる", () => {
      expect(canAccessPage(["GENERAL"], "/patients")).toBe(true);
    });

    it("一般ユーザーは管理画面にアクセスできない", () => {
      expect(canAccessPage(["GENERAL"], "/admin")).toBe(false);
      expect(canAccessPage(["GENERAL"], "/admin/users")).toBe(false);
      expect(canAccessPage(["GENERAL"], "/admin/medicines")).toBe(false);
    });

    it("システム管理者は管理画面にアクセスできる", () => {
      expect(canAccessPage(["SYSTEM_ADMIN"], "/admin")).toBe(true);
      expect(canAccessPage(["SYSTEM_ADMIN"], "/admin/medicines")).toBe(true);
      expect(canAccessPage(["SYSTEM_ADMIN"], "/admin/audit-logs")).toBe(true);
    });

    it("システム管理者は患者一覧にアクセスできない", () => {
      expect(canAccessPage(["SYSTEM_ADMIN"], "/patients")).toBe(false);
    });

    it("システム管理者はユーザー管理にアクセスできない", () => {
      expect(canAccessPage(["SYSTEM_ADMIN"], "/admin/users")).toBe(false);
    });

    it("全権管理者はすべてのページにアクセスできる", () => {
      expect(canAccessPage(["SUPER_ADMIN"], "/patients")).toBe(true);
      expect(canAccessPage(["SUPER_ADMIN"], "/admin")).toBe(true);
      expect(canAccessPage(["SUPER_ADMIN"], "/admin/users")).toBe(true);
      expect(canAccessPage(["SUPER_ADMIN"], "/admin/medicines")).toBe(true);
      expect(canAccessPage(["SUPER_ADMIN"], "/settings")).toBe(true);
    });

    it("マッピングにないパスはアクセス可能", () => {
      expect(canAccessPage(["GENERAL"], "/")).toBe(true);
      expect(canAccessPage(["GENERAL"], "/some-unknown-page")).toBe(true);
    });

    it("すべてのロールで個人設定にアクセスできる", () => {
      expect(canAccessPage(["GENERAL"], "/settings")).toBe(true);
      expect(canAccessPage(["SYSTEM_ADMIN"], "/settings")).toBe(true);
      expect(canAccessPage(["SUPER_ADMIN"], "/settings")).toBe(true);
    });

    it("サブパスは最も長いプレフィックスマッチで判定される", () => {
      // /admin/users は SUPER_ADMIN のみ
      // /admin は SYSTEM_ADMIN | SUPER_ADMIN
      // /admin/users/123 は /admin/users にマッチするため SUPER_ADMIN のみ
      expect(canAccessPage(["SYSTEM_ADMIN"], "/admin/users/123")).toBe(false);
      expect(canAccessPage(["SUPER_ADMIN"], "/admin/users/123")).toBe(true);
    });
  });
});
