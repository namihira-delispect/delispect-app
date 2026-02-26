"use server";

import { authorizeServerAction } from "@/lib/auth";
import type { Result } from "@/shared/types";
import type { PainCarePlanResponse } from "../types";
import { getPainCarePlanParamsSchema } from "../schemata";
import { getPainCarePlan } from "../queries/getPainCarePlan";

/**
 * 疼痛ケアプラン情報を取得するServer Action
 *
 * 認証済みユーザーのみ実行可能。
 * 入院IDに対応する疼痛ケアプランアイテムと痛み止め処方情報を返す。
 */
export async function getPainCarePlanAction(input: {
  admissionId: number;
}): Promise<Result<PainCarePlanResponse | null>> {
  // 認証チェック
  const authResult = await authorizeServerAction();
  if (!authResult.success) {
    return authResult;
  }

  // バリデーション
  const parsed = getPainCarePlanParamsSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      value: { code: "INVALID_INPUT", cause: parsed.error.flatten() },
    };
  }

  // 疼痛ケアプラン取得
  return getPainCarePlan(parsed.data.admissionId);
}
