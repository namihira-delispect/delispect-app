"use server";

import { authorizeServerAction } from "@/lib/auth";
import type { Result } from "@/shared/types";
import type { MedicationCarePlanResponse } from "../types";
import { medicationCarePlanParamsSchema } from "../schemata";
import { getMedicationCarePlan } from "../queries/getMedicationCarePlan";

/**
 * 薬剤ケアプランデータを取得するServer Action
 *
 * 認証済みユーザーのみ実行可能。
 * 入院IDに対応する薬剤ケアプランの表示データを返す。
 */
export async function getMedicationCarePlanAction(input: {
  admissionId: number;
}): Promise<Result<MedicationCarePlanResponse>> {
  // 認証チェック
  const authResult = await authorizeServerAction();
  if (!authResult.success) {
    return authResult;
  }

  // バリデーション
  const parsed = medicationCarePlanParamsSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      value: { code: "INVALID_INPUT", cause: parsed.error.flatten() },
    };
  }

  // 薬剤ケアプランデータ取得
  return getMedicationCarePlan(parsed.data.admissionId);
}
