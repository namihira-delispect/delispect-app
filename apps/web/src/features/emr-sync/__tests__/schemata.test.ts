import { describe, it, expect } from "vitest";
import { manualImportSchema, batchImportSchema } from "../schemata";

describe("manualImportSchema", () => {
  describe("正常系", () => {
    it("有効な日付範囲を受け付ける", () => {
      const result = manualImportSchema.safeParse({
        startDate: "2026-01-01",
        endDate: "2026-01-03",
      });
      expect(result.success).toBe(true);
    });

    it("同一日付の範囲を受け付ける", () => {
      const result = manualImportSchema.safeParse({
        startDate: "2026-01-01",
        endDate: "2026-01-01",
      });
      expect(result.success).toBe(true);
    });

    it("最大6日間の範囲を受け付ける（7日未満）", () => {
      const result = manualImportSchema.safeParse({
        startDate: "2026-01-01",
        endDate: "2026-01-07",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("バリデーションエラー", () => {
    it("開始日が空の場合にエラーを返す", () => {
      const result = manualImportSchema.safeParse({
        startDate: "",
        endDate: "2026-01-03",
      });
      expect(result.success).toBe(false);
    });

    it("終了日が空の場合にエラーを返す", () => {
      const result = manualImportSchema.safeParse({
        startDate: "2026-01-01",
        endDate: "",
      });
      expect(result.success).toBe(false);
    });

    it("開始日の形式が不正な場合にエラーを返す", () => {
      const result = manualImportSchema.safeParse({
        startDate: "2026/01/01",
        endDate: "2026-01-03",
      });
      expect(result.success).toBe(false);
    });

    it("終了日の形式が不正な場合にエラーを返す", () => {
      const result = manualImportSchema.safeParse({
        startDate: "2026-01-01",
        endDate: "20260103",
      });
      expect(result.success).toBe(false);
    });

    it("終了日が開始日より前の場合にエラーを返す", () => {
      const result = manualImportSchema.safeParse({
        startDate: "2026-01-05",
        endDate: "2026-01-01",
      });
      expect(result.success).toBe(false);
    });

    it("日付範囲が7日以上の場合にエラーを返す", () => {
      const result = manualImportSchema.safeParse({
        startDate: "2026-01-01",
        endDate: "2026-01-08",
      });
      expect(result.success).toBe(false);
    });
  });
});

describe("batchImportSchema", () => {
  describe("正常系", () => {
    it("デフォルト値で有効なスキーマを生成する", () => {
      const result = batchImportSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.daysBack).toBe(2);
        expect(result.data.maxRetries).toBe(3);
      }
    });

    it("カスタム値を指定できる", () => {
      const result = batchImportSchema.safeParse({
        daysBack: 5,
        maxRetries: 5,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.daysBack).toBe(5);
        expect(result.data.maxRetries).toBe(5);
      }
    });

    it("daysBackが1の場合に受け付ける", () => {
      const result = batchImportSchema.safeParse({ daysBack: 1 });
      expect(result.success).toBe(true);
    });

    it("daysBackが7の場合に受け付ける", () => {
      const result = batchImportSchema.safeParse({ daysBack: 7 });
      expect(result.success).toBe(true);
    });

    it("maxRetriesが0の場合に受け付ける", () => {
      const result = batchImportSchema.safeParse({ maxRetries: 0 });
      expect(result.success).toBe(true);
    });

    it("maxRetriesが10の場合に受け付ける", () => {
      const result = batchImportSchema.safeParse({ maxRetries: 10 });
      expect(result.success).toBe(true);
    });
  });

  describe("バリデーションエラー", () => {
    it("daysBackが0の場合にエラーを返す", () => {
      const result = batchImportSchema.safeParse({ daysBack: 0 });
      expect(result.success).toBe(false);
    });

    it("daysBackが8以上の場合にエラーを返す", () => {
      const result = batchImportSchema.safeParse({ daysBack: 8 });
      expect(result.success).toBe(false);
    });

    it("daysBackが小数の場合にエラーを返す", () => {
      const result = batchImportSchema.safeParse({ daysBack: 1.5 });
      expect(result.success).toBe(false);
    });

    it("maxRetriesが負数の場合にエラーを返す", () => {
      const result = batchImportSchema.safeParse({ maxRetries: -1 });
      expect(result.success).toBe(false);
    });

    it("maxRetriesが11以上の場合にエラーを返す", () => {
      const result = batchImportSchema.safeParse({ maxRetries: 11 });
      expect(result.success).toBe(false);
    });
  });
});
