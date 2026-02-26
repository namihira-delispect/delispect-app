import { z } from "zod";

/**
 * 炎症データ取得パラメータのバリデーションスキーマ
 */
export const inflammationParamsSchema = z.object({
  admissionId: z.coerce.number().int().positive("入院IDは正の整数で指定してください"),
});

export type InflammationParamsInput = z.infer<typeof inflammationParamsSchema>;

/**
 * 炎症ケアプラン保存リクエストのバリデーションスキーマ
 */
export const saveInflammationSchema = z.object({
  itemId: z.coerce.number().int().positive("アイテムIDは正の整数で指定してください"),
  admissionId: z.coerce.number().int().positive("入院IDは正の整数で指定してください"),
  currentQuestionId: z.enum(["lab_results", "vital_signs", "pain_check", "suggestion"], {
    required_error: "質問IDを指定してください",
    invalid_type_error: "無効な質問IDです",
  }),
  hasPain: z.boolean().nullable(),
});

export type SaveInflammationInput = z.infer<typeof saveInflammationSchema>;

/**
 * 炎症ケアプラン完了リクエストのバリデーションスキーマ
 */
export const completeInflammationSchema = z.object({
  itemId: z.coerce.number().int().positive("アイテムIDは正の整数で指定してください"),
  admissionId: z.coerce.number().int().positive("入院IDは正の整数で指定してください"),
});

export type CompleteInflammationInput = z.infer<typeof completeInflammationSchema>;
