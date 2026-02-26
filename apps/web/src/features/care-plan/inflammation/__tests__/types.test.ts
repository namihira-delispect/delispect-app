import { describe, it, expect } from "vitest";
import {
  judgeDeviation,
  judgeFever,
  judgeInflammation,
  generateInflammationSuggestions,
  INFLAMMATION_QUESTION_ORDER,
  INFLAMMATION_QUESTIONS,
  FEVER_THRESHOLD,
} from "../types";
import type { LabResultEntry, InflammationDetails } from "../types";

describe("judgeDeviation", () => {
  describe("正常系", () => {
    it("測定値が基準範囲内の場合はNORMALを返す", () => {
      expect(judgeDeviation(5.0, 0.0, 10.0)).toBe("NORMAL");
    });

    it("測定値が基準値上限と等しい場合はNORMALを返す", () => {
      expect(judgeDeviation(10.0, 0.0, 10.0)).toBe("NORMAL");
    });

    it("測定値が基準値下限と等しい場合はNORMALを返す", () => {
      expect(judgeDeviation(0.0, 0.0, 10.0)).toBe("NORMAL");
    });

    it("測定値が基準値上限を超える場合はHIGHを返す", () => {
      expect(judgeDeviation(10.1, 0.0, 10.0)).toBe("HIGH");
    });

    it("測定値が基準値下限を下回る場合はLOWを返す", () => {
      expect(judgeDeviation(-0.1, 0.0, 10.0)).toBe("LOW");
    });

    it("上限のみ設定されている場合に正常判定できる", () => {
      expect(judgeDeviation(5.0, null, 10.0)).toBe("NORMAL");
    });

    it("上限のみ設定されている場合に高値判定できる", () => {
      expect(judgeDeviation(11.0, null, 10.0)).toBe("HIGH");
    });

    it("下限のみ設定されている場合に正常判定できる", () => {
      expect(judgeDeviation(5.0, 0.0, null)).toBe("NORMAL");
    });

    it("下限のみ設定されている場合に低値判定できる", () => {
      expect(judgeDeviation(-1.0, 0.0, null)).toBe("LOW");
    });

    it("上限・下限とも未設定の場合はNORMALを返す", () => {
      expect(judgeDeviation(5.0, null, null)).toBe("NORMAL");
    });
  });

  describe("異常系", () => {
    it("測定値がnullの場合はnullを返す", () => {
      expect(judgeDeviation(null, 0.0, 10.0)).toBeNull();
    });
  });
});

describe("judgeFever", () => {
  describe("正常系", () => {
    it("体温が37.5度以上の場合はtrueを返す", () => {
      expect(judgeFever(37.5)).toBe(true);
    });

    it("体温が38.0度の場合はtrueを返す", () => {
      expect(judgeFever(38.0)).toBe(true);
    });

    it("体温が37.4度の場合はfalseを返す", () => {
      expect(judgeFever(37.4)).toBe(false);
    });

    it("体温が36.5度の場合はfalseを返す", () => {
      expect(judgeFever(36.5)).toBe(false);
    });
  });

  describe("異常系", () => {
    it("体温がnullの場合はnullを返す", () => {
      expect(judgeFever(null)).toBeNull();
    });
  });
});

describe("judgeInflammation", () => {
  describe("正常系", () => {
    it("CRPが高値の場合はtrueを返す", () => {
      const labResults: LabResultEntry[] = [
        {
          itemCode: "CRP",
          itemName: "C反応性蛋白",
          value: 5.0,
          unit: "mg/dL",
          lowerLimit: 0,
          upperLimit: 0.3,
          deviationStatus: "HIGH",
          measuredAt: "2026-01-01T00:00:00Z",
        },
        {
          itemCode: "WBC",
          itemName: "白血球数",
          value: 6000,
          unit: "/uL",
          lowerLimit: 3500,
          upperLimit: 9800,
          deviationStatus: "NORMAL",
          measuredAt: "2026-01-01T00:00:00Z",
        },
      ];
      expect(judgeInflammation(labResults)).toBe(true);
    });

    it("WBCが高値の場合はtrueを返す", () => {
      const labResults: LabResultEntry[] = [
        {
          itemCode: "CRP",
          itemName: "C反応性蛋白",
          value: 0.1,
          unit: "mg/dL",
          lowerLimit: 0,
          upperLimit: 0.3,
          deviationStatus: "NORMAL",
          measuredAt: "2026-01-01T00:00:00Z",
        },
        {
          itemCode: "WBC",
          itemName: "白血球数",
          value: 15000,
          unit: "/uL",
          lowerLimit: 3500,
          upperLimit: 9800,
          deviationStatus: "HIGH",
          measuredAt: "2026-01-01T00:00:00Z",
        },
      ];
      expect(judgeInflammation(labResults)).toBe(true);
    });

    it("CRP/WBCとも正常の場合はfalseを返す", () => {
      const labResults: LabResultEntry[] = [
        {
          itemCode: "CRP",
          itemName: "C反応性蛋白",
          value: 0.1,
          unit: "mg/dL",
          lowerLimit: 0,
          upperLimit: 0.3,
          deviationStatus: "NORMAL",
          measuredAt: "2026-01-01T00:00:00Z",
        },
        {
          itemCode: "WBC",
          itemName: "白血球数",
          value: 6000,
          unit: "/uL",
          lowerLimit: 3500,
          upperLimit: 9800,
          deviationStatus: "NORMAL",
          measuredAt: "2026-01-01T00:00:00Z",
        },
      ];
      expect(judgeInflammation(labResults)).toBe(false);
    });

    it("全結果のvalueがnullの場合はnullを返す", () => {
      const labResults: LabResultEntry[] = [
        {
          itemCode: "CRP",
          itemName: "C反応性蛋白",
          value: null,
          unit: "mg/dL",
          lowerLimit: 0,
          upperLimit: 0.3,
          deviationStatus: null,
          measuredAt: null,
        },
        {
          itemCode: "WBC",
          itemName: "白血球数",
          value: null,
          unit: "/uL",
          lowerLimit: 3500,
          upperLimit: 9800,
          deviationStatus: null,
          measuredAt: null,
        },
      ];
      expect(judgeInflammation(labResults)).toBeNull();
    });
  });

  describe("異常系", () => {
    it("空配列の場合はnullを返す", () => {
      expect(judgeInflammation([])).toBeNull();
    });
  });
});

