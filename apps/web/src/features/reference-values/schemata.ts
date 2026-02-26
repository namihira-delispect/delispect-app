import { z } from "zod";

/**
 * 基準値更新バリデーションスキーマ
 *
 * 上限値・下限値はDecimal(10,3)のため、数値文字列またはnullを受け付ける。
 * 上限値 >= 下限値のバリデーションも行う。
 */
export const updateReferenceValueSchema = z
  .object({
    id: z.number().int().positive("IDは正の整数で指定してください"),
    lowerLimit: z
      .string()
      .nullable()
      .transform((val) => (val === "" ? null : val))
      .refine(
        (val) => val === null || !isNaN(Number(val)),
        { message: "下限値は数値で入力してください" },
      )
      .refine(
        (val) => val === null || Number(val) >= 0,
        { message: "下限値は0以上で入力してください" },
      ),
    upperLimit: z
      .string()
      .nullable()
      .transform((val) => (val === "" ? null : val))
      .refine(
        (val) => val === null || !isNaN(Number(val)),
        { message: "上限値は数値で入力してください" },
      )
      .refine(
        (val) => val === null || Number(val) >= 0,
        { message: "上限値は0以上で入力してください" },
      ),
  })
  .refine(
    (data) => {
      if (data.lowerLimit !== null && data.upperLimit !== null) {
        return Number(data.upperLimit) >= Number(data.lowerLimit);
      }
      return true;
    },
    {
      message: "上限値は下限値以上で入力してください",
      path: ["upperLimit"],
    },
  );

export type UpdateReferenceValueInput = z.input<typeof updateReferenceValueSchema>;
