import { describe, it, expect } from "vitest";
import {
  constipationParamsSchema,
  constipationAssessmentSchema,
  saveConstipationSchema,
} from "../schemata";

describe("constipationParamsSchema", () => {
  describe("正常系", () => {
    it("正の整数admissionIdを受け付ける", () => {
      const result = constipationParamsSchema.safeParse({ admissionId: 1 });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.admissionId).toBe(1);
      }
    });

    it("文字列のadmissionIdを数値に変換する", () => {
      const result = constipationParamsSchema.safeParse({ admissionId: "42" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.admissionId).toBe(42);
      }
    });
  });

  describe("バリデーションエラー", () => {
    it("admissionIdが0の場合にエラーを返す", () => {
      const result = constipationParamsSchema.safeParse({ admissionId: 0 });
      expect(result.success).toBe(false);
    });

    it("admissionIdが負の数値の場合にエラーを返す", () => {
      const result = constipationParamsSchema.safeParse({ admissionId: -1 });
      expect(result.success).toBe(false);
    });

    it("admissionIdが未指定の場合にエラーを返す", () => {
      const result = constipationParamsSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });
});

describe("constipationAssessmentSchema", () => {
  const validData = {
    daysWithoutBowelMovement: 3,
    bristolScale: 4,
    hasNausea: false,
    hasAbdominalDistension: false,
    hasAppetite: true,
    mealAmount: "NORMAL",
    hasBowelSounds: true,
    hasIntestinalGas: false,
    hasFecalMass: false,
  };

  describe("正常系", () => {
    it("全フィールドが正しいデータを受け付ける", () => {
      const result = constipationAssessmentSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("bristolScaleがnullの場合を受け付ける", () => {
      const result = constipationAssessmentSchema.safeParse({
        ...validData,
        bristolScale: null,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.bristolScale).toBeNull();
      }
    });

    it("daysWithoutBowelMovementが0の場合を受け付ける", () => {
      const result = constipationAssessmentSchema.safeParse({
        ...validData,
        daysWithoutBowelMovement: 0,
      });
      expect(result.success).toBe(true);
    });

    it("daysWithoutBowelMovementが30の場合を受け付ける", () => {
      const result = constipationAssessmentSchema.safeParse({
        ...validData,
        daysWithoutBowelMovement: 30,
      });
      expect(result.success).toBe(true);
    });

    it("bristolScaleが1の場合を受け付ける", () => {
      const result = constipationAssessmentSchema.safeParse({
        ...validData,
        bristolScale: 1,
      });
      expect(result.success).toBe(true);
    });

    it("bristolScaleが7の場合を受け付ける", () => {
      const result = constipationAssessmentSchema.safeParse({
        ...validData,
        bristolScale: 7,
      });
      expect(result.success).toBe(true);
    });

    it("mealAmountがLARGEの場合を受け付ける", () => {
      const result = constipationAssessmentSchema.safeParse({
        ...validData,
        mealAmount: "LARGE",
      });
      expect(result.success).toBe(true);
    });

    it("mealAmountがSMALLの場合を受け付ける", () => {
      const result = constipationAssessmentSchema.safeParse({
        ...validData,
        mealAmount: "SMALL",
      });
      expect(result.success).toBe(true);
    });

    it("文字列のdaysWithoutBowelMovementを数値に変換する", () => {
      const result = constipationAssessmentSchema.safeParse({
        ...validData,
        daysWithoutBowelMovement: "5",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.daysWithoutBowelMovement).toBe(5);
      }
    });

    it("文字列のbristolScaleを数値に変換する", () => {
      const result = constipationAssessmentSchema.safeParse({
        ...validData,
        bristolScale: "3",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.bristolScale).toBe(3);
      }
    });
  });

  describe("バリデーションエラー", () => {
    it("daysWithoutBowelMovementが負の場合にエラーを返す", () => {
      const result = constipationAssessmentSchema.safeParse({
        ...validData,
        daysWithoutBowelMovement: -1,
      });
      expect(result.success).toBe(false);
    });

    it("daysWithoutBowelMovementが31以上の場合にエラーを返す", () => {
      const result = constipationAssessmentSchema.safeParse({
        ...validData,
        daysWithoutBowelMovement: 31,
      });
      expect(result.success).toBe(false);
    });

    it("daysWithoutBowelMovementが小数の場合にエラーを返す", () => {
      const result = constipationAssessmentSchema.safeParse({
        ...validData,
        daysWithoutBowelMovement: 1.5,
      });
      expect(result.success).toBe(false);
    });

    it("bristolScaleが0の場合にエラーを返す", () => {
      const result = constipationAssessmentSchema.safeParse({
        ...validData,
        bristolScale: 0,
      });
      expect(result.success).toBe(false);
    });

    it("bristolScaleが8の場合にエラーを返す", () => {
      const result = constipationAssessmentSchema.safeParse({
        ...validData,
        bristolScale: 8,
      });
      expect(result.success).toBe(false);
    });

    it("mealAmountが無効な値の場合にエラーを返す", () => {
      const result = constipationAssessmentSchema.safeParse({
        ...validData,
        mealAmount: "INVALID",
      });
      expect(result.success).toBe(false);
    });

    it("hasNauseaが未指定の場合にエラーを返す", () => {
      const { hasNausea: _hasNausea, ...rest } = validData;
      const result = constipationAssessmentSchema.safeParse(rest);
      expect(result.success).toBe(false);
    });

    it("hasAbdominalDistensionが未指定の場合にエラーを返す", () => {
      const { hasAbdominalDistension: _hasAbdominalDistension, ...rest } = validData;
      const result = constipationAssessmentSchema.safeParse(rest);
      expect(result.success).toBe(false);
    });

    it("hasAppetiteが未指定の場合にエラーを返す", () => {
      const { hasAppetite: _hasAppetite, ...rest } = validData;
      const result = constipationAssessmentSchema.safeParse(rest);
      expect(result.success).toBe(false);
    });

    it("hasBowelSoundsが未指定の場合にエラーを返す", () => {
      const { hasBowelSounds: _hasBowelSounds, ...rest } = validData;
      const result = constipationAssessmentSchema.safeParse(rest);
      expect(result.success).toBe(false);
    });

    it("hasIntestinalGasが未指定の場合にエラーを返す", () => {
      const { hasIntestinalGas: _hasIntestinalGas, ...rest } = validData;
      const result = constipationAssessmentSchema.safeParse(rest);
      expect(result.success).toBe(false);
    });

    it("hasFecalMassが未指定の場合にエラーを返す", () => {
      const { hasFecalMass: _hasFecalMass, ...rest } = validData;
      const result = constipationAssessmentSchema.safeParse(rest);
      expect(result.success).toBe(false);
    });
  });
});

describe("saveConstipationSchema", () => {
  const validInput = {
    admissionId: 1,
    assessment: {
      daysWithoutBowelMovement: 3,
      bristolScale: 4,
      hasNausea: false,
      hasAbdominalDistension: false,
      hasAppetite: true,
      mealAmount: "NORMAL",
      hasBowelSounds: true,
      hasIntestinalGas: false,
      hasFecalMass: false,
    },
  };

  describe("正常系", () => {
    it("正しい入力データを受け付ける", () => {
      const result = saveConstipationSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("文字列のadmissionIdを数値に変換する", () => {
      const result = saveConstipationSchema.safeParse({
        ...validInput,
        admissionId: "5",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.admissionId).toBe(5);
      }
    });
  });

  describe("バリデーションエラー", () => {
    it("admissionIdが0の場合にエラーを返す", () => {
      const result = saveConstipationSchema.safeParse({
        ...validInput,
        admissionId: 0,
      });
      expect(result.success).toBe(false);
    });

    it("assessmentが未指定の場合にエラーを返す", () => {
      const result = saveConstipationSchema.safeParse({
        admissionId: 1,
      });
      expect(result.success).toBe(false);
    });

    it("assessmentの必須フィールドが欠けている場合にエラーを返す", () => {
      const result = saveConstipationSchema.safeParse({
        admissionId: 1,
        assessment: {
          daysWithoutBowelMovement: 3,
        },
      });
      expect(result.success).toBe(false);
    });
  });
});