describe("generateInflammationSuggestions", () => {
  it("炎症・発熱・痛み全てありの場合は全カテゴリの提案を返す", () => {
    const details: InflammationDetails = {
      labResults: [],
      vitalSigns: null,
      hasPain: true,
      hasFever: true,
      hasInflammation: true,
    };
    const result = generateInflammationSuggestions(details);

    expect(result.suggestions.length).toBeGreaterThanOrEqual(5);
    expect(result.shouldNavigateToPain).toBe(true);

    const categories = result.suggestions.map((s) => s.category);
    expect(categories).toContain("inflammation");
    expect(categories).toContain("fever");
    expect(categories).toContain("pain");
  });

  it("炎症・発熱・痛み全てなしの場合は正常系の提案を返す", () => {
    const details: InflammationDetails = {
      labResults: [],
      vitalSigns: null,
      hasPain: false,
      hasFever: false,
      hasInflammation: false,
    };
    const result = generateInflammationSuggestions(details);

    expect(result.suggestions.length).toBe(3);
    expect(result.shouldNavigateToPain).toBe(false);
  });

  it("炎症ありの場合は炎症カテゴリの提案を含む", () => {
    const details: InflammationDetails = {
      labResults: [],
      vitalSigns: null,
      hasPain: false,
      hasFever: false,
      hasInflammation: true,
    };
    const result = generateInflammationSuggestions(details);

    const inflammationSuggestions = result.suggestions.filter((s) => s.category === "inflammation");
    expect(inflammationSuggestions.length).toBe(2);
  });

  it("発熱ありの場合は発熱カテゴリの提案を含む", () => {
    const details: InflammationDetails = {
      labResults: [],
      vitalSigns: null,
      hasPain: false,
      hasFever: true,
      hasInflammation: false,
    };
    const result = generateInflammationSuggestions(details);

    const feverSuggestions = result.suggestions.filter((s) => s.category === "fever");
    expect(feverSuggestions.length).toBe(2);
  });

  it("痛みありの場合は疼痛への誘導を提案する", () => {
    const details: InflammationDetails = {
      labResults: [],
      vitalSigns: null,
      hasPain: true,
      hasFever: false,
      hasInflammation: false,
    };
    const result = generateInflammationSuggestions(details);

    expect(result.shouldNavigateToPain).toBe(true);
    const painSuggestions = result.suggestions.filter((s) => s.category === "pain");
    expect(painSuggestions.length).toBe(1);
  });

  it("提案は優先度順にソートされる", () => {
    const details: InflammationDetails = {
      labResults: [],
      vitalSigns: null,
      hasPain: true,
      hasFever: true,
      hasInflammation: true,
    };
    const result = generateInflammationSuggestions(details);

    for (let i = 0; i < result.suggestions.length - 1; i++) {
      expect(result.suggestions[i].priority).toBeLessThanOrEqual(
        result.suggestions[i + 1].priority,
      );
    }
  });

  it("全てnullの場合は提案が空を返す", () => {
    const details: InflammationDetails = {
      labResults: [],
      vitalSigns: null,
      hasPain: null,
      hasFever: null,
      hasInflammation: null,
    };
    const result = generateInflammationSuggestions(details);

    expect(result.suggestions).toHaveLength(0);
    expect(result.shouldNavigateToPain).toBe(false);
  });
});

describe("定数定義", () => {
  it("質問フローが4ステップある", () => {
    expect(INFLAMMATION_QUESTION_ORDER).toHaveLength(4);
  });

  it("質問フローの順序が正しい", () => {
    expect(INFLAMMATION_QUESTION_ORDER).toEqual([
      "lab_results",
      "vital_signs",
      "pain_check",
      "suggestion",
    ]);
  });

  it("全質問IDに対応する質問定義がある", () => {
    for (const questionId of INFLAMMATION_QUESTION_ORDER) {
      const question = INFLAMMATION_QUESTIONS[questionId];
      expect(question).toBeDefined();
      expect(question.id).toBe(questionId);
      expect(question.title).toBeTruthy();
      expect(question.description).toBeTruthy();
      expect(question.order).toBeGreaterThan(0);
    }
  });

  it("発熱閾値が37.5度である", () => {
    expect(FEVER_THRESHOLD).toBe(37.5);
  });
});
