import { validateSession } from "@delispect/auth";
import type { SessionData } from "@delispect/auth";
import { getSessionCookie } from "./cookies";

/**
 * サーバーサイドでセッション情報を取得する
 * セッションが無効な場合は null を返す
 */
export async function getServerSession(): Promise<SessionData | null> {
  const sessionId = await getSessionCookie();
  if (!sessionId) {
    return null;
  }

  return validateSession(sessionId);
}
