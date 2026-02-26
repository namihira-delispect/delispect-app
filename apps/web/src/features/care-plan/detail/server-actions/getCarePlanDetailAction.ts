"use server";

import { authorizeServerAction } from "@/lib/auth";
import type { Result } from "@/shared/types";
import type { CarePlanDetailResponse } from "../types";
import { carePlanDetailParamsSchema } from "../schemata";
import { getCarePlanDetail } from "../queries/getCarePlanDetail";

/**
 * ケアプラン詳細情報を取得するServer Action
 *
 * 認証済みユーザーのみ実行可能。
 * 入院IDに対応するケアプラン詳細情報を返す。
 */
export async function getCarePlanDetailAction(input: {
  admissionId: number;
}): Promise<Result<CarePlanDetailResponse | null>> {
  // 認証チェック
  const authResult = await authorizeServerAction();
  if (!authResult.success) {
    return authResult;
  }

  // バリデーション
  const parsed = carePlanDetailParamsSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      value: { code: "INVALID_INPUT", cause: parsed.error.flatten() },
    };
  }

  // ケアプラン詳細取得
  return getCarePlanDetail(parsed.data.admissionId);
}
