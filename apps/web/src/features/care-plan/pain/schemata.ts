import { z } from "zod";
import { PAIN_SITES } from "./types";

/**
 * 痛みの部位IDのバリデーション用enum
 */
const painSiteIdValues = PAIN_SITES.map((s) => s.id) as [string, ...string[]];

/**
 * 部位詳細の確認項目スキーマ
 */
export const painSiteDetailSchema = z.object({
  siteId: z.enum(painSiteIdValues, {
    required_error: "部位IDは必須です",
    invalid_type_error: "無効な部位IDです",
  }),
  touchPain: z.boolean().nullable(),
  movementPain: z.boolean().nullable(),
  numbness: z.boolean().nullable(),
});

export type PainSiteDetailInput = z.infer<typeof painSiteDetailSchema>;

/**
 * 疼痛ケアプラン詳細データのバリデーションスキーマ
 */
export const painCarePlanDetailsSchema = z.object({
  hasDaytimePain: z.boolean().nullable(),
  hasNighttimeAwakening: z.boolean().nullable(),
  selectedSiteIds: z.array(
    z.enum(painSiteIdValues, {
      invalid_type_error: "無効な部位IDです",
    }),
  ),
  siteDetails: z.array(painSiteDetailSchema),
  sleepImpact: z.boolean().nullable(),
  mobilityImpact: z.boolean().nullable(),
  toiletImpact: z.boolean().nullable(),
});

export type PainCarePlanDetailsInput = z.infer<typeof painCarePlanDetailsSchema>;

/**
 * 疼痛ケアプラン保存リクエストのバリデーションスキーマ
 */
export const savePainCarePlanSchema = z.object({
  admissionId: z.coerce.number().int().positive("入院IDは正の整数で指定してください"),
  currentQuestionId: z.string().nullable().optional(),
  details: painCarePlanDetailsSchema,
  isCompleted: z.boolean().default(false),
});

export type SavePainCarePlanInput = z.infer<typeof savePainCarePlanSchema>;

/**
 * 疼痛ケアプラン取得パラメータのバリデーションスキーマ
 */
export const getPainCarePlanParamsSchema = z.object({
  admissionId: z.coerce.number().int().positive("入院IDは正の整数で指定してください"),
});

export type GetPainCarePlanParamsInput = z.infer<typeof getPainCarePlanParamsSchema>;
