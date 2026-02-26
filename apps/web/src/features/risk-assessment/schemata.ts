import { z } from "zod";

/**
 * リスク評価実行リクエストのバリデーションスキーマ
 *
 * 入院IDリストを受け取り、1件以上50件以下であることを検証する。
 */
export const executeRiskAssessmentSchema = z.object({
  admissionIds: z
    .array(z.number().int().positive("入院IDは正の整数で指定してください"))
    .min(1, "評価対象を1件以上選択してください")
    .max(50, "一括評価は50件までです"),
});

export type ExecuteRiskAssessmentInput = z.infer<typeof executeRiskAssessmentSchema>;
