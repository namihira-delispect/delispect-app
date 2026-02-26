import { z } from "zod";

/**
 * 便秘ケアプラン取得パラメータのバリデーションスキーマ
 */
export const constipationParamsSchema = z.object({
  admissionId: z.coerce.number().int().positive("入院IDは正の整数で指定してください"),
});

export type ConstipationParamsInput = z.infer<typeof constipationParamsSchema>;

/**
 * ブリストルスケールのバリデーション
 */
const bristolScaleSchema = z.coerce
  .number()
  .int()
  .min(1, "ブリストルスケールは1〜7の範囲で指定してください")
  .max(7, "ブリストルスケールは1〜7の範囲で指定してください");

/**
 * 食事量のバリデーション
 */
const mealAmountSchema = z.enum(["LARGE", "NORMAL", "SMALL"], {
  required_error: "食事量を指定してください",
  invalid_type_error: "無効な食事量です",
});

/**
 * 便秘アセスメントデータのバリデーションスキーマ
 */
export const constipationAssessmentSchema = z.object({
  daysWithoutBowelMovement: z.coerce
    .number()
    .int()
    .min(0, "便が出ていない日数は0以上で指定してください")
    .max(30, "便が出ていない日数は30日以内で指定してください"),
  bristolScale: bristolScaleSchema.nullable(),
  hasNausea: z.boolean({
    required_error: "吐き気の有無を指定してください",
  }),
  hasAbdominalDistension: z.boolean({
    required_error: "お腹の張りの有無を指定してください",
  }),
  hasAppetite: z.boolean({
    required_error: "食欲の有無を指定してください",
  }),
  mealAmount: mealAmountSchema,
  hasBowelSounds: z.boolean({
    required_error: "腸蠕動音の確認結果を指定してください",
  }),
  hasIntestinalGas: z.boolean({
    required_error: "腸内ガスの確認結果を指定してください",
  }),
  hasFecalMass: z.boolean({
    required_error: "便塊の確認結果を指定してください",
  }),
});

export type ConstipationAssessmentInput = z.infer<typeof constipationAssessmentSchema>;

/**
 * 便秘ケアプラン保存リクエストのバリデーションスキーマ
 */
export const saveConstipationSchema = z.object({
  admissionId: z.coerce.number().int().positive("入院IDは正の整数で指定してください"),
  assessment: constipationAssessmentSchema,
});

export type SaveConstipationInput = z.infer<typeof saveConstipationSchema>;
