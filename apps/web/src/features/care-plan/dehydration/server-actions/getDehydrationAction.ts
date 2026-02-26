"use server";

import { authorizeServerAction } from "@/lib/auth";
import type { Result } from "@/shared/types";
import type { DehydrationResponse } from "../types";
import { getDehydrationParamsSchema } from "../schemata";
import { getDehydrationData } from "../queries/getDehydrationData";

/**
 * 脱水アセスメントデータを取得するServer Action
 *
 * 認証済みユーザーのみ実行可能。
 * ケアプランアイテムIDに対応する脱水アセスメントデータを返す。
 */
export async function getDehydrationAction(input: {
  itemId: number;
}): Promise<Result<DehydrationResponse>> {
  // 認証チェック
  const authResult = await authorizeServerAction();
  if (!authResult.success) {
    return authResult;
  }

  // バリデーション
  const parsed = getDehydrationParamsSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      value: { code: "INVALID_INPUT", cause: parsed.error.flatten() },
    };
  }

  return getDehydrationData(parsed.data.itemId);
}
