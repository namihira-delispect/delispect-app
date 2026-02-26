import { describe, it, expect } from "vitest";
import { admissionSearchSchema, batchRiskAssessmentSchema } from "../schemata";

describe("admissionSearchSchema", () => {
  describe("正常系", () => {
    it("空のオブジェクトを受け付ける（デフォルト値が適用される）", () => {
      const result = admissionSearchSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.sortColumn).toBe("admissionDate");
        expect(result.data.sortDirection).toBe("desc");
        expect(result.data.page).toBe(1);
        expect(result.data.pageSize).toBe(20);
      }
    });

    it("すべての検索条件を指定した場合に受け付ける", () => {
      const result = admissionSearchSchema.safeParse({
        riskLevel: "HIGH",
        careStatus: "COMPLETED",
        admissionDateFrom: "2026-01-01",
        admissionDateTo: "2026-12-31",
        assessmentDateFrom: "2026-01-01",
        assessmentDateTo: "2026-12-31",
        name: "田中",
        sortColumn: "patientName",
        sortDirection: "asc",
        page: 2,
        pageSize: 50,
      });
      expect(result.success).toBe(true);
    });

    it("リスク評価のすべての値を受け付ける", () => {
      for (const level of ["HIGH", "LOW", "NOT_ASSESSED"]) {
        const result = admissionSearchSchema.safeParse({ riskLevel: level });
        expect(result.success).toBe(true);
      }
    });

    it("ケア実施状況のすべての値を受け付ける", () => {
      for (const status of ["COMPLETED", "IN_PROGRESS", "NOT_STARTED"]) {
        const result = admissionSearchSchema.safeParse({ careStatus: status });
        expect(result.success).toBe(true);
      }
    });

    it("入院日の開始日のみ指定した場合に受け付ける", () => {
      const result = admissionSearchSchema.safeParse({
        admissionDateFrom: "2026-01-01",
      });
      expect(result.success).toBe(true);
    });

    it("文字列のpage/pageSizeを数値に変換する", () => {
      const result = admissionSearchSchema.safeParse({
        page: "3",
        pageSize: "50",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(3);
        expect(result.data.pageSize).toBe(50);
      }
    });

    it("ソートカラムにageを指定した場合に受け付ける", () => {
      const result = admissionSearchSchema.safeParse({
        sortColumn: "age",
      });
      expect(result.success).toBe(true);
    });

    it("ソートカラムにpatientIdを指定した場合に受け付ける", () => {
      const result = admissionSearchSchema.safeParse({
        sortColumn: "patientId",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("バリデーションエラー", () => {
    it("無効なリスク評価値の場合にエラーを返す", () => {
      const result = admissionSearchSchema.safeParse({
        riskLevel: "INVALID",
      });
      expect(result.success).toBe(false);
    });

    it("無効なケア実施状況値の場合にエラーを返す", () => {
      const result = admissionSearchSchema.safeParse({
        careStatus: "INVALID",
      });
      expect(result.success).toBe(false);
    });

    it("無効な日付文字列の場合にエラーを返す（admissionDateFrom）", () => {
      const result = admissionSearchSchema.safeParse({
        admissionDateFrom: "invalid-date",
      });
      expect(result.success).toBe(false);
    });

    it("無効な日付文字列の場合にエラーを返す（admissionDateTo）", () => {
      const result = admissionSearchSchema.safeParse({
        admissionDateTo: "invalid-date",
      });
      expect(result.success).toBe(false);
    });

    it("無効な日付文字列の場合にエラーを返す（assessmentDateFrom）", () => {
      const result = admissionSearchSchema.safeParse({
        assessmentDateFrom: "not-a-date",
      });
      expect(result.success).toBe(false);
    });

    it("無効な日付文字列の場合にエラーを返す（assessmentDateTo）", () => {
      const result = admissionSearchSchema.safeParse({
        assessmentDateTo: "not-a-date",
      });
      expect(result.success).toBe(false);
    });

    it("名前が101文字以上の場合にエラーを返す", () => {
      const result = admissionSearchSchema.safeParse({
        name: "あ".repeat(101),
      });
      expect(result.success).toBe(false);
    });

    it("無効なソートカラムの場合にエラーを返す", () => {
      const result = admissionSearchSchema.safeParse({
        sortColumn: "invalidColumn",
      });
      expect(result.success).toBe(false);
    });

    it("ページ番号が0以下の場合にエラーを返す", () => {
      const result = admissionSearchSchema.safeParse({
        page: 0,
      });
      expect(result.success).toBe(false);
    });

    it("ページサイズが101以上の場合にエラーを返す", () => {
      const result = admissionSearchSchema.safeParse({
        pageSize: 101,
      });
      expect(result.success).toBe(false);
    });
  });
});

describe("batchRiskAssessmentSchema", () => {
  describe("正常系", () => {
    it("1件の入院IDを受け付ける", () => {
      const result = batchRiskAssessmentSchema.safeParse({
        admissionIds: [1],
      });
      expect(result.success).toBe(true);
    });

    it("50件の入院IDを受け付ける（上限）", () => {
      const ids = Array.from({ length: 50 }, (_, i) => i + 1);
      const result = batchRiskAssessmentSchema.safeParse({
        admissionIds: ids,
      });
      expect(result.success).toBe(true);
    });

    it("複数の入院IDを受け付ける", () => {
      const result = batchRiskAssessmentSchema.safeParse({
        admissionIds: [1, 2, 3, 10, 20],
      });
      expect(result.success).toBe(true);
    });
  });

  describe("バリデーションエラー", () => {
    it("空配列の場合にエラーを返す", () => {
      const result = batchRiskAssessmentSchema.safeParse({
        admissionIds: [],
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.admissionIds).toContain(
          "評価対象を1件以上選択してください",
        );
      }
    });

    it("51件以上の場合にエラーを返す", () => {
      const ids = Array.from({ length: 51 }, (_, i) => i + 1);
      const result = batchRiskAssessmentSchema.safeParse({
        admissionIds: ids,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.admissionIds).toContain("一括評価は50件までです");
      }
    });

    it("負の数値の場合にエラーを返す", () => {
      const result = batchRiskAssessmentSchema.safeParse({
        admissionIds: [-1],
      });
      expect(result.success).toBe(false);
    });

    it("小数の場合にエラーを返す", () => {
      const result = batchRiskAssessmentSchema.safeParse({
        admissionIds: [1.5],
      });
      expect(result.success).toBe(false);
    });

    it("admissionIdsが未指定の場合にエラーを返す", () => {
      const result = batchRiskAssessmentSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });
});
