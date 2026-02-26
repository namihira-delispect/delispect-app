"use server";

import { redirect } from "next/navigation";
import { authenticate, loginSchema } from "@delispect/auth";
import { setSessionCookie } from "@/lib/auth/cookies";
import type { LoginFormState } from "../types";

export async function loginAction(
  _prevState: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const rawInput = {
    username: formData.get("username") as string,
    password: formData.get("password") as string,
  };

  // バリデーション
  const parsed = loginSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  // 認証
  const result = await authenticate(parsed.data);

  if (!result.success) {
    const errorMessages: Record<string, string> = {
      INVALID_CREDENTIALS: "ユーザーIDまたはパスワードが正しくありません",
      ACCOUNT_LOCKED: result.value.cause ?? "アカウントがロックされています",
      ACCOUNT_DISABLED: "アカウントが無効化されています",
      INTERNAL_ERROR: "システムエラーが発生しました。しばらく経ってから再度お試しください",
    };

    return {
      error: errorMessages[result.value.code] ?? "認証エラーが発生しました",
    };
  }

  // セッションCookie設定
  await setSessionCookie(result.value.sessionId);

  // ダッシュボードへリダイレクト
  redirect("/");
}
