import { z } from "zod";

/**
 * 時刻形式（HH:mm）のバリデーション正規表現
 */
const TIME_FORMAT_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

/**
 * システム設定更新バリデーションスキーマ
 */
export const updateSystemSettingsSchema = z.object({
  batchImportTime: z
    .string()
    .min(1, "バッチインポート実行時刻を入力してください")
    .regex(TIME_FORMAT_REGEX, "時刻はHH:mm形式で入力してください（例: 06:00）"),
  batchImportDateRangeDays: z
    .number({ invalid_type_error: "対象日数は数値で入力してください" })
    .int("対象日数は整数で入力してください")
    .min(1, "対象日数は1以上で入力してください")
    .max(30, "対象日数は30以下で入力してください"),
});

export type UpdateSystemSettingsInput = z.infer<typeof updateSystemSettingsSchema>;
