import { cookies } from "next/headers";
import { SESSION_TIMEOUT_MINUTES } from "@delispect/auth";

const SESSION_COOKIE_NAME = "delispect_session";

/**
 * セッションCookieを設定する
 */
export async function setSessionCookie(sessionId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_TIMEOUT_MINUTES * 60,
    path: "/",
  });
}

/**
 * セッションCookieを取得する
 */
export async function getSessionCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value;
}

/**
 * セッションCookieを削除する
 */
export async function deleteSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
