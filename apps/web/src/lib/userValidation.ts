import { z } from "zod";

/** パスワード要件のバリデーション */
const passwordSchema = z
  .string()
  .min(12, "パスワードは12文字以上で入力してください")
  .regex(/[A-Z]/, "パスワードに大文字を含めてください")
  .regex(/[a-z]/, "パスワードに小文字を含めてください")
  .regex(/[0-9]/, "パスワードに数字を含めてください")
  .regex(
    /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/,
    "パスワードに記号を含めてください"
  );

/** ユーザー新規登録のバリデーションスキーマ */
export const createUserSchema = z.object({
  username: z
    .string()
    .min(1, "ユーザーIDを入力してください")
    .max(50, "ユーザーIDは50文字以内で入力してください")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "ユーザーIDは英数字、ハイフン、アンダースコアのみ使用できます"
    ),
  email: z
    .string()
    .min(1, "メールアドレスを入力してください")
    .max(255, "メールアドレスは255文字以内で入力してください")
    .email("有効なメールアドレスを入力してください"),
  firstName: z
    .string()
    .min(1, "名を入力してください")
    .max(50, "名は50文字以内で入力してください"),
  lastName: z
    .string()
    .min(1, "姓を入力してください")
    .max(50, "姓は50文字以内で入力してください"),
  password: passwordSchema,
  confirmPassword: z.string().min(1, "確認用パスワードを入力してください"),
  roleIds: z.array(z.number()).min(1, "ロールを1つ以上選択してください"),
  isActive: z.boolean().default(true),
}).refine((data) => data.password === data.confirmPassword, {
  message: "パスワードと確認用パスワードが一致しません",
  path: ["confirmPassword"],
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

/** ユーザー情報編集のバリデーションスキーマ */
export const updateUserSchema = z.object({
  email: z
    .string()
    .min(1, "メールアドレスを入力してください")
    .max(255, "メールアドレスは255文字以内で入力してください")
    .email("有効なメールアドレスを入力してください"),
  firstName: z
    .string()
    .min(1, "名を入力してください")
    .max(50, "名は50文字以内で入力してください"),
  lastName: z
    .string()
    .min(1, "姓を入力してください")
    .max(50, "姓は50文字以内で入力してください"),
  roleIds: z.array(z.number()).min(1, "ロールを1つ以上選択してください"),
  isActive: z.boolean(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

/** パスワードリセットのバリデーションスキーマ */
export const resetPasswordSchema = z.object({
  newPassword: passwordSchema,
  confirmPassword: z.string().min(1, "確認用パスワードを入力してください"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "パスワードと確認用パスワードが一致しません",
  path: ["confirmPassword"],
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

/** ユーザー検索パラメータのスキーマ */
export const userSearchParamsSchema = z.object({
  query: z.string().optional().default(""),
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(100).optional().default(20),
  sortKey: z
    .enum(["username", "lastName", "email", "isActive", "createdAt"])
    .optional()
    .default("createdAt"),
  sortDirection: z.enum(["asc", "desc"]).optional().default("desc"),
  isActive: z
    .string()
    .optional()
    .transform((val) => {
      if (val === "true") return true;
      if (val === "false") return false;
      return undefined;
    }),
});

export type UserSearchParams = z.infer<typeof userSearchParamsSchema>;
