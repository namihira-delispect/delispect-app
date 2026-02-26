import { z } from "zod";

/**
 * パスワードバリデーションスキーマ
 * 12文字以上、大文字・小文字・数字・記号の組み合わせ
 */
export const passwordSchema = z
  .string()
  .min(12, "パスワードは12文字以上で入力してください")
  .regex(/[A-Z]/, "大文字を含めてください")
  .regex(/[a-z]/, "小文字を含めてください")
  .regex(/[0-9]/, "数字を含めてください")
  .regex(/[^A-Za-z0-9]/, "記号を含めてください");

/**
 * ログイン入力バリデーションスキーマ
 */
export const loginSchema = z.object({
  username: z.string().min(1, "ユーザーIDを入力してください"),
  password: z.string().min(1, "パスワードを入力してください"),
});
