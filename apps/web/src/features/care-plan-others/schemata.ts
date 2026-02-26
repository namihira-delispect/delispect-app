import { z } from "zod";

/**
 * その他カテゴリの対象カテゴリーバリデーション
 */
export const othersCategorySchema = z.enum(["MOBILITY", "DEMENTIA", "SAFETY", "SLEEP"], {
  required_error: "カテゴリーを指定してください",
  invalid_type_error: "無効なカテゴリーです",
});

export type OthersCategoryInput = z.infer<typeof othersCategorySchema>;

/**
 * チェックリスト保存データのバリデーションスキーマ
 */
export const checklistSaveDataSchema = z.object({
  selectedOptionIds: z
    .array(z.string().min(1, "選択肢IDは空文字列にできません"))
    .min(0, "選択肢IDリストを指定してください"),
  notes: z.string().max(1000, "メモは1000文字以内で入力してください").optional(),
});

export type ChecklistSaveDataInput = z.infer<typeof checklistSaveDataSchema>;

/**
 * その他カテゴリのケアプラン保存リクエストのバリデーションスキーマ
 */
export const saveOthersCarePlanSchema = z.object({
  itemId: z.coerce.number().int().positive("アイテムIDは正の整数で指定してください"),
  checklist: checklistSaveDataSchema,
});

export type SaveOthersCarePlanInput = z.infer<typeof saveOthersCarePlanSchema>;

/**
 * その他カテゴリのケアプラン取得パラメータのバリデーションスキーマ
 */
export const getOthersCarePlanParamsSchema = z.object({
  itemId: z.coerce.number().int().positive("アイテムIDは正の整数で指定してください"),
});

export type GetOthersCarePlanParamsInput = z.infer<typeof getOthersCarePlanParamsSchema>;

/**
 * カテゴリー別取得パラメータのバリデーションスキーマ
 */
export const getOthersByCategoryParamsSchema = z.object({
  admissionId: z.coerce.number().int().positive("入院IDは正の整数で指定してください"),
  category: othersCategorySchema,
});

export type GetOthersByCategoryParamsInput = z.infer<typeof getOthersByCategoryParamsSchema>;
