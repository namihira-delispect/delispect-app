"use server";

import { authorizeServerAction } from "@/lib/auth";
import type { Result } from "@/shared/types";
import type { TranscriptionHistoryEntry } from "../types";
import { transcriptionHistoryParamsSchema } from "../schemata";
import { getTranscriptionHistory } from "../queries/getTranscriptionHistory";

/**
 * 転記履歴を取得するServer Action
 *
 * 認証済みユーザーのみ実行可能。
 * ケアプランIDに対応する転記履歴一覧を返す。
 */
export async function getTranscriptionHistoryAction(input: {
  carePlanId: number;
}): Promise<Result<TranscriptionHistoryEntry[]>> {
  // 認証チェック
  const authResult = await authorizeServerAction();
  if (!authResult.success) {
    return authResult;
  }

  // バリデーション
  const parsed = transcriptionHistoryParamsSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      value: { code: "INVALID_INPUT", cause: parsed.error.flatten() },
    };
  }

  // 転記履歴取得
  return getTranscriptionHistory(parsed.data.carePlanId);
}
