import { describe, it, expect } from "vitest";
import {
  LAB_ITEM_TARGETS,
  VITAL_SIGN_TARGETS,
  ADMISSION_INFO_TARGETS,
  MAPPING_TYPE_LABELS,
  MAPPING_TABS,
} from "../types";

describe("LAB_ITEM_TARGETS", () => {
  it("CBC検査項目が定義されている", () => {
    const cbcItems = LAB_ITEM_TARGETS.filter((t) => t.category === "CBC");
    expect(cbcItems).toHaveLength(5);
    expect(cbcItems.map((t) => t.code)).toEqual(
      expect.arrayContaining(["RBC", "WBC", "HGB", "HCT", "PLT"]),
    );
  });

  it("生化学検査項目が定義されている", () => {
    const biochemItems = LAB_ITEM_TARGETS.filter((t) => t.category === "生化学");
    expect(biochemItems).toHaveLength(12);
    expect(biochemItems.map((t) => t.code)).toEqual(
      expect.arrayContaining([
        "AST",
        "ALT",
        "ALP",
        "GGT",
        "CHE",
        "CRE",
        "BUN",
        "NA",
        "K",
        "CA",
        "GLU",
        "CRP",
      ]),
    );
  });

  it("全17項目が定義されている", () => {
    expect(LAB_ITEM_TARGETS).toHaveLength(17);
  });

  it("各項目にcode, label, categoryが設定されている", () => {
    for (const target of LAB_ITEM_TARGETS) {
      expect(target.code).toBeTruthy();
      expect(target.label).toBeTruthy();
      expect(target.category).toBeTruthy();
    }
  });
});

describe("VITAL_SIGN_TARGETS", () => {
  it("全6項目が定義されている", () => {
    expect(VITAL_SIGN_TARGETS).toHaveLength(6);
  });

  it("必要なバイタルサイン項目がすべて定義されている", () => {
    const codes = VITAL_SIGN_TARGETS.map((t) => t.code);
    expect(codes).toEqual(
      expect.arrayContaining([
        "BODY_TEMPERATURE",
        "PULSE",
        "SYSTOLIC_BP",
        "DIASTOLIC_BP",
        "SPO2",
        "RESPIRATORY_RATE",
      ]),
    );
  });

  it("全項目のカテゴリがバイタルサインである", () => {
    for (const target of VITAL_SIGN_TARGETS) {
      expect(target.category).toBe("バイタルサイン");
    }
  });
});

describe("ADMISSION_INFO_TARGETS", () => {
  it("病棟と病室の2項目が定義されている", () => {
    expect(ADMISSION_INFO_TARGETS).toHaveLength(2);
  });

  it("病棟項目が定義されている", () => {
    const ward = ADMISSION_INFO_TARGETS.find((t) => t.code === "WARD");
    expect(ward).toBeDefined();
    expect(ward?.label).toBe("病棟");
    expect(ward?.category).toBe("入院情報");
  });

  it("病室項目が定義されている", () => {
    const room = ADMISSION_INFO_TARGETS.find((t) => t.code === "ROOM");
    expect(room).toBeDefined();
    expect(room?.label).toBe("病室");
    expect(room?.category).toBe("入院情報");
  });
});

describe("MAPPING_TYPE_LABELS", () => {
  it("全マッピング種別にラベルが定義されている", () => {
    expect(MAPPING_TYPE_LABELS.LAB_ITEM).toBe("検査値");
    expect(MAPPING_TYPE_LABELS.PRESCRIPTION_TYPE).toBe("処方");
    expect(MAPPING_TYPE_LABELS.VITAL_SIGN).toBe("バイタルサイン");
    expect(MAPPING_TYPE_LABELS.WARD).toBe("病棟");
    expect(MAPPING_TYPE_LABELS.ROOM).toBe("病室");
  });
});

describe("MAPPING_TABS", () => {
  it("4つのタブが定義されている", () => {
    expect(MAPPING_TABS).toHaveLength(4);
  });

  it("タブの順番が正しい", () => {
    expect(MAPPING_TABS[0].key).toBe("lab");
    expect(MAPPING_TABS[1].key).toBe("prescription");
    expect(MAPPING_TABS[2].key).toBe("vital");
    expect(MAPPING_TABS[3].key).toBe("admission");
  });

  it("各タブにラベルが設定されている", () => {
    for (const tab of MAPPING_TABS) {
      expect(tab.label).toBeTruthy();
    }
  });
});
