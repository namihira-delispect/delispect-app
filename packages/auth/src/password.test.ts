import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("パスワードハッシュ化", () => {
  it("パスワードをハッシュ化できる", async () => {
    const password = "TestPassword123!";
    const hash = await hashPassword(password);

    expect(hash).toBeDefined();
    expect(hash).not.toBe(password);
    expect(hash.length).toBeGreaterThan(0);
  });

  it("同じパスワードでも異なるハッシュが生成される", async () => {
    const password = "TestPassword123!";
    const hash1 = await hashPassword(password);
    const hash2 = await hashPassword(password);

    expect(hash1).not.toBe(hash2);
  });

  it("正しいパスワードで検証が成功する", async () => {
    const password = "TestPassword123!";
    const hash = await hashPassword(password);

    const result = await verifyPassword(password, hash);
    expect(result).toBe(true);
  });

  it("誤ったパスワードで検証が失敗する", async () => {
    const password = "TestPassword123!";
    const hash = await hashPassword(password);

    const result = await verifyPassword("WrongPassword123!", hash);
    expect(result).toBe(false);
  });
});
