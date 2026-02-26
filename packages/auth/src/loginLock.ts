/** ログインロックの最大失敗回数 */
export const MAX_FAILED_ATTEMPTS = 5;

/** ロック期間（時間） */
export const LOCK_DURATION_HOURS = 24;

/** ロックチェック用のユーザー情報 */
export interface LoginLockInfo {
  failedLoginAttempts: number;
  lockedUntil: Date | null;
}

/** ロックチェック結果 */
export interface LoginLockResult {
  isLocked: boolean;
  lockedUntil?: Date;
}

/** 失敗回数更新結果 */
export interface FailedAttemptResult {
  failedLoginAttempts: number;
  lockedUntil: Date | null;
}

/**
 * ユーザーがログインロック状態かどうかを確認する
 */
export function checkLoginLock(user: LoginLockInfo): LoginLockResult {
  if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
    return {
      isLocked: true,
      lockedUntil: user.lockedUntil,
    };
  }

  return { isLocked: false };
}

/**
 * ログイン失敗回数をインクリメントし、必要に応じてロックする
 */
export function incrementFailedAttempts(
  currentAttempts: number
): FailedAttemptResult {
  const newAttempts = currentAttempts + 1;

  if (newAttempts >= MAX_FAILED_ATTEMPTS) {
    const lockedUntil = new Date(
      Date.now() + LOCK_DURATION_HOURS * 60 * 60 * 1000
    );
    return {
      failedLoginAttempts: newAttempts,
      lockedUntil,
    };
  }

  return {
    failedLoginAttempts: newAttempts,
    lockedUntil: null,
  };
}

/**
 * ログイン失敗回数をリセットする
 */
export function resetFailedAttempts(): FailedAttemptResult {
  return {
    failedLoginAttempts: 0,
    lockedUntil: null,
  };
}
