import { z } from "zod";

/** ログインフォームのバリデーションスキーマ */
export const loginSchema = z.object({
  username: z
    .string()
    .min(1, "ユーザーIDを入力してください")
    .max(50, "ユーザーIDは50文字以内で入力してください"),
  password: z.string().min(1, "パスワードを入力してください"),
});

/** ログインフォームのバリデーション済み型 */
export type LoginInput = z.infer<typeof loginSchema>;

/** パスワード変更フォームのバリデーションスキーマ */
export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, "現在のパスワードを入力してください"),
    newPassword: z.string().min(1, "新しいパスワードを入力してください"),
    confirmPassword: z
      .string()
      .min(1, "確認用パスワードを入力してください"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "新しいパスワードと確認用パスワードが一致しません",
    path: ["confirmPassword"],
  });

/** パスワード変更フォームのバリデーション済み型 */
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
