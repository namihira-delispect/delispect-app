"use server";

import { authorizeServerAction } from "@/lib/auth";
import type { Result } from "@/shared/types";
import type { CarePlanListResponse } from "../types";
import { carePlanParamsSchema } from "../schemata";
import { getCarePlan } from "../queries/getCarePlan";

/**
 * ケアプラン一覧情報を取得するServer Action
 *
 * 認証済みユーザーのみ実行可能。
 * 入院IDに対応するケアプランとアイテム一覧を返す。
 */
export async function getCarePlanAction(input: {
  admissionId: number;
}): Promise<Result<CarePlanListResponse | null>> {
  // 認証チェック
  const authResult = await authorizeServerAction();
  if (!authResult.success) {
    return authResult;
  }

  // バリデーション
  const parsed = carePlanParamsSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      value: { code: "INVALID_INPUT", cause: parsed.error.flatten() },
    };
  }

  // ケアプラン取得
  return getCarePlan(parsed.data.admissionId);
}
