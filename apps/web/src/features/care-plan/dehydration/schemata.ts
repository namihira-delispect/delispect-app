import { z } from "zod";

/**
 * 脱水ケアプラン：Zodバリデーションスキーマ
 */

/** 目視確認の選択肢 */
export const visualConditionEnum = z.enum(["NORMAL", "MILD", "SEVERE"], {
  required_error: "状態を選択してください",
  invalid_type_error: "無効な選択です",
});

/** 水分摂取頻度の選択肢 */
export const intakeFrequencyEnum = z.enum(["FREQUENT", "MODERATE", "RARE"], {
  required_error: "頻度を選択してください",
  invalid_type_error: "無効な選択です",
});

/** 採血結果の回答スキーマ */
export const labValueAnswerSchema = z.object({
  value: z.number().nullable(),
  lowerLimit: z.number().nullable(),
  upperLimit: z.number().nullable(),
  unit: z.string().nullable(),
  deviationStatus: z.enum(["NORMAL", "HIGH", "LOW", "NO_DATA"]),
});

/** 脱水アセスメント詳細スキーマ */
export const dehydrationDetailsSchema = z.object({
  labHt: labValueAnswerSchema.nullable(),
  labHb: labValueAnswerSchema.nullable(),
  vitalPulse: z.number().int().min(0).max(300).nullable(),
  vitalSystolicBp: z.number().int().min(0).max(300).nullable(),
  vitalDiastolicBp: z.number().int().min(0).max(300).nullable(),
  visualSkin: visualConditionEnum.nullable(),
  visualOral: visualConditionEnum.nullable(),
  visualDizziness: visualConditionEnum.nullable(),
  visualUrine: visualConditionEnum.nullable(),
  intakeFrequency: intakeFrequencyEnum.nullable(),
  intakeAmount: z.number().min(0).max(10000).nullable(),
});

export type DehydrationDetailsInput = z.infer<typeof dehydrationDetailsSchema>;

/** 脱水アセスメント質問ID */
export const dehydrationQuestionIdEnum = z.enum([
  "lab_ht",
  "lab_hb",
  "vital_pulse",
  "vital_bp",
  "visual_skin",
  "visual_oral",
  "visual_dizziness",
  "visual_urine",
  "intake_frequency",
  "intake_amount",
]);

/** 脱水アセスメント保存リクエストスキーマ */
export const saveDehydrationSchema = z.object({
  itemId: z.coerce.number().int().positive("アイテムIDは正の整数で指定してください"),
  currentQuestionId: dehydrationQuestionIdEnum,
  details: dehydrationDetailsSchema,
});

export type SaveDehydrationInput = z.infer<typeof saveDehydrationSchema>;

/** 脱水アセスメント完了リクエストスキーマ */
export const completeDehydrationSchema = z.object({
  itemId: z.coerce.number().int().positive("アイテムIDは正の整数で指定してください"),
  details: dehydrationDetailsSchema,
});

export type CompleteDehydrationInput = z.infer<typeof completeDehydrationSchema>;

/** 脱水アセスメント取得パラメータスキーマ */
export const getDehydrationParamsSchema = z.object({
  itemId: z.coerce.number().int().positive("アイテムIDは正の整数で指定してください"),
});

export type GetDehydrationParamsInput = z.infer<typeof getDehydrationParamsSchema>;
