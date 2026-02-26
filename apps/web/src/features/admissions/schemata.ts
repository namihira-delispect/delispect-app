import { z } from "zod";

/**
 * 患者入院一覧検索パラメータのバリデーションスキーマ
 */
export const admissionSearchSchema = z.object({
  riskLevel: z.enum(["HIGH", "LOW", "NOT_ASSESSED"]).optional(),
  careStatus: z.enum(["COMPLETED", "IN_PROGRESS", "NOT_STARTED"]).optional(),
  admissionDateFrom: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), "有効な日付を入力してください"),
  admissionDateTo: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), "有効な日付を入力してください"),
  assessmentDateFrom: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), "有効な日付を入力してください"),
  assessmentDateTo: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), "有効な日付を入力してください"),
  name: z.string().max(100, "名前は100文字以内で入力してください").optional(),
  sortColumn: z
    .enum(["admissionDate", "patientName", "patientId", "age"])
    .optional()
    .default("admissionDate"),
  sortDirection: z.enum(["asc", "desc"]).optional().default("desc"),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export type AdmissionSearchInput = z.infer<typeof admissionSearchSchema>;

/**
 * 一括リスク評価リクエストのバリデーションスキーマ
 */
export const batchRiskAssessmentSchema = z.object({
  admissionIds: z
    .array(z.number().int().positive("入院IDは正の整数で指定してください"))
    .min(1, "評価対象を1件以上選択してください")
    .max(50, "一括評価は50件までです"),
});

export type BatchRiskAssessmentInput = z.infer<typeof batchRiskAssessmentSchema>;

/**
 * 入院詳細取得パラメータのバリデーションスキーマ
 */
export const admissionDetailParamsSchema = z.object({
  id: z.coerce.number().int().positive("入院IDは正の整数で指定してください"),
});

export type AdmissionDetailParamsInput = z.infer<typeof admissionDetailParamsSchema>;

/**
 * 楽観的ロック用バージョンチェックスキーマ
 */
export const optimisticLockSchema = z.object({
  admissionId: z.number().int().positive("入院IDは正の整数で指定してください"),
  expectedVersion: z.number().int().min(0, "バージョンは0以上の整数で指定してください"),
});

export type OptimisticLockInput = z.infer<typeof optimisticLockSchema>;
