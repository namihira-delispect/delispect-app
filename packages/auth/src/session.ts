import crypto from "crypto";

/** セッションタイムアウト（分） */
export const SESSION_TIMEOUT_MINUTES = 30;

/** セッション作成用パラメータ */
export interface CreateSessionParams {
  userId: number;
  ipAddress?: string;
  userAgent?: string;
}

/** セッションデータ */
export interface SessionData {
  id: string;
  userId: number;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * 暗号的に安全なセッションIDを生成する
 */
export function generateSessionId(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * セッションデータを作成する
 */
export function createSessionData(params: CreateSessionParams): SessionData {
  const expiresAt = new Date(
    Date.now() + SESSION_TIMEOUT_MINUTES * 60 * 1000
  );

  return {
    id: generateSessionId(),
    userId: params.userId,
    expiresAt,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
  };
}

/**
 * セッションが期限切れかどうかを確認する
 */
export function isSessionExpired(expiresAt: Date): boolean {
  return expiresAt.getTime() <= Date.now();
}

/**
 * セッションの有効期限を延長する
 */
export function extendSessionExpiry(): Date {
  return new Date(Date.now() + SESSION_TIMEOUT_MINUTES * 60 * 1000);
}
