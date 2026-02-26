import { describe, it, expect } from "vitest";
import {
  createUserSchema,
  updateUserSchema,
  resetPasswordSchema,
  userSearchParamsSchema,
} from "../userValidation";

describe("createUserSchema", () => {
  const validData = {
    username: "yamada_taro",
    email: "yamada@example.com",
    firstName: "太郎",
    lastName: "山田",
    password: "Password123!@#",
    confirmPassword: "Password123!@#",
    roleIds: [1],
    isActive: true,
  };

  it("有効なデータでバリデーションが成功する", () => {
    const result = createUserSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("ユーザーIDが空の場合にエラーになる", () => {
    const result = createUserSchema.safeParse({ ...validData, username: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe(
        "ユーザーIDを入力してください"
      );
    }
  });

  it("ユーザーIDが50文字を超える場合にエラーになる", () => {
    const result = createUserSchema.safeParse({
      ...validData,
      username: "a".repeat(51),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe(
        "ユーザーIDは50文字以内で入力してください"
      );
    }
  });

  it("ユーザーIDに不正な文字が含まれる場合にエラーになる", () => {
    const result = createUserSchema.safeParse({
      ...validData,
      username: "user name",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe(
        "ユーザーIDは英数字、ハイフン、アンダースコアのみ使用できます"
      );
    }
  });

  it("メールアドレスが不正な形式の場合にエラーになる", () => {
    const result = createUserSchema.safeParse({
      ...validData,
      email: "invalid-email",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe(
        "有効なメールアドレスを入力してください"
      );
    }
  });

  it("パスワードが12文字未満の場合にエラーになる", () => {
    const result = createUserSchema.safeParse({
      ...validData,
      password: "Pass123!",
      confirmPassword: "Pass123!",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const passwordError = result.error.errors.find(
        (e) => e.path.includes("password") && !e.path.includes("confirmPassword")
      );
      expect(passwordError?.message).toBe(
        "パスワードは12文字以上で入力してください"
      );
    }
  });

  it("パスワードに大文字が含まれない場合にエラーになる", () => {
    const result = createUserSchema.safeParse({
      ...validData,
      password: "password123!@#",
      confirmPassword: "password123!@#",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const passwordError = result.error.errors.find(
        (e) => e.path.includes("password") && !e.path.includes("confirmPassword")
      );
      expect(passwordError?.message).toBe(
        "パスワードに大文字を含めてください"
      );
    }
  });

  it("パスワードに小文字が含まれない場合にエラーになる", () => {
    const result = createUserSchema.safeParse({
      ...validData,
      password: "PASSWORD123!@#",
      confirmPassword: "PASSWORD123!@#",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const passwordError = result.error.errors.find(
        (e) => e.path.includes("password") && !e.path.includes("confirmPassword")
      );
      expect(passwordError?.message).toBe(
        "パスワードに小文字を含めてください"
      );
    }
  });

  it("パスワードに数字が含まれない場合にエラーになる", () => {
    const result = createUserSchema.safeParse({
      ...validData,
      password: "PasswordTest!@#",
      confirmPassword: "PasswordTest!@#",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const passwordError = result.error.errors.find(
        (e) => e.path.includes("password") && !e.path.includes("confirmPassword")
      );
      expect(passwordError?.message).toBe(
        "パスワードに数字を含めてください"
      );
    }
  });

  it("パスワードに記号が含まれない場合にエラーになる", () => {
    const result = createUserSchema.safeParse({
      ...validData,
      password: "Password12345",
      confirmPassword: "Password12345",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const passwordError = result.error.errors.find(
        (e) => e.path.includes("password") && !e.path.includes("confirmPassword")
      );
      expect(passwordError?.message).toBe(
        "パスワードに記号を含めてください"
      );
    }
  });

  it("パスワードと確認用パスワードが一致しない場合にエラーになる", () => {
    const result = createUserSchema.safeParse({
      ...validData,
      password: "Password123!@#",
      confirmPassword: "DifferentPass1!",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const confirmError = result.error.errors.find((e) =>
        e.path.includes("confirmPassword")
      );
      expect(confirmError?.message).toBe(
        "パスワードと確認用パスワードが一致しません"
      );
    }
  });

  it("ロールが選択されていない場合にエラーになる", () => {
    const result = createUserSchema.safeParse({
      ...validData,
      roleIds: [],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const roleError = result.error.errors.find((e) =>
        e.path.includes("roleIds")
      );
      expect(roleError?.message).toBe("ロールを1つ以上選択してください");
    }
  });

  it("名が空の場合にエラーになる", () => {
    const result = createUserSchema.safeParse({
      ...validData,
      firstName: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe("名を入力してください");
    }
  });

  it("姓が空の場合にエラーになる", () => {
    const result = createUserSchema.safeParse({
      ...validData,
      lastName: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe("姓を入力してください");
    }
  });
});

describe("updateUserSchema", () => {
  const validData = {
    email: "yamada@example.com",
    firstName: "太郎",
    lastName: "山田",
    roleIds: [1],
    isActive: true,
  };

  it("有効なデータでバリデーションが成功する", () => {
    const result = updateUserSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("メールアドレスが空の場合にエラーになる", () => {
    const result = updateUserSchema.safeParse({ ...validData, email: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe(
        "メールアドレスを入力してください"
      );
    }
  });

  it("ロールが空の場合にエラーになる", () => {
    const result = updateUserSchema.safeParse({ ...validData, roleIds: [] });
    expect(result.success).toBe(false);
  });
});

describe("resetPasswordSchema", () => {
  it("有効なデータでバリデーションが成功する", () => {
    const result = resetPasswordSchema.safeParse({
      newPassword: "NewPassword123!",
      confirmPassword: "NewPassword123!",
    });
    expect(result.success).toBe(true);
  });

  it("パスワードが一致しない場合にエラーになる", () => {
    const result = resetPasswordSchema.safeParse({
      newPassword: "NewPassword123!",
      confirmPassword: "DifferentPass1!",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const confirmError = result.error.errors.find((e) =>
        e.path.includes("confirmPassword")
      );
      expect(confirmError?.message).toBe(
        "パスワードと確認用パスワードが一致しません"
      );
    }
  });

  it("パスワード要件を満たさない場合にエラーになる", () => {
    const result = resetPasswordSchema.safeParse({
      newPassword: "short",
      confirmPassword: "short",
    });
    expect(result.success).toBe(false);
  });
});

describe("userSearchParamsSchema", () => {
  it("デフォルト値が正しく設定される", () => {
    const result = userSearchParamsSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.query).toBe("");
      expect(result.data.page).toBe(1);
      expect(result.data.pageSize).toBe(20);
      expect(result.data.sortKey).toBe("createdAt");
      expect(result.data.sortDirection).toBe("desc");
      expect(result.data.isActive).toBeUndefined();
    }
  });

  it("isActiveのフィルターがtrueに変換される", () => {
    const result = userSearchParamsSchema.safeParse({ isActive: "true" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isActive).toBe(true);
    }
  });

  it("isActiveのフィルターがfalseに変換される", () => {
    const result = userSearchParamsSchema.safeParse({ isActive: "false" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isActive).toBe(false);
    }
  });

  it("有効なソートキーを受け付ける", () => {
    const validKeys = [
      "username",
      "lastName",
      "email",
      "isActive",
      "createdAt",
    ] as const;
    for (const key of validKeys) {
      const result = userSearchParamsSchema.safeParse({ sortKey: key });
      expect(result.success).toBe(true);
    }
  });

  it("無効なソートキーを拒否する", () => {
    const result = userSearchParamsSchema.safeParse({ sortKey: "invalid" });
    expect(result.success).toBe(false);
  });

  it("ページサイズの上限を超えるとエラーになる", () => {
    const result = userSearchParamsSchema.safeParse({ pageSize: 101 });
    expect(result.success).toBe(false);
  });
});
