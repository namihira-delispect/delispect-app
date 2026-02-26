import { z } from "zod";
import { passwordSchema } from "@delispect/auth";

/** ロール選択肢 */
const roleValues = ["GENERAL", "SYSTEM_ADMIN", "SUPER_ADMIN"] as const;

/**
 * ユーザー登録バリデーションスキーマ
 */
export const createUserSchema = z
  .object({
    username: z
      .string()
      .min(1, "ユーザー名を入力してください")
      .max(50, "ユーザー名は50文字以内で入力してください"),
    email: z
      .string()
      .min(1, "メールアドレスを入力してください")
      .max(255, "メールアドレスは255文字以内で入力してください")
      .email("有効なメールアドレスを入力してください"),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "確認用パスワードを入力してください"),
    roles: z
      .array(z.enum(roleValues))
      .min(1, "ロールを1つ以上選択してください"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "パスワードと確認用パスワードが一致しません",
    path: ["confirmPassword"],
  });

export type CreateUserInput = z.infer<typeof createUserSchema>;

/**
 * ユーザー編集バリデーションスキーマ
 *
 * パスワードは省略可能（変更する場合のみ入力）
 */
export const updateUserSchema = z
  .object({
    username: z
      .string()
      .min(1, "ユーザー名を入力してください")
      .max(50, "ユーザー名は50文字以内で入力してください"),
    email: z
      .string()
      .min(1, "メールアドレスを入力してください")
      .max(255, "メールアドレスは255文字以内で入力してください")
      .email("有効なメールアドレスを入力してください"),
    password: z.union([z.literal(""), passwordSchema]).optional(),
    confirmPassword: z.string().optional(),
    roles: z
      .array(z.enum(roleValues))
      .min(1, "ロールを1つ以上選択してください"),
    isActive: z.boolean(),
  })
  .refine(
    (data) => {
      if (data.password && data.password !== "") {
        return data.password === data.confirmPassword;
      }
      return true;
    },
    {
      message: "パスワードと確認用パスワードが一致しません",
      path: ["confirmPassword"],
    },
  );

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

/**
 * ユーザー一覧取得フィルタスキーマ
 */
export const userListFilterSchema = z.object({
  search: z.string().optional().default(""),
  role: z.enum(["", ...roleValues]).optional().default(""),
  isActive: z.enum(["", "true", "false"]).optional().default(""),
  sortColumn: z
    .enum(["username", "email", "createdAt", "updatedAt"])
    .optional()
    .default("createdAt"),
  sortDirection: z.enum(["asc", "desc"]).optional().default("desc"),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export type UserListFilterInput = z.infer<typeof userListFilterSchema>;
