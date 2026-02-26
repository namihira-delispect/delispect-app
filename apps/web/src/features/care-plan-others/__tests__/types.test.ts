import { describe, it, expect } from "vitest";
import {
  OTHERS_CATEGORIES,
  OTHERS_CATEGORY_LABELS,
  OTHERS_CATEGORY_DESCRIPTIONS,
  OTHERS_CHECKLIST_OPTIONS,
  OTHERS_CHECKLIST_DEFINITIONS,
  MOBILITY_OPTIONS,
  DEMENTIA_OPTIONS,
  SAFETY_OPTIONS,
  SLEEP_OPTIONS,
  generateInstructions,
} from "../types";

describe("その他カテゴリ定数定義", () => {
  it("その他カテゴリーが4項目ある", () => {
    expect(OTHERS_CATEGORIES).toHaveLength(4);
  });

  it("カテゴリーにMOBILITY, DEMENTIA, SAFETY, SLEEPが含まれる", () => {
    expect(OTHERS_CATEGORIES).toContain("MOBILITY");
    expect(OTHERS_CATEGORIES).toContain("DEMENTIA");
    expect(OTHERS_CATEGORIES).toContain("SAFETY");
    expect(OTHERS_CATEGORIES).toContain("SLEEP");
  });

  it("全カテゴリーの表示ラベルが定義されている", () => {
    for (const category of OTHERS_CATEGORIES) {
      expect(OTHERS_CATEGORY_LABELS[category]).toBeDefined();
      expect(typeof OTHERS_CATEGORY_LABELS[category]).toBe("string");
    }
  });

  it("カテゴリーラベルに期待される日本語が設定されている", () => {
    expect(OTHERS_CATEGORY_LABELS.MOBILITY).toBe("離床促進");
    expect(OTHERS_CATEGORY_LABELS.DEMENTIA).toBe("認知症ケア");
    expect(OTHERS_CATEGORY_LABELS.SAFETY).toBe("安全管理");
    expect(OTHERS_CATEGORY_LABELS.SLEEP).toBe("睡眠管理");
  });

  it("全カテゴリーの説明が定義されている", () => {
    for (const category of OTHERS_CATEGORIES) {
      expect(OTHERS_CATEGORY_DESCRIPTIONS[category]).toBeDefined();
      expect(typeof OTHERS_CATEGORY_DESCRIPTIONS[category]).toBe("string");
    }
  });

  it("全カテゴリーのチェックリスト選択肢が定義されている", () => {
    for (const category of OTHERS_CATEGORIES) {
      expect(OTHERS_CHECKLIST_OPTIONS[category]).toBeDefined();
      expect(Array.isArray(OTHERS_CHECKLIST_OPTIONS[category])).toBe(true);
      expect(OTHERS_CHECKLIST_OPTIONS[category].length).toBeGreaterThan(0);
    }
  });

  it("チェックリスト定義一覧が4件ある", () => {
    expect(OTHERS_CHECKLIST_DEFINITIONS).toHaveLength(4);
  });
});

describe("離床（MOBILITY）チェックリスト", () => {
  it("離床の選択肢が7項目ある", () => {
    expect(MOBILITY_OPTIONS).toHaveLength(7);
  });

  it("各選択肢にIDとラベルが設定されている", () => {
    for (const option of MOBILITY_OPTIONS) {
      expect(option.id).toBeDefined();
      expect(option.id.startsWith("mobility_")).toBe(true);
      expect(option.label).toBeDefined();
      expect(typeof option.label).toBe("string");
    }
  });

  it("早期離床の計画の選択肢が含まれる", () => {
    const option = MOBILITY_OPTIONS.find((o) => o.id === "mobility_01");
    expect(option).toBeDefined();
    expect(option?.label).toBe("早期離床の計画を立てる");
  });
});

