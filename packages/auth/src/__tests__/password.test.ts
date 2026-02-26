import { describe, it, expect } from "vitest";
import {
  validatePassword,
  hashPassword,
  verifyPassword,
} from "../password";

describe("パスワードバリデーション", () => {
  describe("validatePassword", () => {
    it("12文字以上で大文字・小文字・数字・記号を含むパスワードは有効", () => {
      const result = validatePassword("Abcdefg1234!");
      expect(result.success).toBe(true);
    });

    it("12文字未満のパスワードは無効", () => {
      const result = validatePassword("Abc1234!");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("12文字以上");
      }
    });

    it("大文字を含まないパスワードは無効", () => {
      const result = validatePassword("abcdefg1234!");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("大文字");
      }
    });

    it("小文字を含まないパスワードは無効", () => {
      const result = validatePassword("ABCDEFG1234!");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("小文字");
      }
    });

    it("数字を含まないパスワードは無効", () => {
      const result = validatePassword("Abcdefghijk!");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("数字");
      }
    });

    it("記号を含まないパスワードは無効", () => {
      const result = validatePassword("Abcdefg12345");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("記号");
      }
    });

    it("空文字は無効", () => {
      const result = validatePassword("");
      expect(result.success).toBe(false);
    });
  });

  describe("hashPassword / verifyPassword", () => {
    it("パスワードをハッシュ化して検証できる", async () => {
      const password = "Abcdefg1234!";
      const hash = await hashPassword(password);
      expect(hash).not.toBe(password);

      const isValid = await verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });

    it("不正なパスワードは検証に失敗する", async () => {
      const password = "Abcdefg1234!";
      const hash = await hashPassword(password);

      const isValid = await verifyPassword("WrongPassword1!", hash);
      expect(isValid).toBe(false);
    });
  });
});
