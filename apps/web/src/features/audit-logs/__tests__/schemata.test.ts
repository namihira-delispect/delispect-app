import { describe, it, expect } from "vitest";
import { auditLogSearchSchema, saveSearchConditionSchema } from "../schemata";

describe("auditLogSearchSchema", () => {
  describe("正常系", () => {
    it("空のオブジェクトを受け付ける（デフォルト値が適用される）", () => {
      const result = auditLogSearchSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.sortColumn).toBe("occurredAt");
        expect(result.data.sortDirection).toBe("desc");
        expect(result.data.page).toBe(1);
        expect(result.data.pageSize).toBe(20);
      }
    });

    it("すべての検索条件を指定した場合に受け付ける", () => {
      const result = auditLogSearchSchema.safeParse({
        startDate: "2026-01-01T00:00:00",
        endDate: "2026-12-31T23:59:59",
        username: "admin",
        actions: ["LOGIN", "LOGOUT"],
        patientId: "P001",
        ipAddress: "192.168.1.1",
        keyword: "テスト",
        sortColumn: "action",
        sortDirection: "asc",
        page: 2,
        pageSize: 50,
      });
      expect(result.success).toBe(true);
    });

    it("期間の開始日時のみ指定した場合に受け付ける", () => {
      const result = auditLogSearchSchema.safeParse({
        startDate: "2026-01-01T00:00:00",
      });
      expect(result.success).toBe(true);
    });

    it("ソートカラムにactorUsernameを指定した場合に受け付ける", () => {
      const result = auditLogSearchSchema.safeParse({
        sortColumn: "actorUsername",
      });
      expect(result.success).toBe(true);
    });

    it("文字列のpage/pageSizeを数値に変換する", () => {
      const result = auditLogSearchSchema.safeParse({
        page: "3",
        pageSize: "50",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(3);
        expect(result.data.pageSize).toBe(50);
      }
    });
  });

  describe("バリデーションエラー", () => {
    it("無効な日時文字列の場合にエラーを返す", () => {
      const result = auditLogSearchSchema.safeParse({
        startDate: "invalid-date",
      });
      expect(result.success).toBe(false);
    });

    it("ユーザー名が51文字以上の場合にエラーを返す", () => {
      const result = auditLogSearchSchema.safeParse({
        username: "a".repeat(51),
      });
      expect(result.success).toBe(false);
    });

    it("患者IDが51文字以上の場合にエラーを返す", () => {
      const result = auditLogSearchSchema.safeParse({
        patientId: "a".repeat(51),
      });
      expect(result.success).toBe(false);
    });

    it("IPアドレスが46文字以上の場合にエラーを返す", () => {
      const result = auditLogSearchSchema.safeParse({
        ipAddress: "a".repeat(46),
      });
      expect(result.success).toBe(false);
    });

    it("キーワードが101文字以上の場合にエラーを返す", () => {
      const result = auditLogSearchSchema.safeParse({
        keyword: "a".repeat(101),
      });
      expect(result.success).toBe(false);
    });

    it("無効なソートカラムの場合にエラーを返す", () => {
      const result = auditLogSearchSchema.safeParse({
        sortColumn: "invalidColumn",
      });
      expect(result.success).toBe(false);
    });

    it("ページ番号が0以下の場合にエラーを返す", () => {
      const result = auditLogSearchSchema.safeParse({
        page: 0,
      });
      expect(result.success).toBe(false);
    });

    it("ページサイズが101以上の場合にエラーを返す", () => {
      const result = auditLogSearchSchema.safeParse({
        pageSize: 101,
      });
      expect(result.success).toBe(false);
    });
  });
});

describe("saveSearchConditionSchema", () => {
  describe("正常系", () => {
    it("有効な入力を受け付ける", () => {
      const result = saveSearchConditionSchema.safeParse({
        name: "テスト条件",
        params: {
          startDate: "2026-01-01T00:00:00",
          actions: ["LOGIN"],
        },
      });
      expect(result.success).toBe(true);
    });

    it("検索条件名が50文字の場合に受け付ける", () => {
      const result = saveSearchConditionSchema.safeParse({
        name: "あ".repeat(50),
        params: {},
      });
      expect(result.success).toBe(true);
    });
  });

  describe("バリデーションエラー", () => {
    it("検索条件名が空の場合にエラーを返す", () => {
      const result = saveSearchConditionSchema.safeParse({
        name: "",
        params: {},
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.name).toContain(
          "検索条件名を入力してください",
        );
      }
    });

    it("検索条件名が51文字以上の場合にエラーを返す", () => {
      const result = saveSearchConditionSchema.safeParse({
        name: "あ".repeat(51),
        params: {},
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.name).toContain(
          "検索条件名は50文字以内で入力してください",
        );
      }
    });
  });
});