describe("認知症（DEMENTIA）チェックリスト", () => {
  it("認知症の選択肢が7項目ある", () => {
    expect(DEMENTIA_OPTIONS).toHaveLength(7);
  });

  it("各選択肢にIDとラベルが設定されている", () => {
    for (const option of DEMENTIA_OPTIONS) {
      expect(option.id).toBeDefined();
      expect(option.id.startsWith("dementia_")).toBe(true);
      expect(option.label).toBeDefined();
      expect(typeof option.label).toBe("string");
    }
  });

  it("見当識の支援の選択肢が含まれる", () => {
    const option = DEMENTIA_OPTIONS.find((o) => o.id === "dementia_01");
    expect(option).toBeDefined();
    expect(option?.label).toBe("見当識の支援を行う");
  });
});

describe("安全管理（SAFETY）チェックリスト", () => {
  it("安全管理の選択肢が7項目ある", () => {
    expect(SAFETY_OPTIONS).toHaveLength(7);
  });

  it("各選択肢にIDとラベルが設定されている", () => {
    for (const option of SAFETY_OPTIONS) {
      expect(option.id).toBeDefined();
      expect(option.id.startsWith("safety_")).toBe(true);
      expect(option.label).toBeDefined();
      expect(typeof option.label).toBe("string");
    }
  });

  it("転倒・転落リスクの評価の選択肢が含まれる", () => {
    const option = SAFETY_OPTIONS.find((o) => o.id === "safety_01");
    expect(option).toBeDefined();
    expect(option?.label).toBe("転倒・転落リスクの評価を行う");
  });
});

describe("睡眠（SLEEP）チェックリスト", () => {
  it("睡眠の選択肢が7項目ある", () => {
    expect(SLEEP_OPTIONS).toHaveLength(7);
  });

  it("各選択肢にIDとラベルが設定されている", () => {
    for (const option of SLEEP_OPTIONS) {
      expect(option.id).toBeDefined();
      expect(option.id.startsWith("sleep_")).toBe(true);
      expect(option.label).toBeDefined();
      expect(typeof option.label).toBe("string");
    }
  });

  it("睡眠環境を整えるの選択肢が含まれる", () => {
    const option = SLEEP_OPTIONS.find((o) => o.id === "sleep_01");
    expect(option).toBeDefined();
    expect(option?.label).toBe("睡眠環境を整える");
  });
});

describe("generateInstructions", () => {
  it("選択された対策から指示内容テキストを生成する", () => {
    const result = generateInstructions("MOBILITY", ["mobility_01", "mobility_03"]);
    expect(result).toContain("【離床促進】");
    expect(result).toContain("- 早期離床の計画を立てる");
    expect(result).toContain("- 歩行訓練の実施");
  });

  it("選択肢がない場合は空文字列を返す", () => {
    const result = generateInstructions("MOBILITY", []);
    expect(result).toBe("");
  });

  it("存在しないIDは無視される", () => {
    const result = generateInstructions("SAFETY", ["safety_01", "invalid_id"]);
    expect(result).toContain("【安全管理】");
    expect(result).toContain("- 転倒・転落リスクの評価を行う");
    expect(result).not.toContain("invalid_id");
  });

  it("認知症カテゴリーの指示内容が正しく生成される", () => {
    const result = generateInstructions("DEMENTIA", ["dementia_01", "dementia_05"]);
    expect(result).toContain("【認知症ケア】");
    expect(result).toContain("- 見当識の支援を行う");
    expect(result).toContain("- 家族の面会・付き添いを促す");
  });

  it("睡眠カテゴリーの指示内容が正しく生成される", () => {
    const result = generateInstructions("SLEEP", ["sleep_01", "sleep_02", "sleep_06"]);
    expect(result).toContain("【睡眠管理】");
    expect(result).toContain("- 睡眠環境を整える");
    expect(result).toContain("- 日中の活動量を確保する");
    expect(result).toContain("- 睡眠薬の適正使用を確認する");
  });

  it("全選択肢を選択した場合の指示内容が正しく生成される", () => {
    const allIds = MOBILITY_OPTIONS.map((opt) => opt.id);
    const result = generateInstructions("MOBILITY", allIds);
    expect(result).toContain("【離床促進】");
    for (const option of MOBILITY_OPTIONS) {
      expect(result).toContain(`- ${option.label}`);
    }
  });
});
