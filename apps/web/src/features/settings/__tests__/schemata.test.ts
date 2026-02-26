import { describe, it, expect } from "vitest";
import { updateProfileSchema, changePasswordSchema } from "../schemata";

describe("updateProfileSchema", () => {
  describe("正常系", () => {
    it("有効な入力を受け付ける", () => {
      const result = updateProfileSchema.safeParse({
        username: "testuser",
        email: "test@example.com",
      });
      expect(result.success).toBe(true);
    });

    it("ユーザー名が50文字の場合に受け付ける", () => {
      const result = updateProfileSchema.safeParse({
        username: "a".repeat(50),
        email: "test@example.com",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("バリデーションエラー", () => {
    it("ユーザー名が空の場合にエラーを返す", () => {
      const result = updateProfileSchema.safeParse({
        username: "",
        email: "test@example.com",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.username).toContain(
          "ユーザー名を入力してください",
        );
      }
    });

    it("ユーザー名が51文字以上の場合にエラーを返す", () => {
      const result = updateProfileSchema.safeParse({
        username: "a".repeat(51),
        email: "test@example.com",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.username).toContain(
          "ユーザー名は50文字以内で入力してください",
        );
      }
    });

    it("メールアドレスが空の場合にエラーを返す", () => {
      const result = updateProfileSchema.safeParse({
        username: "testuser",
        email: "",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.email).toContain(
          "メールアドレスを入力してください",
        );
      }
    });

    it("メールアドレスの形式が不正な場合にエラーを返す", () => {
      const result = updateProfileSchema.safeParse({
        username: "testuser",
        email: "invalid-email",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.email).toContain(
          "有効なメールアドレスを入力してください",
        );
      }
    });

    it("メールアドレスが256文字以上の場合にエラーを返す", () => {
      const result = updateProfileSchema.safeParse({
        username: "testuser",
        email: "a".repeat(247) + "@test.com",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.email).toContain(
          "メールアドレスは255文字以内で入力してください",
        );
      }
    });
  });
});

describe("changePasswordSchema", () => {
  const validInput = {
    currentPassword: "OldPassword1!",
    newPassword: "NewPassword1!",
    confirmPassword: "NewPassword1!",
  };

  describe("正常系", () => {
    it("有効な入力を受け付ける", () => {
      const result = changePasswordSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("12文字以上の複雑なパスワードを受け付ける", () => {
      const result = changePasswordSchema.safeParse({
        currentPassword: "OldPassword1!",
        newPassword: "Abcdef1234!@#$",
        confirmPassword: "Abcdef1234!@#$",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("パスワードバリデーション", () => {
    it("新しいパスワードが12文字未満の場合にエラーを返す", () => {
      const result = changePasswordSchema.safeParse({
        ...validInput,
        newPassword: "Short1!",
        confirmPassword: "Short1!",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.newPassword).toBeDefined();
      }
    });

    it("新しいパスワードに大文字が含まれない場合にエラーを返す", () => {
      const result = changePasswordSchema.safeParse({
        ...validInput,
        newPassword: "newpassword1!",
        confirmPassword: "newpassword1!",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.newPassword).toBeDefined();
      }
    });

    it("新しいパスワードに小文字が含まれない場合にエラーを返す", () => {
      const result = changePasswordSchema.safeParse({
        ...validInput,
        newPassword: "NEWPASSWORD1!",
        confirmPassword: "NEWPASSWORD1!",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.newPassword).toBeDefined();
      }
    });

    it("新しいパスワードに数字が含まれない場合にエラーを返す", () => {
      const result = changePasswordSchema.safeParse({
        ...validInput,
        newPassword: "NewPassword!!",
        confirmPassword: "NewPassword!!",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.newPassword).toBeDefined();
      }
    });

    it("新しいパスワードに記号が含まれない場合にエラーを返す", () => {
      const result = changePasswordSchema.safeParse({
        ...validInput,
        newPassword: "NewPassword12",
        confirmPassword: "NewPassword12",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.newPassword).toBeDefined();
      }
    });
  });

  describe("確認パスワードの一致チェック", () => {
    it("確認パスワードが一致しない場合にエラーを返す", () => {
      const result = changePasswordSchema.safeParse({
        ...validInput,
        confirmPassword: "DifferentPw1!",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.confirmPassword).toContain(
          "新しいパスワードと確認用パスワードが一致しません",
        );
      }
    });

    it("確認パスワードが空の場合にエラーを返す", () => {
      const result = changePasswordSchema.safeParse({
        ...validInput,
        confirmPassword: "",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("現在のパスワードとの比較", () => {
    it("新しいパスワードが現在のパスワードと同じ場合にエラーを返す", () => {
      const samePassword = "SamePassword1!";
      const result = changePasswordSchema.safeParse({
        currentPassword: samePassword,
        newPassword: samePassword,
        confirmPassword: samePassword,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.newPassword).toContain(
          "新しいパスワードは現在のパスワードと異なるものを入力してください",
        );
      }
    });
  });

  describe("現在のパスワードの必須チェック", () => {
    it("現在のパスワードが空の場合にエラーを返す", () => {
      const result = changePasswordSchema.safeParse({
        currentPassword: "",
        newPassword: "NewPassword1!",
        confirmPassword: "NewPassword1!",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.currentPassword).toBeDefined();
      }
    });
  });
});
