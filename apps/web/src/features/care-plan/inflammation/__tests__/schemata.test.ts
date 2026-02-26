import { describe, it, expect } from "vitest";
import {
  inflammationParamsSchema,
  saveInflammationSchema,
  completeInflammationSchema,
} from "../schemata";

describe("inflammationParamsSchema", () => {
  describe("正常系", () => {
    it("正の整数admissionIdを受け付ける", () => {
      const result = inflammationParamsSchema.safeParse({ admissionId: 1 });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.admissionId).toBe(1);
      }
    });

    it("文字列のadmissionIdを数値に変換する", () => {
      const result = inflammationParamsSchema.safeParse({ admissionId: "42" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.admissionId).toBe(42);
      }
    });

    it("大きな数値のadmissionIdを受け付ける", () => {
      const result = inflammationParamsSchema.safeParse({ admissionId: 999999 });
      expect(result.success).toBe(true);
    });
  });

  describe("バリデーションエラー", () => {
    it("admissionIdが0の場合にエラーを返す", () => {
      const result = inflammationParamsSchema.safeParse({ admissionId: 0 });
      expect(result.success).toBe(false);
    });

    it("admissionIdが負の数値の場合にエラーを返す", () => {
      const result = inflammationParamsSchema.safeParse({ admissionId: -1 });
      expect(result.success).toBe(false);
    });

    it("admissionIdが小数の場合にエラーを返す", () => {
      const result = inflammationParamsSchema.safeParse({ admissionId: 1.5 });
      expect(result.success).toBe(false);
    });

    it("admissionIdが未指定の場合にエラーを返す", () => {
      const result = inflammationParamsSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });
});

describe("saveInflammationSchema", () => {
  describe("正常系", () => {
    it("全てのフィールドが正しい場合に受け付ける", () => {
      const result = saveInflammationSchema.safeParse({
        itemId: 1,
        admissionId: 2,
        currentQuestionId: "lab_results",
        hasPain: null,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.itemId).toBe(1);
        expect(result.data.admissionId).toBe(2);
        expect(result.data.currentQuestionId).toBe("lab_results");
        expect(result.data.hasPain).toBeNull();
      }
    });

    it("hasPainがtrueの場合に受け付ける", () => {
      const result = saveInflammationSchema.safeParse({
        itemId: 1,
        admissionId: 2,
        currentQuestionId: "pain_check",
        hasPain: true,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.hasPain).toBe(true);
      }
    });

    it("hasPainがfalseの場合に受け付ける", () => {
      const result = saveInflammationSchema.safeParse({
        itemId: 1,
        admissionId: 2,
        currentQuestionId: "pain_check",
        hasPain: false,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.hasPain).toBe(false);
      }
    });

    it("vital_signsの質問IDを受け付ける", () => {
      const result = saveInflammationSchema.safeParse({
        itemId: 1,
        admissionId: 2,
        currentQuestionId: "vital_signs",
        hasPain: null,
      });
      expect(result.success).toBe(true);
    });

    it("suggestionの質問IDを受け付ける", () => {
      const result = saveInflammationSchema.safeParse({
        itemId: 1,
        admissionId: 2,
        currentQuestionId: "suggestion",
        hasPain: null,
      });
      expect(result.success).toBe(true);
    });

    it("文字列のIDを数値に変換する", () => {
      const result = saveInflammationSchema.safeParse({
        itemId: "5",
        admissionId: "10",
        currentQuestionId: "lab_results",
        hasPain: null,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.itemId).toBe(5);
        expect(result.data.admissionId).toBe(10);
      }
    });
  });

  describe("バリデーションエラー", () => {
    it("itemIdが0の場合にエラーを返す", () => {
      const result = saveInflammationSchema.safeParse({
        itemId: 0,
        admissionId: 2,
        currentQuestionId: "lab_results",
        hasPain: null,
      });
      expect(result.success).toBe(false);
    });

    it("admissionIdが負の場合にエラーを返す", () => {
      const result = saveInflammationSchema.safeParse({
        itemId: 1,
        admissionId: -1,
        currentQuestionId: "lab_results",
        hasPain: null,
      });
      expect(result.success).toBe(false);
    });

    it("無効なcurrentQuestionIdの場合にエラーを返す", () => {
      const result = saveInflammationSchema.safeParse({
        itemId: 1,
        admissionId: 2,
        currentQuestionId: "invalid",
        hasPain: null,
      });
      expect(result.success).toBe(false);
    });

    it("currentQuestionIdが未指定の場合にエラーを返す", () => {
      const result = saveInflammationSchema.safeParse({
        itemId: 1,
        admissionId: 2,
        hasPain: null,
      });
      expect(result.success).toBe(false);
    });

    it("itemIdが未指定の場合にエラーを返す", () => {
      const result = saveInflammationSchema.safeParse({
        admissionId: 2,
        currentQuestionId: "lab_results",
        hasPain: null,
      });
      expect(result.success).toBe(false);
    });
  });
});

describe("completeInflammationSchema", () => {
  describe("正常系", () => {
    it("正しい入力を受け付ける", () => {
      const result = completeInflammationSchema.safeParse({
        itemId: 1,
        admissionId: 2,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.itemId).toBe(1);
        expect(result.data.admissionId).toBe(2);
      }
    });

    it("文字列のIDを数値に変換する", () => {
      const result = completeInflammationSchema.safeParse({
        itemId: "3",
        admissionId: "7",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.itemId).toBe(3);
        expect(result.data.admissionId).toBe(7);
      }
    });
  });

  describe("バリデーションエラー", () => {
    it("itemIdが0の場合にエラーを返す", () => {
      const result = completeInflammationSchema.safeParse({
        itemId: 0,
        admissionId: 2,
      });
      expect(result.success).toBe(false);
    });

    it("admissionIdが負の場合にエラーを返す", () => {
      const result = completeInflammationSchema.safeParse({
        itemId: 1,
        admissionId: -1,
      });
      expect(result.success).toBe(false);
    });

    it("itemIdが未指定の場合にエラーを返す", () => {
      const result = completeInflammationSchema.safeParse({
        admissionId: 2,
      });
      expect(result.success).toBe(false);
    });

    it("admissionIdが未指定の場合にエラーを返す", () => {
      const result = completeInflammationSchema.safeParse({
        itemId: 1,
      });
      expect(result.success).toBe(false);
    });
  });
});
