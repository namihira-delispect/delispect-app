import { z } from "zod";

/**
 * ケアプラン詳細取得パラメータのバリデーションスキーマ
 */
export const carePlanDetailParamsSchema = z.object({
  admissionId: z.coerce.number().int().positive("入院IDは正の整数で指定してください"),
});

export type CarePlanDetailParamsInput = z.infer<typeof carePlanDetailParamsSchema>;

/**
 * 転記履歴作成リクエストのバリデーションスキーマ
 */
export const createTranscriptionSchema = z.object({
  carePlanId: z.coerce.number().int().positive("ケアプランIDは正の整数で指定してください"),
  content: z
    .string()
    .min(1, "転記内容を指定してください")
    .max(10000, "転記内容は10000文字以内で指定してください"),
});

export type CreateTranscriptionInput = z.infer<typeof createTranscriptionSchema>;

/**
 * 転記履歴取得パラメータのバリデーションスキーマ
 */
export const transcriptionHistoryParamsSchema = z.object({
  carePlanId: z.coerce.number().int().positive("ケアプランIDは正の整数で指定してください"),
});

export type TranscriptionHistoryParamsInput = z.infer<typeof transcriptionHistoryParamsSchema>;
