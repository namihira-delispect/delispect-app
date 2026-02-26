import { describe, it, expect } from "vitest";
import { updateSystemSettingsSchema } from "../schemata";

describe("updateSystemSettingsSchema", () => {
  describe("正常系", () => {
    it("有効な入力を受け付ける", () => {
      const result = updateSystemSettingsSchema.safeParse({
        batchImportTime: "06:00",
        batchImportDateRangeDays: 2,
      });
      expect(result.success).toBe(true);
    });

    it("深夜0時の時刻を受け付ける", () => {
      const result = updateSystemSettingsSchema.safeParse({
        batchImportTime: "00:00",
        batchImportDateRangeDays: 1,
      });
      expect(result.success).toBe(true);
    });

    it("23:59の時刻を受け付ける", () => {
      const result = updateSystemSettingsSchema.safeParse({
        batchImportTime: "23:59",
        batchImportDateRangeDays: 1,
      });
      expect(result.success).toBe(true);
    });

    it("対象日数が1日の場合に受け付ける", () => {
      const result = updateSystemSettingsSchema.safeParse({
        batchImportTime: "06:00",
        batchImportDateRangeDays: 1,
      });
      expect(result.success).toBe(true);
    });

    it("対象日数が30日の場合に受け付ける", () => {
      const result = updateSystemSettingsSchema.safeParse({
        batchImportTime: "06:00",
        batchImportDateRangeDays: 30,
      });
      expect(result.success).toBe(true);
    });
  });

  describe("バッチインポート実行時刻のバリデーション", () => {
    it("空文字の場合にエラーを返す", () => {
      const result = updateSystemSettingsSchema.safeParse({
        batchImportTime: "",
        batchImportDateRangeDays: 2,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.batchImportTime).toContain(
          "バッチインポート実行時刻を入力してください",
        );
      }
    });

    it("不正な時刻形式の場合にエラーを返す", () => {
      const result = updateSystemSettingsSchema.safeParse({
        batchImportTime: "6:00",
        batchImportDateRangeDays: 2,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.batchImportTime).toContain(
          "時刻はHH:mm形式で入力してください（例: 06:00）",
        );
      }
    });

    it("24:00の場合にエラーを返す", () => {
      const result = updateSystemSettingsSchema.safeParse({
        batchImportTime: "24:00",
        batchImportDateRangeDays: 2,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.batchImportTime).toContain(
          "時刻はHH:mm形式で入力してください（例: 06:00）",
        );
      }
    });

    it("分が60以上の場合にエラーを返す", () => {
      const result = updateSystemSettingsSchema.safeParse({
        batchImportTime: "06:60",
        batchImportDateRangeDays: 2,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.batchImportTime).toContain(
          "時刻はHH:mm形式で入力してください（例: 06:00）",
        );
      }
    });

    it("コロンなしの時刻の場合にエラーを返す", () => {
      const result = updateSystemSettingsSchema.safeParse({
        batchImportTime: "0600",
        batchImportDateRangeDays: 2,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.batchImportTime).toContain(
          "時刻はHH:mm形式で入力してください（例: 06:00）",
        );
      }
    });
  });

  describe("対象入院日付範囲のバリデーション", () => {
    it("0日の場合にエラーを返す", () => {
      const result = updateSystemSettingsSchema.safeParse({
        batchImportTime: "06:00",
        batchImportDateRangeDays: 0,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.batchImportDateRangeDays).toContain(
          "対象日数は1以上で入力してください",
        );
      }
    });

    it("31日の場合にエラーを返す", () => {
      const result = updateSystemSettingsSchema.safeParse({
        batchImportTime: "06:00",
        batchImportDateRangeDays: 31,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.batchImportDateRangeDays).toContain(
          "対象日数は30以下で入力してください",
        );
      }
    });

    it("小数の場合にエラーを返す", () => {
      const result = updateSystemSettingsSchema.safeParse({
        batchImportTime: "06:00",
        batchImportDateRangeDays: 2.5,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.batchImportDateRangeDays).toContain(
          "対象日数は整数で入力してください",
        );
      }
    });

    it("文字列の場合にエラーを返す", () => {
      const result = updateSystemSettingsSchema.safeParse({
        batchImportTime: "06:00",
        batchImportDateRangeDays: "abc",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.batchImportDateRangeDays).toContain(
          "対象日数は数値で入力してください",
        );
      }
    });

    it("負の値の場合にエラーを返す", () => {
      const result = updateSystemSettingsSchema.safeParse({
        batchImportTime: "06:00",
        batchImportDateRangeDays: -1,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.batchImportDateRangeDays).toContain(
          "対象日数は1以上で入力してください",
        );
      }
    });
  });
});
