import { prisma } from "@delispect/db";
import { verifyPassword } from "./password";
import { createSession } from "./session";
import { MAX_FAILED_ATTEMPTS, LOCK_DURATION_HOURS } from "./constants";
import type { AuthResult, LoginInput } from "./types";

/**
 * アカウントがロックされているか確認する
 */
export async function checkAccountLock(
  userId: number,
): Promise<{ isLocked: boolean; lockedUntil: Date | null }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { lockedUntil: true, failedLoginAttempts: true },
  });

  if (!user) {
    return { isLocked: false, lockedUntil: null };
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    return { isLocked: true, lockedUntil: user.lockedUntil };
  }

  // ロック期限が過ぎていたら自動解除
  if (user.lockedUntil && user.lockedUntil <= new Date()) {
    await prisma.user.update({
      where: { id: userId },
      data: { lockedUntil: null, failedLoginAttempts: 0 },
    });
  }

  return { isLocked: false, lockedUntil: null };
}

/**
 * ログイン失敗回数をインクリメントする
 * MAX_FAILED_ATTEMPTS に達したらアカウントをロックする
 */
export async function incrementFailedAttempts(userId: number): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { failedLoginAttempts: true },
  });

  if (!user) return;

  const newCount = user.failedLoginAttempts + 1;
  const updateData: { failedLoginAttempts: number; lockedUntil?: Date } = {
    failedLoginAttempts: newCount,
  };

  if (newCount >= MAX_FAILED_ATTEMPTS) {
    const lockedUntil = new Date();
    lockedUntil.setHours(lockedUntil.getHours() + LOCK_DURATION_HOURS);
    updateData.lockedUntil = lockedUntil;
  }

  await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });
}

/**
 * ログイン失敗回数をリセットする
 */
export async function resetFailedAttempts(userId: number): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { failedLoginAttempts: 0, lockedUntil: null },
  });
}

/**
 * アカウントのロックを解除する（管理者用）
 */
export async function unlockAccount(userId: number): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { failedLoginAttempts: 0, lockedUntil: null },
  });
}

/**
 * ユーザー認証を行う
 */
export async function authenticate(
  input: LoginInput,
  ipAddress?: string,
): Promise<AuthResult> {
  try {
    const user = await prisma.user.findUnique({
      where: { username: input.username },
    });

    if (!user) {
      return {
        success: false,
        value: { code: "INVALID_CREDENTIALS", cause: "ユーザーが見つかりません" },
      };
    }

    // アカウント無効チェック
    if (!user.isActive) {
      return {
        success: false,
        value: {
          code: "ACCOUNT_DISABLED",
          cause: "アカウントが無効化されています",
        },
      };
    }

    // ロック状態チェック
    const lockStatus = await checkAccountLock(user.id);
    if (lockStatus.isLocked) {
      return {
        success: false,
        value: {
          code: "ACCOUNT_LOCKED",
          cause: `アカウントがロックされています。${lockStatus.lockedUntil?.toLocaleString("ja-JP")}以降に再試行してください`,
        },
      };
    }

    // パスワード検証
    const isValid = await verifyPassword(input.password, user.passwordHash);
    if (!isValid) {
      await incrementFailedAttempts(user.id);
      return {
        success: false,
        value: {
          code: "INVALID_CREDENTIALS",
          cause: "ユーザーIDまたはパスワードが正しくありません",
        },
      };
    }

    // ログイン成功：失敗回数リセット＆セッション作成
    await resetFailedAttempts(user.id);
    const session = await createSession(user.id, user.username, ipAddress);

    return { success: true, value: session };
  } catch (error) {
    return {
      success: false,
      value: {
        code: "INTERNAL_ERROR",
        cause:
          error instanceof Error ? error.message : "内部エラーが発生しました",
      },
    };
  }
}
