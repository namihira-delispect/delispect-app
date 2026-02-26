/**
 * インポートロック管理リポジトリ
 *
 * 電子カルテ同期の排他制御を管理する。
 * ImportLockモデルを使用して同時実行を防止する。
 */

import { prisma } from "@delispect/db";
import { IMPORT_LOCK_KEY, LOCK_EXPIRY_MS } from "../types";
import type { Result } from "@/shared/types";
import type { ImportLockInfo } from "../types";

/**
 * インポートロックを取得する
 *
 * 既にアクティブなロックが存在する場合はエラーを返す。
 * 有効期限切れのロックは自動的に非アクティブに更新する。
 */
export async function acquireImportLock(
  userId: number,
): Promise<Result<ImportLockInfo>> {
  try {
    // 期限切れロックを非アクティブに更新
    await prisma.importLock.updateMany({
      where: {
        lockKey: IMPORT_LOCK_KEY,
        isActive: true,
        expiresAt: { lt: new Date() },
      },
      data: { isActive: false },
    });

    // アクティブなロックが存在するかチェック
    const existingLock = await prisma.importLock.findFirst({
      where: {
        lockKey: IMPORT_LOCK_KEY,
        isActive: true,
      },
    });

    if (existingLock) {
      return {
        success: false,
        value: {
          code: "IMPORT_LOCKED",
          cause: "他のユーザーがインポート処理を実行中です。しばらくお待ちください。",
        },
      };
    }

    // 新しいロックを作成
    const expiresAt = new Date(Date.now() + LOCK_EXPIRY_MS);
    const lock = await prisma.importLock.create({
      data: {
        lockKey: IMPORT_LOCK_KEY,
        userId,
        isActive: true,
        expiresAt,
      },
    });

    return {
      success: true,
      value: {
        id: lock.id,
        lockKey: lock.lockKey,
        userId: lock.userId,
        isActive: lock.isActive,
        expiresAt: lock.expiresAt.toISOString(),
      },
    };
  } catch {
    return {
      success: false,
      value: { code: "LOCK_ERROR", cause: "ロックの取得に失敗しました" },
    };
  }
}

/**
 * インポートロックを解放する
 */
export async function releaseImportLock(lockId: number): Promise<Result<void>> {
  try {
    await prisma.importLock.update({
      where: { id: lockId },
      data: { isActive: false },
    });

    return { success: true, value: undefined };
  } catch {
    return {
      success: false,
      value: { code: "LOCK_RELEASE_ERROR", cause: "ロックの解放に失敗しました" },
    };
  }
}

/**
 * アクティブなインポートロックの存在を確認する
 */
export async function checkImportLock(): Promise<Result<ImportLockInfo | null>> {
  try {
    // 期限切れロックを非アクティブに更新
    await prisma.importLock.updateMany({
      where: {
        lockKey: IMPORT_LOCK_KEY,
        isActive: true,
        expiresAt: { lt: new Date() },
      },
      data: { isActive: false },
    });

    const lock = await prisma.importLock.findFirst({
      where: {
        lockKey: IMPORT_LOCK_KEY,
        isActive: true,
      },
    });

    if (!lock) {
      return { success: true, value: null };
    }

    return {
      success: true,
      value: {
        id: lock.id,
        lockKey: lock.lockKey,
        userId: lock.userId,
        isActive: lock.isActive,
        expiresAt: lock.expiresAt.toISOString(),
      },
    };
  } catch {
    return {
      success: false,
      value: { code: "LOCK_CHECK_ERROR", cause: "ロック状態の確認に失敗しました" },
    };
  }
}
