import { describe, it, expect } from "vitest";
import { passwordSchema, loginSchema } from "./validation";

describe("パスワードバリデーション", () => {
  it("有効なパスワードを受け入れる", () => {
    const result = passwordSchema.safeParse("StrongPass123!");
    expect(result.success).toBe(true);
  });

  it("12文字未満のパスワードを拒否する", () => {
    const result = passwordSchema.safeParse("Short1!aA");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("12文字以上");
    }
  });

  it("大文字を含まないパスワードを拒否する", () => {
    const result = passwordSchema.safeParse("strongpass123!");
    expect(result.success).toBe(false);
  });

  it("小文字を含まないパスワードを拒否する", () => {
    const result = passwordSchema.safeParse("STRONGPASS123!");
    expect(result.success).toBe(false);
  });

  it("数字を含まないパスワードを拒否する", () => {
    const result = passwordSchema.safeParse("StrongPassword!");
    expect(result.success).toBe(false);
  });

  it("記号を含まないパスワードを拒否する", () => {
    const result = passwordSchema.safeParse("StrongPass1234");
    expect(result.success).toBe(false);
  });
});

describe("ログイン入力バリデーション", () => {
  it("有効なログイン入力を受け入れる", () => {
    const result = loginSchema.safeParse({
      username: "user001",
      password: "password",
    });
    expect(result.success).toBe(true);
  });

  it("空のユーザーIDを拒否する", () => {
    const result = loginSchema.safeParse({
      username: "",
      password: "password",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.username).toBeDefined();
    }
  });

  it("空のパスワードを拒否する", () => {
    const result = loginSchema.safeParse({
      username: "user001",
      password: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.password).toBeDefined();
    }
  });
});
