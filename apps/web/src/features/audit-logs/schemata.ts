import { z } from "zod";

/**
 * 監査ログ検索パラメータのバリデーションスキーマ
 */
export const auditLogSearchSchema = z.object({
  startDate: z
    .string()
    .optional()
    .refine(
      (val) => !val || !isNaN(Date.parse(val)),
      "有効な日時を入力してください",
    ),
  endDate: z
    .string()
    .optional()
    .refine(
      (val) => !val || !isNaN(Date.parse(val)),
      "有効な日時を入力してください",
    ),
  username: z
    .string()
    .max(50, "ユーザー名は50文字以内で入力してください")
    .optional(),
  actions: z.array(z.string()).optional(),
  patientId: z
    .string()
    .max(50, "患者IDは50文字以内で入力してください")
    .optional(),
  ipAddress: z
    .string()
    .max(45, "IPアドレスは45文字以内で入力してください")
    .optional(),
  keyword: z
    .string()
    .max(100, "キーワードは100文字以内で入力してください")
    .optional(),
  sortColumn: z
    .enum(["occurredAt", "actorUsername", "action"])
    .optional()
    .default("occurredAt"),
  sortDirection: z.enum(["asc", "desc"]).optional().default("desc"),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export type AuditLogSearchInput = z.infer<typeof auditLogSearchSchema>;

/**
 * 検索条件保存のバリデーションスキーマ
 */
export const saveSearchConditionSchema = z.object({
  name: z
    .string()
    .min(1, "検索条件名を入力してください")
    .max(50, "検索条件名は50文字以内で入力してください"),
  params: auditLogSearchSchema,
});

export type SaveSearchConditionInput = z.infer<typeof saveSearchConditionSchema>;
