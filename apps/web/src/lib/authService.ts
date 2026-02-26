import { prisma } from "@delispect/db";
import {
  verifyPassword,
  checkLoginLock,
  incrementFailedAttempts,
  resetFailedAttempts,
  createSessionData,
  isSessionExpired,
  extendSessionExpiry,
} from "@delispect/auth";

/** ログイン結果の型 */
export type LoginResult =
  | { success: true; sessionId: string; userId: number }
  | { success: false; error: string };

/**
 * ユーザー認証を行い、セッションを作成する
 *
 * - ユーザーの存在確認
 * - ロック状態の確認
 * - パスワード検証
 * - 失敗回数の管理
 * - 既存セッションの無効化
 * - 新規セッションの作成
 */
export async function authenticateUser(params: {
  username: string;
  password: string;
  ipAddress?: string;
  userAgent?: string;
}): Promise<LoginResult> {
  const { username, password, ipAddress, userAgent } = params;

  // ユーザーの取得
  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) {
    // セキュリティ: ユーザーが存在しないことを明かさない
    return { success: false, error: "ユーザーIDまたはパスワードが正しくありません" };
  }

  // アクティブチェック
  if (!user.isActive) {
    return { success: false, error: "アカウントが無効化されています" };
  }

  // ロック状態の確認
  const lockResult = checkLoginLock({
    failedLoginAttempts: user.failedLoginAttempts,
    lockedUntil: user.lockedUntil,
  });

  if (lockResult.isLocked) {
    return {
      success: false,
      error: "アカウントがロックされています。しばらく経ってから再試行してください",
    };
  }

  // パスワード検証
  const isPasswordValid = await verifyPassword(password, user.passwordHash);

  if (!isPasswordValid) {
    // 失敗回数の更新
    const failedResult = incrementFailedAttempts(user.failedLoginAttempts);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: failedResult.failedLoginAttempts,
        lockedUntil: failedResult.lockedUntil,
      },
    });

    return { success: false, error: "ユーザーIDまたはパスワードが正しくありません" };
  }

  // ログイン成功: 既存セッションを無効化
  await prisma.session.deleteMany({
    where: { userId: user.id },
  });

  // 失敗回数のリセット
  const resetResult = resetFailedAttempts();
  await prisma.user.update({
    where: { id: user.id },
    data: {
      failedLoginAttempts: resetResult.failedLoginAttempts,
      lockedUntil: resetResult.lockedUntil,
    },
  });

  // 新規セッションの作成
  const sessionData = createSessionData({
    userId: user.id,
    ipAddress,
    userAgent,
  });

  await prisma.session.create({
    data: {
      id: sessionData.id,
      userId: sessionData.userId,
      expiresAt: sessionData.expiresAt,
      ipAddress: sessionData.ipAddress ?? null,
      userAgent: sessionData.userAgent ?? null,
    },
  });

  return {
    success: true,
    sessionId: sessionData.id,
    userId: user.id,
  };
}

/**
 * セッションIDからユーザー情報を取得する
 */
export async function getSessionUser(sessionId: string) {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      user: {
        include: {
          userRoles: {
            include: {
              role: true,
            },
          },
        },
      },
    },
  });

  if (!session) {
    return null;
  }

  // セッション有効期限チェック
  if (isSessionExpired(session.expiresAt)) {
    // 期限切れセッションを削除
    await prisma.session.delete({
      where: { id: sessionId },
    });
    return null;
  }

  // セッション有効期限を延長
  const newExpiresAt = extendSessionExpiry();
  await prisma.session.update({
    where: { id: sessionId },
    data: { expiresAt: newExpiresAt },
  });

  return {
    id: session.user.id,
    username: session.user.username,
    email: session.user.email,
    firstName: session.user.firstName,
    lastName: session.user.lastName,
    roles: session.user.userRoles.map((ur) => ur.role.name),
  };
}

/**
 * セッションを無効化する（ログアウト）
 */
export async function invalidateSession(sessionId: string): Promise<void> {
  await prisma.session.delete({
    where: { id: sessionId },
  }).catch(() => {
    // セッションが存在しない場合は無視
  });
}

/**
 * 管理者によるパスワードリセット（ロック解除）
 */
export async function adminResetPassword(params: {
  targetUserId: number;
  newPasswordHash: string;
}): Promise<void> {
  await prisma.user.update({
    where: { id: params.targetUserId },
    data: {
      passwordHash: params.newPasswordHash,
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
  });

  // 既存セッションを無効化
  await prisma.session.deleteMany({
    where: { userId: params.targetUserId },
  });
}
