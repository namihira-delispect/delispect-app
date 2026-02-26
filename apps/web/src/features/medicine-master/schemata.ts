import { z } from "zod";

/**
 * 薬剤マスタ登録・編集バリデーションスキーマ
 */
export const medicineMasterSchema = z.object({
  medicinesCode: z
    .string()
    .min(1, "薬剤コードを入力してください")
    .max(20, "薬剤コードは20文字以内で入力してください")
    .regex(/^[A-Za-z0-9-]+$/, "薬剤コードは半角英数字とハイフンのみ使用できます"),
  categoryId: z
    .number({ required_error: "カテゴリIDを入力してください" })
    .int("カテゴリIDは整数で入力してください")
    .min(1, "カテゴリIDは1以上で入力してください"),
  riskFactorFlg: z.boolean(),
  displayName: z
    .string()
    .min(1, "表示名を入力してください")
    .max(200, "表示名は200文字以内で入力してください"),
  hospitalCode: z
    .string()
    .min(1, "病院コードを入力してください")
    .max(20, "病院コードは20文字以内で入力してください"),
});

export type MedicineMasterInput = z.infer<typeof medicineMasterSchema>;

/**
 * 薬剤マスタ検索パラメータスキーマ
 */
export const medicineMasterSearchSchema = z.object({
  query: z.string().optional().default(""),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export type MedicineMasterSearchInput = z.infer<typeof medicineMasterSearchSchema>;

/**
 * CSVインポート行のバリデーションスキーマ
 */
export const csvRowSchema = z.object({
  medicines_code: z.string().min(1, "薬剤コードは必須です").max(20, "薬剤コードは20文字以内です"),
  category_id: z
    .string()
    .min(1, "カテゴリIDは必須です")
    .refine((val) => !isNaN(Number(val)) && Number.isInteger(Number(val)) && Number(val) >= 1, {
      message: "カテゴリIDは1以上の整数で入力してください",
    }),
  risk_factor_flg: z
    .string()
    .refine((val) => val === "0" || val === "1" || val === "true" || val === "false", {
      message: "リスク要因フラグは 0, 1, true, false のいずれかで入力してください",
    }),
  display_name: z.string().min(1, "表示名は必須です").max(200, "表示名は200文字以内です"),
  hospital_code: z.string().min(1, "病院コードは必須です").max(20, "病院コードは20文字以内です"),
});

export type CsvRowInput = z.infer<typeof csvRowSchema>;

/**
 * CSVヘッダーの期待値
 */
export const CSV_EXPECTED_HEADERS = [
  "medicines_code",
  "category_id",
  "risk_factor_flg",
  "display_name",
  "hospital_code",
] as const;
