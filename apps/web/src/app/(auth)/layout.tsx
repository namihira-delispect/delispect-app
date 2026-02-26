import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/authService";
import { AuthLayoutClient } from "./AuthLayoutClient";

const SESSION_COOKIE_NAME = "delispect_session";

/**
 * 認証済みページの共通レイアウト（Server Component）
 *
 * セッションからユーザー情報を取得し、
 * AppShellにユーザー情報を渡す。
 */
export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionId) {
    redirect("/login");
  }

  const user = await getSessionUser(sessionId);

  if (!user) {
    redirect("/login");
  }

  return <AuthLayoutClient user={user}>{children}</AuthLayoutClient>;
}
