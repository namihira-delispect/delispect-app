"use server";

import { authorizeServerAction } from "@/lib/auth";
import type { Result } from "@/shared/types";
import { optimisticLockSchema } from "../schemata";
import { checkAdmissionVersion } from "../queries/getAdmissionDetail";

/**
 * 楽観的ロック：バージョンチェックを実行するServer Action
 *
 * 更新前にバージョンが一致するか確認する。
 * 競合が検出された場合はエラーを返し、最新データの再取得を促す。
 */
export async function checkVersionAction(input: {
  admissionId: number;
  expectedVersion: number;
}): Promise<Result<{ currentVersion: number }>> {
  // 認証チェック
  const authResult = await authorizeServerAction();
  if (!authResult.success) {
    return authResult;
  }

  // バリデーション
  const parsed = optimisticLockSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      value: { code: "INVALID_INPUT", cause: parsed.error.flatten() },
    };
  }

  return checkAdmissionVersion(parsed.data.admissionId, parsed.data.expectedVersion);
}
