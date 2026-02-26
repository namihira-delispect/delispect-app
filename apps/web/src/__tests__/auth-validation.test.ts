import { describe, it, expect } from "vitest";
import { loginSchema, passwordSchema } from "@delispect/auth";

describe("ログインバリデーション（Web統合テスト）", () => {
  describe("loginSchema", () => {
    it("有効な入力を受け入れる", () => {
      const result = loginSchema.safeParse({
        username: "nurse001",
        password: "MyPassword123!",
      });
      expect(result.success).toBe(true);
    });

    it("ユーザーIDが空の場合はエラーを返す", () => {
      const result = loginSchema.safeParse({
        username: "",
        password: "MyPassword123!",
      });
      expect(result.success).toBe(false);
    });

    it("パスワードが空の場合はエラーを返す", () => {
      const result = loginSchema.safeParse({
        username: "nurse001",
        password: "",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("passwordSchema（パスワード強度チェック）", () => {
    it("12文字以上・大文字・小文字・数字・記号を含むパスワードを受け入れる", () => {
      const result = passwordSchema.safeParse("StrongPass12!");
      expect(result.success).toBe(true);
    });

    it("条件を満たさないパスワードを拒否する", () => {
      // 12文字未満
      expect(passwordSchema.safeParse("Short1!a").success).toBe(false);
      // 大文字なし
      expect(passwordSchema.safeParse("strongpass123!").success).toBe(false);
      // 小文字なし
      expect(passwordSchema.safeParse("STRONGPASS123!").success).toBe(false);
      // 数字なし
      expect(passwordSchema.safeParse("StrongPassword!").success).toBe(false);
      // 記号なし
      expect(passwordSchema.safeParse("StrongPass1234").success).toBe(false);
    });
  });
});
