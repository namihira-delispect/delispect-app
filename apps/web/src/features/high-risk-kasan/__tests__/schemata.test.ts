import { describe, it, expect } from "vitest";
import { highRiskKasanParamsSchema, saveHighRiskKasanSchema } from "../schemata";

describe("highRiskKasanParamsSchema", () => {
  describe("正常系", () => {
    it("正の整数admissionIdを受け付ける", () => {
      const result = highRiskKasanParamsSchema.safeParse({ admissionId: 1 });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.admissionId).toBe(1);
      }
    });

    it("文字列のadmissionIdを数値に変換する", () => {
      const result = highRiskKasanParamsSchema.safeParse({
        admissionId: "42",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.admissionId).toBe(42);
      }
    });

    it("大きな数値のadmissionIdを受け付ける", () => {
      const result = highRiskKasanParamsSchema.safeParse({
        admissionId: 999999,
      });
      expect(result.success).toBe(true);
    });
  });

  describe("バリデーションエラー", () => {
    it("admissionIdが0の場合にエラーを返す", () => {
      const result = highRiskKasanParamsSchema.safeParse({ admissionId: 0 });
      expect(result.success).toBe(false);
    });

    it("admissionIdが負の数値の場合にエラーを返す", () => {
      const result = highRiskKasanParamsSchema.safeParse({ admissionId: -1 });
      expect(result.success).toBe(false);
    });

    it("admissionIdが小数の場合にエラーを返す", () => {
      const result = highRiskKasanParamsSchema.safeParse({
        admissionId: 1.5,
      });
      expect(result.success).toBe(false);
    });

    it("admissionIdが未指定の場合にエラーを返す", () => {
      const result = highRiskKasanParamsSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });
});

describe("saveHighRiskKasanSchema", () => {
  const validInput = {
    admissionId: 1,
    medicalHistoryItems: {
      hasDementia: false,
      hasOrganicBrainDamage: false,
      isHeavyAlcohol: false,
      hasDeliriumHistory: false,
      hasGeneralAnesthesia: false,
    },
  };

  describe("正常系", () => {
    it("全項目がfalseの入力を受け付ける", () => {
      const result = saveHighRiskKasanSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.admissionId).toBe(1);
        expect(result.data.medicalHistoryItems.hasDementia).toBe(false);
      }
    });

    it("全項目がtrueの入力を受け付ける", () => {
      const input = {
        admissionId: 1,
        medicalHistoryItems: {
          hasDementia: true,
          hasOrganicBrainDamage: true,
          isHeavyAlcohol: true,
          hasDeliriumHistory: true,
          hasGeneralAnesthesia: true,
        },
      };
      const result = saveHighRiskKasanSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.medicalHistoryItems.hasDementia).toBe(true);
        expect(result.data.medicalHistoryItems.hasGeneralAnesthesia).toBe(true);
      }
    });

    it("一部がtrueの入力を受け付ける", () => {
      const input = {
        admissionId: 5,
        medicalHistoryItems: {
          hasDementia: true,
          hasOrganicBrainDamage: false,
          isHeavyAlcohol: false,
          hasDeliriumHistory: true,
          hasGeneralAnesthesia: false,
        },
      };
      const result = saveHighRiskKasanSchema.safeParse(input);
      expect(result.success).toBe(true);
    });
  });

  describe("バリデーションエラー", () => {
    it("admissionIdが0の場合にエラーを返す", () => {
      const result = saveHighRiskKasanSchema.safeParse({
        ...validInput,
        admissionId: 0,
      });
      expect(result.success).toBe(false);
    });

    it("admissionIdが負の場合にエラーを返す", () => {
      const result = saveHighRiskKasanSchema.safeParse({
        ...validInput,
        admissionId: -1,
      });
      expect(result.success).toBe(false);
    });

    it("medicalHistoryItemsが未指定の場合にエラーを返す", () => {
      const result = saveHighRiskKasanSchema.safeParse({
        admissionId: 1,
      });
      expect(result.success).toBe(false);
    });

    it("medicalHistoryItemsの一部項目が欠けている場合にエラーを返す", () => {
      const result = saveHighRiskKasanSchema.safeParse({
        admissionId: 1,
        medicalHistoryItems: {
          hasDementia: true,
          // 他の項目が欠けている
        },
      });
      expect(result.success).toBe(false);
    });

    it("medicalHistoryItemsの値がboolean以外の場合にエラーを返す", () => {
      const result = saveHighRiskKasanSchema.safeParse({
        admissionId: 1,
        medicalHistoryItems: {
          hasDementia: "yes",
          hasOrganicBrainDamage: false,
          isHeavyAlcohol: false,
          hasDeliriumHistory: false,
          hasGeneralAnesthesia: false,
        },
      });
      expect(result.success).toBe(false);
    });
  });
});
