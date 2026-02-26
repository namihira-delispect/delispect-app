import { describe, it, expect } from "vitest";
import {
  determineConstipationSeverity,
  generateConstipationSuggestions,
  BRISTOL_SCALE_VALUES,
  BRISTOL_SCALE_LABELS,
  BRISTOL_SCALE_SHORT_LABELS,
  MEAL_AMOUNT_VALUES,
  MEAL_AMOUNT_LABELS,
  CONSTIPATION_SEVERITY_LABELS,
  CONSTIPATION_QUESTION_ORDER,
  CONSTIPATION_QUESTION_LABELS,
} from "../types";
import type { ConstipationAssessmentData } from "../types";

// =============================================================================
// テストデータファクトリ
// =============================================================================

function createDefaultData(
  overrides: Partial<ConstipationAssessmentData> = {},
): ConstipationAssessmentData {
  return {
    daysWithoutBowelMovement: 0,
    bristolScale: 4,
    hasNausea: false,
    hasAbdominalDistension: false,
    hasAppetite: true,
    mealAmount: "NORMAL",
    hasBowelSounds: true,
    hasIntestinalGas: false,
    hasFecalMass: false,
    ...overrides,
  };
}

// =============================================================================
// 定数定義のテスト
// =============================================================================

describe("便秘ケアプラン定数定義", () => {
  it("ブリストルスケールが7段階で定義されている", () => {
    expect(BRISTOL_SCALE_VALUES).toHaveLength(7);
    expect(BRISTOL_SCALE_VALUES).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("全ブリストルスケール値にラベルが定義されている", () => {
    for (const value of BRISTOL_SCALE_VALUES) {
      expect(BRISTOL_SCALE_LABELS[value]).toBeDefined();
      expect(typeof BRISTOL_SCALE_LABELS[value]).toBe("string");
      expect(BRISTOL_SCALE_SHORT_LABELS[value]).toBeDefined();
      expect(typeof BRISTOL_SCALE_SHORT_LABELS[value]).toBe("string");
    }
  });

  it("食事量が3種類で定義されている", () => {
    expect(MEAL_AMOUNT_VALUES).toHaveLength(3);
    expect(MEAL_AMOUNT_VALUES).toEqual(["LARGE", "NORMAL", "SMALL"]);
  });

  it("全食事量にラベルが定義されている", () => {
    for (const value of MEAL_AMOUNT_VALUES) {
      expect(MEAL_AMOUNT_LABELS[value]).toBeDefined();
    }
    expect(MEAL_AMOUNT_LABELS.LARGE).toBe("多い");
    expect(MEAL_AMOUNT_LABELS.NORMAL).toBe("普通");
    expect(MEAL_AMOUNT_LABELS.SMALL).toBe("少ない");
  });

  it("便秘の重症度が4段階で定義されている", () => {
    expect(Object.keys(CONSTIPATION_SEVERITY_LABELS)).toHaveLength(4);
    expect(CONSTIPATION_SEVERITY_LABELS.NONE).toBe("便秘なし");
    expect(CONSTIPATION_SEVERITY_LABELS.MILD).toBe("軽度");
    expect(CONSTIPATION_SEVERITY_LABELS.MODERATE).toBe("中等度");
    expect(CONSTIPATION_SEVERITY_LABELS.SEVERE).toBe("重度");
  });

  it("質問が6ステップで定義されている", () => {
    expect(CONSTIPATION_QUESTION_ORDER).toHaveLength(6);
    expect(CONSTIPATION_QUESTION_ORDER).toEqual([
      "daysWithoutBowelMovement",
      "bristolScale",
      "physicalCondition",
      "diet",
      "bowelState",
      "confirm",
    ]);
  });

  it("全質問にラベルが定義されている", () => {
    for (const questionId of CONSTIPATION_QUESTION_ORDER) {
      expect(CONSTIPATION_QUESTION_LABELS[questionId]).toBeDefined();
      expect(typeof CONSTIPATION_QUESTION_LABELS[questionId]).toBe("string");
    }
  });
});

// =============================================================================
// 便秘の重症度判定ロジックのテスト
// =============================================================================

describe("determineConstipationSeverity", () => {
  describe("便秘なし（NONE）の判定", () => {
    it("便が出ていない日数が0日で便の性状が正常な場合は便秘なしを返す", () => {
      const data = createDefaultData({ daysWithoutBowelMovement: 0, bristolScale: 4 });
      expect(determineConstipationSeverity(data)).toBe("NONE");
    });

    it("便が出ていない日数が1日で便の性状が正常な場合は便秘なしを返す", () => {
      const data = createDefaultData({ daysWithoutBowelMovement: 1, bristolScale: 3 });
      expect(determineConstipationSeverity(data)).toBe("NONE");
    });

    it("便が出ていない日数が1日でbristolScaleがnullの場合は便秘なしを返す", () => {
      const data = createDefaultData({ daysWithoutBowelMovement: 0, bristolScale: null });
      expect(determineConstipationSeverity(data)).toBe("NONE");
    });

    it("便が出ていない日数が1日で便の性状がタイプ5の場合は便秘なしを返す", () => {
      const data = createDefaultData({ daysWithoutBowelMovement: 1, bristolScale: 5 });
      expect(determineConstipationSeverity(data)).toBe("NONE");
    });
  });

  describe("軽度（MILD）の判定", () => {
    it("便が出ていない日数が2日の場合は軽度を返す", () => {
      const data = createDefaultData({ daysWithoutBowelMovement: 2, bristolScale: 4 });
      expect(determineConstipationSeverity(data)).toBe("MILD");
    });

    it("便が出ていない日数が1日でブリストルスケール1の場合は軽度を返す", () => {
      // daysWithoutBowelMovement=1, bristolScale=1 → 1日だが硬便なのでNONEにならない
      // score: days=0, bristol=2 → total=2 → MILD
      const data = createDefaultData({ daysWithoutBowelMovement: 1, bristolScale: 1 });
      expect(determineConstipationSeverity(data)).toBe("MILD");
    });
  });

  describe("中等度（MODERATE）の判定", () => {
    it("便が出ていない日数が3日で硬便の場合は中等度を返す", () => {
      // score: days=2, bristol=2 → total=4 → MODERATE
      const data = createDefaultData({ daysWithoutBowelMovement: 3, bristolScale: 2 });
      expect(determineConstipationSeverity(data)).toBe("MODERATE");
    });

    it("便が出ていない日数が3日でお腹の張りがある場合は中等度を返す", () => {
      // score: days=2, abdominal=1, bowelSounds(true)=0 → total=3以下はMILD...
      // days=3→score=2, abdominal=1, total=3 → MILD
      // 追加で腸蠕動音なしにする: days=2+hasBowelSounds=false(+2)=4 → MODERATE
      const data = createDefaultData({
        daysWithoutBowelMovement: 3,
        bristolScale: 4,
        hasAbdominalDistension: true,
        hasBowelSounds: false,
      });
      expect(determineConstipationSeverity(data)).toBe("MODERATE");
    });
  });

  describe("重度（SEVERE）の判定", () => {
    it("便が出ていない日数が5日以上で複数の症状がある場合は重度を返す", () => {
      // score: days=3, nausea=2, abdominal=1, bowelSounds=2 → total=8 → SEVERE
      const data = createDefaultData({
        daysWithoutBowelMovement: 5,
        bristolScale: 1,
        hasNausea: true,
        hasAbdominalDistension: true,
        hasBowelSounds: false,
        hasFecalMass: true,
      });
      expect(determineConstipationSeverity(data)).toBe("SEVERE");
    });

    it("多数の重症兆候がある場合は重度を返す", () => {
      // score: days=3(5日以上), bristol=2(<=2), nausea=2, abdominal=1, bowelSounds=2, fecalMass=2 → total=12 → SEVERE
      const data = createDefaultData({
        daysWithoutBowelMovement: 7,
        bristolScale: 1,
        hasNausea: true,
        hasAbdominalDistension: true,
        hasBowelSounds: false,
        hasFecalMass: true,
        hasAppetite: false,
        mealAmount: "SMALL",
      });
      expect(determineConstipationSeverity(data)).toBe("SEVERE");
    });
  });

  describe("境界値のテスト", () => {
    it("daysWithoutBowelMovementが0の場合", () => {
      const data = createDefaultData({ daysWithoutBowelMovement: 0 });
      expect(determineConstipationSeverity(data)).toBe("NONE");
    });

    it("daysWithoutBowelMovementが30日の場合", () => {
      const data = createDefaultData({
        daysWithoutBowelMovement: 30,
        hasNausea: true,
        hasBowelSounds: false,
      });
      expect(determineConstipationSeverity(data)).toBe("SEVERE");
    });

    it("ブリストルスケール6（泥状便）は硬便スコア加算なし", () => {
      // bristolScale=6 → score=0 (>=3なので加算なし)
      const data = createDefaultData({
        daysWithoutBowelMovement: 2,
        bristolScale: 6,
      });
      // score: days=1 → MILD
      expect(determineConstipationSeverity(data)).toBe("MILD");
    });
  });
});

// =============================================================================
// 便秘の対処提案生成ロジックのテスト
// =============================================================================

describe("generateConstipationSuggestions", () => {
  it("便秘なしの場合は経過観察の提案を返す", () => {
    const data = createDefaultData();
    const result = generateConstipationSuggestions("NONE", data);
    expect(result.severity).toBe("NONE");
    expect(result.suggestions).toHaveLength(1);
    expect(result.suggestions[0]).toContain("経過観察");
  });

  it("軽度の場合は水分摂取・食物繊維・運動の提案を返す", () => {
    const data = createDefaultData({ daysWithoutBowelMovement: 2 });
    const result = generateConstipationSuggestions("MILD", data);
    expect(result.severity).toBe("MILD");
    expect(result.suggestions.length).toBeGreaterThanOrEqual(3);
    expect(result.suggestions.some((s) => s.includes("水分"))).toBe(true);
    expect(result.suggestions.some((s) => s.includes("食物繊維"))).toBe(true);
    expect(result.suggestions.some((s) => s.includes("運動") || s.includes("離床"))).toBe(true);
  });

  it("軽度で食欲不振の場合は少量頻回食の提案が追加される", () => {
    const data = createDefaultData({
      daysWithoutBowelMovement: 2,
      hasAppetite: false,
      mealAmount: "SMALL",
    });
    const result = generateConstipationSuggestions("MILD", data);
    expect(result.suggestions.some((s) => s.includes("少量頻回食"))).toBe(true);
  });

  it("中等度の場合は腹部マッサージや緩下剤の提案を返す", () => {
    const data = createDefaultData({
      daysWithoutBowelMovement: 3,
      hasAbdominalDistension: true,
    });
    const result = generateConstipationSuggestions("MODERATE", data);
    expect(result.severity).toBe("MODERATE");
    expect(result.suggestions.some((s) => s.includes("腹部マッサージ"))).toBe(true);
    expect(result.suggestions.some((s) => s.includes("緩下剤"))).toBe(true);
  });

  it("中等度でお腹の張りがある場合は温罨法の提案が追加される", () => {
    const data = createDefaultData({
      daysWithoutBowelMovement: 3,
      hasAbdominalDistension: true,
    });
    const result = generateConstipationSuggestions("MODERATE", data);
    expect(result.suggestions.some((s) => s.includes("温罨法"))).toBe(true);
  });

  it("中等度で食欲不振の場合は栄養士との相談が提案される", () => {
    const data = createDefaultData({
      daysWithoutBowelMovement: 3,
      hasAppetite: false,
    });
    const result = generateConstipationSuggestions("MODERATE", data);
    expect(result.suggestions.some((s) => s.includes("栄養士"))).toBe(true);
  });

  it("重度の場合は医師への報告を含む提案を返す", () => {
    const data = createDefaultData({
      daysWithoutBowelMovement: 7,
      hasNausea: true,
      hasAbdominalDistension: true,
      hasBowelSounds: false,
      hasFecalMass: true,
    });
    const result = generateConstipationSuggestions("SEVERE", data);
    expect(result.severity).toBe("SEVERE");
    expect(result.suggestions.some((s) => s.includes("医師"))).toBe(true);
  });

  it("重度で吐き気がある場合は制吐剤の提案が含まれる", () => {
    const data = createDefaultData({
      daysWithoutBowelMovement: 7,
      hasNausea: true,
    });
    const result = generateConstipationSuggestions("SEVERE", data);
    expect(result.suggestions.some((s) => s.includes("制吐剤"))).toBe(true);
  });

  it("重度でお腹の張りがある場合はX線検査の提案が含まれる", () => {
    const data = createDefaultData({
      daysWithoutBowelMovement: 7,
      hasAbdominalDistension: true,
    });
    const result = generateConstipationSuggestions("SEVERE", data);
    expect(result.suggestions.some((s) => s.includes("X線"))).toBe(true);
  });

  it("重度で便塊がある場合は摘便の提案が含まれる", () => {
    const data = createDefaultData({
      daysWithoutBowelMovement: 7,
      hasFecalMass: true,
    });
    const result = generateConstipationSuggestions("SEVERE", data);
    expect(result.suggestions.some((s) => s.includes("摘便"))).toBe(true);
  });

  it("重度で腸蠕動音なしの場合はイレウスの可能性を報告する提案が含まれる", () => {
    const data = createDefaultData({
      daysWithoutBowelMovement: 7,
      hasBowelSounds: false,
    });
    const result = generateConstipationSuggestions("SEVERE", data);
    expect(result.suggestions.some((s) => s.includes("イレウス"))).toBe(true);
  });
});
