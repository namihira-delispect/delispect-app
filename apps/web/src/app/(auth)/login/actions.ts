"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { loginSchema } from "@delispect/auth";
import { authenticateUser, invalidateSession } from "@/lib/authService";

/** ログインアクションの結果 */
export type LoginActionResult = {
  error?: string;
};

const SESSION_COOKIE_NAME = "delispect_session";

/**
 * ログインServer Action
 */
export async function loginAction(
  _prevState: LoginActionResult | undefined,
  formData: FormData
): Promise<LoginActionResult> {
  // バリデーション
  const rawData = {
    username: formData.get("username"),
    password: formData.get("password"),
  };

  const parsed = loginSchema.safeParse(rawData);
  if (!parsed.success) {
    const firstError = parsed.error.errors[0];
    return { error: firstError?.message ?? "入力内容に誤りがあります" };
  }

  // ヘッダーからIPアドレスとUser-Agentを取得
  const headerStore = await headers();
  const ipAddress =
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headerStore.get("x-real-ip") ??
    undefined;
  const userAgent = headerStore.get("user-agent") ?? undefined;

  // 認証処理
  const result = await authenticateUser({
    username: parsed.data.username,
    password: parsed.data.password,
    ipAddress,
    userAgent,
  });

  if (!result.success) {
    return { error: result.error };
  }

  // セッションCookieの設定
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, result.sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 60, // 30分
  });

  redirect("/");
}

/**
 * ログアウトServer Action
 */
export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (sessionId) {
    await invalidateSession(sessionId);
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
  redirect("/login");
}
