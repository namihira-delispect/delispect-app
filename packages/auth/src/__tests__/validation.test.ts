import { describe, it, expect } from "vitest";
import { loginSchema } from "../validation";

describe("ログインバリデーション", () => {
  describe("loginSchema", () => {
    it("有効なログイン情報はバリデーション成功", () => {
      const result = loginSchema.safeParse({
        username: "testuser",
        password: "Abcdefg1234!",
      });
      expect(result.success).toBe(true);
    });

    it("ユーザー名が空の場合はバリデーション失敗", () => {
      const result = loginSchema.safeParse({
        username: "",
        password: "Abcdefg1234!",
      });
      expect(result.success).toBe(false);
    });

    it("パスワードが空の場合はバリデーション失敗", () => {
      const result = loginSchema.safeParse({
        username: "testuser",
        password: "",
      });
      expect(result.success).toBe(false);
    });

    it("ユーザー名が50文字を超える場合はバリデーション失敗", () => {
      const result = loginSchema.safeParse({
        username: "a".repeat(51),
        password: "Abcdefg1234!",
      });
      expect(result.success).toBe(false);
    });

    it("ユーザー名とパスワードの両方が未定義の場合はバリデーション失敗", () => {
      const result = loginSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });
});
