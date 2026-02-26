import { describe, it, expect } from "vitest";
import { executeRiskAssessmentSchema } from "../schemata";

describe("executeRiskAssessmentSchema（リスク評価実行リクエストスキーマ）", () => {
  describe("正常系", () => {
    it("1件の入院IDで成功する", () => {
      const result = executeRiskAssessmentSchema.safeParse({
        admissionIds: [1],
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.admissionIds).toEqual([1]);
      }
    });

    it("50件の入院IDで成功する", () => {
      const ids = Array.from({ length: 50 }, (_, i) => i + 1);
      const result = executeRiskAssessmentSchema.safeParse({
        admissionIds: ids,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.admissionIds).toHaveLength(50);
      }
    });

    it("複数件の入院IDで成功する", () => {
      const result = executeRiskAssessmentSchema.safeParse({
        admissionIds: [1, 2, 3],
      });
      expect(result.success).toBe(true);
    });
  });

  describe("異常系", () => {
    it("空配列の場合はエラーを返す", () => {
      const result = executeRiskAssessmentSchema.safeParse({
        admissionIds: [],
      });
      expect(result.success).toBe(false);
    });

    it("51件の入院IDの場合はエラーを返す", () => {
      const ids = Array.from({ length: 51 }, (_, i) => i + 1);
      const result = executeRiskAssessmentSchema.safeParse({
        admissionIds: ids,
      });
      expect(result.success).toBe(false);
    });

    it("入院IDが負の数の場合はエラーを返す", () => {
      const result = executeRiskAssessmentSchema.safeParse({
        admissionIds: [-1],
      });
      expect(result.success).toBe(false);
    });

    it("入院IDが0の場合はエラーを返す", () => {
      const result = executeRiskAssessmentSchema.safeParse({
        admissionIds: [0],
      });
      expect(result.success).toBe(false);
    });

    it("入院IDが小数の場合はエラーを返す", () => {
      const result = executeRiskAssessmentSchema.safeParse({
        admissionIds: [1.5],
      });
      expect(result.success).toBe(false);
    });

    it("入院IDが文字列の場合はエラーを返す", () => {
      const result = executeRiskAssessmentSchema.safeParse({
        admissionIds: ["abc"],
      });
      expect(result.success).toBe(false);
    });

    it("admissionIdsが未定義の場合はエラーを返す", () => {
      const result = executeRiskAssessmentSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });
});
