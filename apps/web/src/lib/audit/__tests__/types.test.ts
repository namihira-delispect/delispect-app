import { describe, it, expect } from "vitest";
import { AUDIT_ACTIONS, AUDIT_TARGET_TYPES } from "../types";

describe("AUDIT_ACTIONS", () => {
  it("アクセス系のアクション定数を含む", () => {
    expect(AUDIT_ACTIONS.LOGIN).toBe("LOGIN");
    expect(AUDIT_ACTIONS.LOGOUT).toBe("LOGOUT");
    expect(AUDIT_ACTIONS.LOGIN_FAILED).toBe("LOGIN_FAILED");
  });

  it("CRUD操作系のアクション定数を含む", () => {
    expect(AUDIT_ACTIONS.VIEW).toBe("VIEW");
    expect(AUDIT_ACTIONS.CREATE).toBe("CREATE");
    expect(AUDIT_ACTIONS.UPDATE).toBe("UPDATE");
    expect(AUDIT_ACTIONS.DELETE).toBe("DELETE");
  });

  it("システム設定変更のアクション定数を含む", () => {
    expect(AUDIT_ACTIONS.SETTINGS_CHANGE).toBe("SETTINGS_CHANGE");
  });

  it("電子カルテ連携のアクション定数を含む", () => {
    expect(AUDIT_ACTIONS.EMR_SYNC).toBe("EMR_SYNC");
  });
});

describe("AUDIT_TARGET_TYPES", () => {
  it("主要な操作対象種別を含む", () => {
    expect(AUDIT_TARGET_TYPES.SESSION).toBe("SESSION");
    expect(AUDIT_TARGET_TYPES.PATIENT).toBe("PATIENT");
    expect(AUDIT_TARGET_TYPES.ADMISSION).toBe("ADMISSION");
    expect(AUDIT_TARGET_TYPES.RISK_ASSESSMENT).toBe("RISK_ASSESSMENT");
    expect(AUDIT_TARGET_TYPES.CARE_PLAN).toBe("CARE_PLAN");
    expect(AUDIT_TARGET_TYPES.HIGH_RISK_CARE_KASAN).toBe("HIGH_RISK_CARE_KASAN");
    expect(AUDIT_TARGET_TYPES.USER).toBe("USER");
    expect(AUDIT_TARGET_TYPES.ROLE).toBe("ROLE");
    expect(AUDIT_TARGET_TYPES.SYSTEM_SETTING).toBe("SYSTEM_SETTING");
    expect(AUDIT_TARGET_TYPES.EMR_DATA).toBe("EMR_DATA");
    expect(AUDIT_TARGET_TYPES.IMPORT).toBe("IMPORT");
  });
});
