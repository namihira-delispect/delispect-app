import { z } from "zod";
import { passwordSchema } from "@delispect/auth";

/**
 * プロフィール更新バリデーションスキーマ
 */
export const updateProfileSchema = z.object({
  username: z
    .string()
    .min(1, "ユーザー名を入力してください")
    .max(50, "ユーザー名は50文字以内で入力してください"),
  email: z
    .string()
    .min(1, "メールアドレスを入力してください")
    .max(255, "メールアドレスは255文字以内で入力してください")
    .email("有効なメールアドレスを入力してください"),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

/**
 * パスワード変更バリデーションスキーマ
 * 12文字以上、大文字・小文字・数字・記号の組み合わせ
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "現在のパスワードを入力してください"),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "確認用パスワードを入力してください"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "新しいパスワードと確認用パスワードが一致しません",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "新しいパスワードは現在のパスワードと異なるものを入力してください",
    path: ["newPassword"],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
