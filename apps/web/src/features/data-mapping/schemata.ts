import { z } from "zod";

/**
 * データマッピング作成・更新バリデーションスキーマ
 */
export const dataMappingSchema = z.object({
  mappingType: z.enum(["LAB_ITEM", "PRESCRIPTION_TYPE", "VITAL_SIGN", "WARD", "ROOM"], {
    required_error: "マッピング種別を選択してください",
  }),
  sourceCode: z
    .string()
    .min(1, "病院側コードを入力してください")
    .max(50, "病院側コードは50文字以内で入力してください"),
  targetCode: z
    .string()
    .min(1, "システム項目コードを入力してください")
    .max(50, "システム項目コードは50文字以内で入力してください"),
  priority: z
    .number({ required_error: "優先順位を入力してください" })
    .int("優先順位は整数で入力してください")
    .min(0, "優先順位は0以上で入力してください")
    .max(999, "優先順位は999以下で入力してください"),
});

export type DataMappingInput = z.infer<typeof dataMappingSchema>;

/**
 * データマッピング検索パラメータスキーマ
 */
export const dataMappingSearchSchema = z.object({
  mappingType: z
    .enum(["LAB_ITEM", "PRESCRIPTION_TYPE", "VITAL_SIGN", "WARD", "ROOM"])
    .optional(),
});

export type DataMappingSearchInput = z.infer<typeof dataMappingSearchSchema>;
