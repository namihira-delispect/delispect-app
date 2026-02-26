import bcrypt from "bcryptjs";

/** パスワードバリデーション結果の型 */
export type PasswordValidationResult =
  | { success: true }
  | { success: false; error: string };

const SALT_ROUNDS = 12;

/**
 * パスワードの要件を検証する
 * - 12文字以上
 * - 大文字を含む
 * - 小文字を含む
 * - 数字を含む
 * - 記号を含む
 */
export function validatePassword(password: string): PasswordValidationResult {
  if (password.length < 12) {
    return { success: false, error: "パスワードは12文字以上で入力してください" };
  }

  if (!/[A-Z]/.test(password)) {
    return { success: false, error: "パスワードに大文字を含めてください" };
  }

  if (!/[a-z]/.test(password)) {
    return { success: false, error: "パスワードに小文字を含めてください" };
  }

  if (!/[0-9]/.test(password)) {
    return { success: false, error: "パスワードに数字を含めてください" };
  }

  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password)) {
    return { success: false, error: "パスワードに記号を含めてください" };
  }

  return { success: true };
}

/**
 * パスワードをbcryptでハッシュ化する
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * パスワードとハッシュを検証する
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
