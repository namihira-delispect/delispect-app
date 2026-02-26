"use server";

/**
 * インポートロックの状態を取得するクエリ
 */

import { authorizeServerAction } from "@/lib/auth";
import { checkImportLock } from "../repositories/importLock";
import type { Result } from "@/shared/types";
import type { ImportLockInfo } from "../types";

/**
 * 現在のインポートロック状態を取得する
 */
export async function getImportLockStatus(): Promise<Result<ImportLockInfo | null>> {
  const authResult = await authorizeServerAction(["SYSTEM_ADMIN", "SUPER_ADMIN"]);
  if (!authResult.success) {
    return authResult;
  }

  return checkImportLock();
}
