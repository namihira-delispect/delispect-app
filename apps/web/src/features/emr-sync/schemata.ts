import { z } from "zod";
import { MAX_DATE_RANGE_DAYS } from "./types";

/**
 * 手動インポートのバリデーションスキーマ
 *
 * 入院日付の範囲指定（最大7日間）
 */
export const manualImportSchema = z
  .object({
    startDate: z
      .string()
      .min(1, "開始日を入力してください")
      .regex(/^\d{4}-\d{2}-\d{2}$/, "日付はYYYY-MM-DD形式で入力してください"),
    endDate: z
      .string()
      .min(1, "終了日を入力してください")
      .regex(/^\d{4}-\d{2}-\d{2}$/, "日付はYYYY-MM-DD形式で入力してください"),
  })
  .refine(
    (data) => {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      return start <= end;
    },
    {
      message: "終了日は開始日以降の日付を指定してください",
      path: ["endDate"],
    },
  )
  .refine(
    (data) => {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      const diffTime = end.getTime() - start.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      return diffDays < MAX_DATE_RANGE_DAYS;
    },
    {
      message: `指定可能な範囲は最大${MAX_DATE_RANGE_DAYS}日間です`,
      path: ["endDate"],
    },
  );

export type ManualImportSchemaInput = z.infer<typeof manualImportSchema>;

/**
 * バッチインポートのバリデーションスキーマ
 */
export const batchImportSchema = z.object({
  daysBack: z
    .number()
    .int("日数は整数で入力してください")
    .min(1, "日数は1以上で入力してください")
    .max(MAX_DATE_RANGE_DAYS, `日数は${MAX_DATE_RANGE_DAYS}以下で入力してください`)
    .optional()
    .default(2),
  maxRetries: z
    .number()
    .int("リトライ回数は整数で入力してください")
    .min(0, "リトライ回数は0以上で入力してください")
    .max(10, "リトライ回数は10以下で入力してください")
    .optional()
    .default(3),
});

export type BatchImportSchemaInput = z.infer<typeof batchImportSchema>;
