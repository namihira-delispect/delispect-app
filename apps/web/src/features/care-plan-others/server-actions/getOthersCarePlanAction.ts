"use server";

import { authorizeServerAction } from "@/lib/auth";
import type { Result } from "@/shared/types";
import type { GetOthersCarePlanResponse, OthersCategoryType } from "../types";
import { getOthersCarePlanParamsSchema, getOthersByCategoryParamsSchema } from "../schemata";
import {
  getOthersCarePlanByItemId,
  getOthersCarePlanByCategory,
} from "../queries/getOthersCarePlan";

/**
 * その他カテゴリのケアプランをアイテムIDで取得するServer Action
 *
 * 認証済みユーザーのみ実行可能。
 */
export async function getOthersCarePlanByItemIdAction(input: {
  itemId: number;
}): Promise<Result<GetOthersCarePlanResponse>> {
  // 認証チェック
  const authResult = await authorizeServerAction();
  if (!authResult.success) {
    return authResult;
  }

  // バリデーション
  const parsed = getOthersCarePlanParamsSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      value: { code: "INVALID_INPUT", cause: parsed.error.flatten() },
    };
  }

  return getOthersCarePlanByItemId(parsed.data.itemId);
}

/**
 * その他カテゴリのケアプランを入院ID+カテゴリーで取得するServer Action
 *
 * 認証済みユーザーのみ実行可能。
 */
export async function getOthersCarePlanByCategoryAction(input: {
  admissionId: number;
  category: string;
}): Promise<Result<GetOthersCarePlanResponse>> {
  // 認証チェック
  const authResult = await authorizeServerAction();
  if (!authResult.success) {
    return authResult;
  }

  // バリデーション
  const parsed = getOthersByCategoryParamsSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      value: { code: "INVALID_INPUT", cause: parsed.error.flatten() },
    };
  }

  return getOthersCarePlanByCategory(
    parsed.data.admissionId,
    parsed.data.category as OthersCategoryType,
  );
}
