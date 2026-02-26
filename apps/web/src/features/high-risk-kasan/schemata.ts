import { z } from "zod";

/**
 * ハイリスクケア加算アセスメント取得パラメータのバリデーションスキーマ
 */
export const highRiskKasanParamsSchema = z.object({
  admissionId: z.coerce.number().int().positive("入院IDは正の整数で指定してください"),
});

export type HighRiskKasanParamsInput = z.infer<typeof highRiskKasanParamsSchema>;

/**
 * ハイリスクケア加算アセスメント保存のバリデーションスキーマ
 */
export const saveHighRiskKasanSchema = z.object({
  admissionId: z.coerce.number().int().positive("入院IDは正の整数で指定してください"),
  medicalHistoryItems: z.object({
    hasDementia: z.boolean({
      required_error: "認知症の該当/非該当を選択してください",
    }),
    hasOrganicBrainDamage: z.boolean({
      required_error: "脳器質的障害の該当/非該当を選択してください",
    }),
    isHeavyAlcohol: z.boolean({
      required_error: "アルコール多飲の該当/非該当を選択してください",
    }),
    hasDeliriumHistory: z.boolean({
      required_error: "せん妄の既往の該当/非該当を選択してください",
    }),
    hasGeneralAnesthesia: z.boolean({
      required_error: "全身麻酔の予定の該当/非該当を選択してください",
    }),
  }),
});

export type SaveHighRiskKasanInput = z.infer<typeof saveHighRiskKasanSchema>;
