import { z } from "zod";

/**
 * 薬剤ケアプランデータ取得パラメータのバリデーションスキーマ
 */
export const medicationCarePlanParamsSchema = z.object({
  admissionId: z.coerce.number().int().positive("入院IDは正の整数で指定してください"),
});

export type MedicationCarePlanParamsInput = z.infer<typeof medicationCarePlanParamsSchema>;

/**
 * 代替薬剤選択のバリデーションスキーマ
 */
export const selectedAlternativeSchema = z.object({
  originalPrescriptionId: z.coerce
    .number()
    .int()
    .positive("元の処方IDは正の整数で指定してください"),
  originalDrugName: z.string().min(1, "元の薬剤名を指定してください"),
  alternativeDrugName: z.string().min(1, "代替薬剤名を指定してください"),
  changeReason: z.string().min(1, "変更理由を指定してください"),
});

export type SelectedAlternativeInput = z.infer<typeof selectedAlternativeSchema>;

/**
 * 薬剤ケアプラン保存リクエストのバリデーションスキーマ
 */
export const saveMedicationCarePlanSchema = z.object({
  carePlanItemId: z.coerce
    .number()
    .int()
    .positive("ケアプランアイテムIDは正の整数で指定してください"),
  currentQuestionId: z.enum(
    ["risk_drug_review", "opioid_review", "alternative_selection", "confirmation"],
    {
      required_error: "現在の質問IDを指定してください",
      invalid_type_error: "無効な質問IDです",
    },
  ),
  details: z.object({
    riskDrugMatches: z.array(z.any()),
    opioidDrugs: z.array(z.any()),
    selectedAlternatives: z.array(selectedAlternativeSchema),
    instructions: z.string(),
    completedAt: z.string().optional(),
  }),
  status: z.enum(["IN_PROGRESS", "COMPLETED"], {
    required_error: "ステータスを指定してください",
    invalid_type_error: "無効なステータスです",
  }),
});

export type SaveMedicationCarePlanInput = z.infer<typeof saveMedicationCarePlanSchema>;
