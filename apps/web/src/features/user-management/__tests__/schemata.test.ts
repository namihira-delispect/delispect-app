import { describe, it, expect } from "vitest";
import {
  createUserSchema,
  updateUserSchema,
  userListFilterSchema,
} from "../schemata";

describe("createUserSchema", () => {
  const validInput = {
    username: "testuser",
    email: "test@example.com",
    password: "TestPassword1!",
    confirmPassword: "TestPassword1!",
    roles: ["GENERAL"],
  };

  describe("正常系", () => {
    it("有効な入力を受け付ける", () => {
      const result = createUserSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("複数ロールを受け付ける", () => {
      const result = createUserSchema.safeParse({
        ...validInput,
        roles: ["GENERAL", "SYSTEM_ADMIN"],
      });
      expect(result.success).toBe(true);
    });

    it("ユーザー名が50文字の場合に受け付ける", () => {
      const result = createUserSchema.safeParse({
        ...validInput,
        username: "a".repeat(50),
      });
      expect(result.success).toBe(true);
    });
  });

  describe("バリデーションエラー", () => {
    it("ユーザー名が空の場合にエラーを返す", () => {
      const result = createUserSchema.safeParse({
        ...validInput,
        username: "",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.username).toContain(
          "ユーザー名を入力してください",
        );
      }
    });

    it("ユーザー名が51文字以上の場合にエラーを返す", () => {
      const result = createUserSchema.safeParse({
        ...validInput,
        username: "a".repeat(51),
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.username).toContain(
          "ユーザー名は50文字以内で入力してください",
        );
      }
    });

    it("メールアドレスが空の場合にエラーを返す", () => {
      const result = createUserSchema.safeParse({
        ...validInput,
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
      const result = createUserSchema.safeParse({
        ...validInput,
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
      const result = createUserSchema.safeParse({
        ...validInput,
        email: "a".repeat(247) + "@test.com",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.email).toContain(
          "メールアドレスは255文字以内で入力してください",
        );
      }
    });

    it("パスワードが12文字未満の場合にエラーを返す", () => {
      const result = createUserSchema.safeParse({
        ...validInput,
        password: "Short1!",
        confirmPassword: "Short1!",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.password).toBeDefined();
      }
    });

    it("パスワードに大文字が含まれない場合にエラーを返す", () => {
      const result = createUserSchema.safeParse({
        ...validInput,
        password: "testpassword1!",
        confirmPassword: "testpassword1!",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.password).toBeDefined();
      }
    });

    it("パスワードに小文字が含まれない場合にエラーを返す", () => {
      const result = createUserSchema.safeParse({
        ...validInput,
        password: "TESTPASSWORD1!",
        confirmPassword: "TESTPASSWORD1!",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.password).toBeDefined();
      }
    });

    it("パスワードに数字が含まれない場合にエラーを返す", () => {
      const result = createUserSchema.safeParse({
        ...validInput,
        password: "TestPassword!!",
        confirmPassword: "TestPassword!!",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.password).toBeDefined();
      }
    });

    it("パスワードに記号が含まれない場合にエラーを返す", () => {
      const result = createUserSchema.safeParse({
        ...validInput,
        password: "TestPassword12",
        confirmPassword: "TestPassword12",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.password).toBeDefined();
      }
    });

    it("確認パスワードが一致しない場合にエラーを返す", () => {
      const result = createUserSchema.safeParse({
        ...validInput,
        confirmPassword: "DifferentPw1!",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.confirmPassword).toContain(
          "パスワードと確認用パスワードが一致しません",
        );
      }
    });

    it("ロールが空の場合にエラーを返す", () => {
      const result = createUserSchema.safeParse({
        ...validInput,
        roles: [],
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.roles).toContain(
          "ロールを1つ以上選択してください",
        );
      }
    });

    it("無効なロールの場合にエラーを返す", () => {
      const result = createUserSchema.safeParse({
        ...validInput,
        roles: ["INVALID_ROLE"],
      });
      expect(result.success).toBe(false);
    });
  });
});

describe("updateUserSchema", () => {
  const validInput = {
    username: "testuser",
    email: "test@example.com",
    roles: ["GENERAL"],
    isActive: true,
  };

  describe("正常系", () => {
    it("パスワードなしで有効な入力を受け付ける", () => {
      const result = updateUserSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("パスワード変更ありで有効な入力を受け付ける", () => {
      const result = updateUserSchema.safeParse({
        ...validInput,
        password: "NewPassword1!",
        confirmPassword: "NewPassword1!",
      });
      expect(result.success).toBe(true);
    });

    it("空文字のパスワードを受け付ける（変更なし）", () => {
      const result = updateUserSchema.safeParse({
        ...validInput,
        password: "",
        confirmPassword: "",
      });
      expect(result.success).toBe(true);
    });

    it("isActiveがfalseの場合に受け付ける", () => {
      const result = updateUserSchema.safeParse({
        ...validInput,
        isActive: false,
      });
      expect(result.success).toBe(true);
    });
  });

  describe("バリデーションエラー", () => {
    it("ユーザー名が空の場合にエラーを返す", () => {
      const result = updateUserSchema.safeParse({
        ...validInput,
        username: "",
      });
      expect(result.success).toBe(false);
    });

    it("メールアドレスの形式が不正な場合にエラーを返す", () => {
      const result = updateUserSchema.safeParse({
        ...validInput,
        email: "invalid",
      });
      expect(result.success).toBe(false);
    });

    it("パスワード変更時に確認パスワードが不一致の場合にエラーを返す", () => {
      const result = updateUserSchema.safeParse({
        ...validInput,
        password: "NewPassword1!",
        confirmPassword: "DifferentPw1!",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.confirmPassword).toContain(
          "パスワードと確認用パスワードが一致しません",
        );
      }
    });

    it("ロールが空の場合にエラーを返す", () => {
      const result = updateUserSchema.safeParse({
        ...validInput,
        roles: [],
      });
      expect(result.success).toBe(false);
    });
  });
});

describe("userListFilterSchema", () => {
  describe("正常系", () => {
    it("空のオブジェクトでデフォルト値を返す", () => {
      const result = userListFilterSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({
          search: "",
          role: "",
          isActive: "",
          sortColumn: "createdAt",
          sortDirection: "desc",
          page: 1,
          pageSize: 20,
        });
      }
    });

    it("すべてのフィルタを受け付ける", () => {
      const result = userListFilterSchema.safeParse({
        search: "test",
        role: "GENERAL",
        isActive: "true",
        sortColumn: "username",
        sortDirection: "asc",
        page: 2,
        pageSize: 50,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.search).toBe("test");
        expect(result.data.role).toBe("GENERAL");
        expect(result.data.isActive).toBe("true");
        expect(result.data.sortColumn).toBe("username");
        expect(result.data.sortDirection).toBe("asc");
        expect(result.data.page).toBe(2);
        expect(result.data.pageSize).toBe(50);
      }
    });

    it("文字列の数値をパースする", () => {
      const result = userListFilterSchema.safeParse({
        page: "3",
        pageSize: "10",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(3);
        expect(result.data.pageSize).toBe(10);
      }
    });
  });

  describe("バリデーションエラー", () => {
    it("無効なソートカラムの場合にエラーを返す", () => {
      const result = userListFilterSchema.safeParse({
        sortColumn: "invalidColumn",
      });
      expect(result.success).toBe(false);
    });

    it("無効なソート方向の場合にエラーを返す", () => {
      const result = userListFilterSchema.safeParse({
        sortDirection: "invalid",
      });
      expect(result.success).toBe(false);
    });

    it("ページ番号が0以下の場合にエラーを返す", () => {
      const result = userListFilterSchema.safeParse({
        page: 0,
      });
      expect(result.success).toBe(false);
    });

    it("ページサイズが101以上の場合にエラーを返す", () => {
      const result = userListFilterSchema.safeParse({
        pageSize: 101,
      });
      expect(result.success).toBe(false);
    });
  });
});
