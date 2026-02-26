import { randomBytes } from "crypto";
import { prisma } from "@delispect/db";
import { SESSION_TIMEOUT_MINUTES, SESSION_ID_LENGTH } from "./constants";
import type { SessionData } from "./types";

/**
 * セッションIDを生成する
 */
function generateSessionId(): string {
  return randomBytes(SESSION_ID_LENGTH).toString("hex");
}

/**
 * セッションの有効期限を計算する
 */
function calculateExpiresAt(): Date {
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + SESSION_TIMEOUT_MINUTES);
  return expiresAt;
}

/**
 * 新規セッションを作成する
 * 既存セッションを無効化してから作成する
 */
export async function createSession(
  userId: number,
  username: string,
  ipAddress?: string,
): Promise<SessionData> {
  // 既存セッションを無効化
  await invalidateUserSessions(userId);

  const sessionId = generateSessionId();
  const expiresAt = calculateExpiresAt();

  await prisma.session.create({
    data: {
      id: sessionId,
      userId,
      expiresAt,
      ipAddress: ipAddress ?? null,
    },
  });

  return { sessionId, userId, username, expiresAt };
}

/**
 * セッションを検証する
 * 有効期限内であればセッション情報を返す
 */
export async function validateSession(
  sessionId: string,
): Promise<SessionData | null> {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true },
  });

  if (!session) {
    return null;
  }

  // 有効期限切れチェック
  if (session.expiresAt < new Date()) {
    await invalidateSession(sessionId);
    return null;
  }

  // セッションの有効期限を延長（アクティビティに基づく）
  const newExpiresAt = calculateExpiresAt();
  await prisma.session.update({
    where: { id: sessionId },
    data: { expiresAt: newExpiresAt },
  });

  return {
    sessionId: session.id,
    userId: session.userId,
    username: session.user.username,
    expiresAt: newExpiresAt,
  };
}

/**
 * 特定のセッションを無効化する
 */
export async function invalidateSession(sessionId: string): Promise<void> {
  await prisma.session.delete({
    where: { id: sessionId },
  }).catch(() => {
    // セッションが既に削除されている場合は無視
  });
}

/**
 * ユーザーの全セッションを無効化する
 */
export async function invalidateUserSessions(userId: number): Promise<void> {
  await prisma.session.deleteMany({
    where: { userId },
  });
}

/**
 * セッションIDを再生成する
 * セッションの内容を保持したまま新しいIDを発行する
 */
export async function regenerateSessionId(
  oldSessionId: string,
): Promise<string | null> {
  const session = await prisma.session.findUnique({
    where: { id: oldSessionId },
  });

  if (!session) {
    return null;
  }

  const newSessionId = generateSessionId();
  const newExpiresAt = calculateExpiresAt();

  await prisma.$transaction([
    prisma.session.delete({ where: { id: oldSessionId } }),
    prisma.session.create({
      data: {
        id: newSessionId,
        userId: session.userId,
        expiresAt: newExpiresAt,
        ipAddress: session.ipAddress,
      },
    }),
  ]);

  return newSessionId;
}
