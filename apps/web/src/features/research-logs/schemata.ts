import { z } from "zod";

/**
 * ダッシュボード期間フィルターのバリデーションスキーマ
 */
export const dashboardFilterSchema = z.object({
  startDate: z
    .string()
    .min(1, "開始日を指定してください")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "日付はYYYY-MM-DD形式で入力してください"),
  endDate: z
    .string()
    .min(1, "終了日を指定してください")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "日付はYYYY-MM-DD形式で入力してください"),
});

export type DashboardFilterInput = z.infer<typeof dashboardFilterSchema>;

/**
 * CSVエクスポートのバリデーションスキーマ
 */
export const csvExportSchema = z.object({
  startDate: z
    .string()
    .min(1, "開始日を指定してください")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "日付はYYYY-MM-DD形式で入力してください"),
  endDate: z
    .string()
    .min(1, "終了日を指定してください")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "日付はYYYY-MM-DD形式で入力してください"),
  actionType: z.string().optional(),
});

export type CsvExportInput = z.infer<typeof csvExportSchema>;

/**
 * 操作ログ一覧フィルターのバリデーションスキーマ
 */
export const logListFilterSchema = z.object({
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "日付はYYYY-MM-DD形式で入力してください")
    .optional(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "日付はYYYY-MM-DD形式で入力してください")
    .optional(),
  actionType: z.string().optional(),
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
});

export type LogListFilterInput = z.infer<typeof logListFilterSchema>;
