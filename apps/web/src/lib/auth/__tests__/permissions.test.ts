import { describe, it, expect } from "vitest";
import {
  PERMISSION_CODES,
  ROLE_NAMES,
  ROLE_PERMISSIONS,
  PAGE_ROLE_MAP,
} from "../permissions";

describe("パーミッション定義", () => {
  describe("PERMISSION_CODES", () => {
    it("すべてのパーミッションコードが一意である", () => {
      const codes = Object.values(PERMISSION_CODES);
      const uniqueCodes = new Set(codes);
      expect(codes.length).toBe(uniqueCodes.size);
    });

    it("パーミッションコードがカテゴリ:アクション形式である", () => {
      const codes = Object.values(PERMISSION_CODES);
      for (const code of codes) {
        expect(code).toMatch(/^[a-z_]+:[a-z_]+$/);
      }
    });

    it("患者関連のパーミッションが定義されている", () => {
      expect(PERMISSION_CODES.PATIENT_VIEW).toBe("patient:view");
      expect(PERMISSION_CODES.PATIENT_EDIT).toBe("patient:edit");
    });

    it("ケアプラン関連のパーミッションが定義されている", () => {
      expect(PERMISSION_CODES.CARE_PLAN_CREATE).toBe("care_plan:create");
      expect(PERMISSION_CODES.CARE_PLAN_EDIT).toBe("care_plan:edit");
      expect(PERMISSION_CODES.CARE_PLAN_VIEW).toBe("care_plan:view");
    });

    it("管理機能のパーミッションが定義されている", () => {
      expect(PERMISSION_CODES.MASTER_DATA_VIEW).toBe("master_data:view");
      expect(PERMISSION_CODES.MASTER_DATA_EDIT).toBe("master_data:edit");
      expect(PERMISSION_CODES.AUDIT_LOG_VIEW).toBe("audit_log:view");
      expect(PERMISSION_CODES.USER_MANAGE).toBe("user:manage");
      expect(PERMISSION_CODES.ROLE_MANAGE).toBe("role:manage");
    });
  });

  describe("ROLE_NAMES", () => {
    it("3つのロールが定義されている", () => {
      expect(Object.keys(ROLE_NAMES)).toHaveLength(3);
    });

    it("一般ユーザー、システム管理者、全権管理者が定義されている", () => {
      expect(ROLE_NAMES.GENERAL).toBe("GENERAL");
      expect(ROLE_NAMES.SYSTEM_ADMIN).toBe("SYSTEM_ADMIN");
      expect(ROLE_NAMES.SUPER_ADMIN).toBe("SUPER_ADMIN");
    });
  });

  describe("ROLE_PERMISSIONS", () => {
    it("一般ユーザーは患者情報・ケアプラン・電子カルテ同期の権限を持つ", () => {
      const generalPerms = ROLE_PERMISSIONS.GENERAL;

      expect(generalPerms).toContain(PERMISSION_CODES.PATIENT_VIEW);
      expect(generalPerms).toContain(PERMISSION_CODES.PATIENT_EDIT);
      expect(generalPerms).toContain(PERMISSION_CODES.CARE_PLAN_CREATE);
      expect(generalPerms).toContain(PERMISSION_CODES.CARE_PLAN_EDIT);
      expect(generalPerms).toContain(PERMISSION_CODES.CARE_PLAN_VIEW);
      expect(generalPerms).toContain(PERMISSION_CODES.EMR_SYNC);
      expect(generalPerms).toContain(PERMISSION_CODES.RISK_ASSESSMENT_VIEW);
      expect(generalPerms).toContain(PERMISSION_CODES.RISK_ASSESSMENT_CREATE);
      expect(generalPerms).toContain(PERMISSION_CODES.HIGH_RISK_CARE_VIEW);
      expect(generalPerms).toContain(PERMISSION_CODES.HIGH_RISK_CARE_ASSESS);
    });

    it("一般ユーザーは管理機能の権限を持たない", () => {
      const generalPerms = ROLE_PERMISSIONS.GENERAL;

      expect(generalPerms).not.toContain(PERMISSION_CODES.MASTER_DATA_VIEW);
      expect(generalPerms).not.toContain(PERMISSION_CODES.MASTER_DATA_EDIT);
      expect(generalPerms).not.toContain(PERMISSION_CODES.AUDIT_LOG_VIEW);
      expect(generalPerms).not.toContain(PERMISSION_CODES.USER_MANAGE);
      expect(generalPerms).not.toContain(PERMISSION_CODES.ROLE_MANAGE);
    });

    it("システム管理者はマスタデータ管理・基準値設定・監査ログの権限を持つ", () => {
      const adminPerms = ROLE_PERMISSIONS.SYSTEM_ADMIN;

      expect(adminPerms).toContain(PERMISSION_CODES.MASTER_DATA_VIEW);
      expect(adminPerms).toContain(PERMISSION_CODES.MASTER_DATA_EDIT);
      expect(adminPerms).toContain(PERMISSION_CODES.REFERENCE_VALUE_VIEW);
      expect(adminPerms).toContain(PERMISSION_CODES.REFERENCE_VALUE_EDIT);
      expect(adminPerms).toContain(PERMISSION_CODES.AUDIT_LOG_VIEW);
      expect(adminPerms).toContain(PERMISSION_CODES.SYSTEM_SETTING_VIEW);
      expect(adminPerms).toContain(PERMISSION_CODES.SYSTEM_SETTING_EDIT);
      expect(adminPerms).toContain(PERMISSION_CODES.DATA_MAPPING_VIEW);
      expect(adminPerms).toContain(PERMISSION_CODES.DATA_MAPPING_EDIT);
    });

    it("システム管理者は患者情報にアクセスできない", () => {
      const adminPerms = ROLE_PERMISSIONS.SYSTEM_ADMIN;

      expect(adminPerms).not.toContain(PERMISSION_CODES.PATIENT_VIEW);
      expect(adminPerms).not.toContain(PERMISSION_CODES.PATIENT_EDIT);
      expect(adminPerms).not.toContain(PERMISSION_CODES.CARE_PLAN_CREATE);
      expect(adminPerms).not.toContain(PERMISSION_CODES.CARE_PLAN_EDIT);
      expect(adminPerms).not.toContain(PERMISSION_CODES.CARE_PLAN_VIEW);
      expect(adminPerms).not.toContain(PERMISSION_CODES.EMR_SYNC);
    });

    it("全権管理者はすべての権限を持つ", () => {
      const superAdminPerms = ROLE_PERMISSIONS.SUPER_ADMIN;
      const allPermissions = Object.values(PERMISSION_CODES);

      for (const perm of allPermissions) {
        expect(superAdminPerms).toContain(perm);
      }
    });
  });

  describe("PAGE_ROLE_MAP", () => {
    it("患者一覧は一般ユーザーと全権管理者がアクセス可能", () => {
      expect(PAGE_ROLE_MAP["/patients"]).toContain("GENERAL");
      expect(PAGE_ROLE_MAP["/patients"]).toContain("SUPER_ADMIN");
      expect(PAGE_ROLE_MAP["/patients"]).not.toContain("SYSTEM_ADMIN");
    });

    it("管理画面はシステム管理者と全権管理者がアクセス可能", () => {
      expect(PAGE_ROLE_MAP["/admin"]).toContain("SYSTEM_ADMIN");
      expect(PAGE_ROLE_MAP["/admin"]).toContain("SUPER_ADMIN");
      expect(PAGE_ROLE_MAP["/admin"]).not.toContain("GENERAL");
    });

    it("ユーザー管理は全権管理者のみアクセス可能", () => {
      expect(PAGE_ROLE_MAP["/admin/users"]).toEqual(["SUPER_ADMIN"]);
    });

    it("個人設定はすべてのロールがアクセス可能", () => {
      expect(PAGE_ROLE_MAP["/settings"]).toContain("GENERAL");
      expect(PAGE_ROLE_MAP["/settings"]).toContain("SYSTEM_ADMIN");
      expect(PAGE_ROLE_MAP["/settings"]).toContain("SUPER_ADMIN");
    });
  });
});
