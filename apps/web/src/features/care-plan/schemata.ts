import { z } from "zod";

/**
 * ケアプラン取得パラメータのバリデーションスキーマ
 */
export const carePlanParamsSchema = z.object({
  admissionId: z.coerce.number().int().positive("入院IDは正の整数で指定してください"),
});

export type CarePlanParamsInput = z.infer<typeof carePlanParamsSchema>;

/**
 * ケアプラン作成リクエストのバリデーションスキーマ
 */
export const createCarePlanSchema = z.object({
  admissionId: z.coerce.number().int().positive("入院IDは正の整数で指定してください"),
});

export type CreateCarePlanInput = z.infer<typeof createCarePlanSchema>;

/**
 * ケアプランアイテムステータス更新のバリデーションスキーマ
 */
export const updateCarePlanItemStatusSchema = z.object({
  itemId: z.coerce.number().int().positive("アイテムIDは正の整数で指定してください"),
  status: z.enum(["NOT_STARTED", "IN_PROGRESS", "COMPLETED", "NOT_APPLICABLE"], {
    required_error: "ステータスを指定してください",
    invalid_type_error: "無効なステータスです",
  }),
});

export type UpdateCarePlanItemStatusInput = z.infer<typeof updateCarePlanItemStatusSchema>;
