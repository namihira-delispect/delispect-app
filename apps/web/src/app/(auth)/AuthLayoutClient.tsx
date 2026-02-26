"use client";

import { AppShell } from "@/components/layout/AppShell";
import { logoutAction } from "./login/actions";
import type { AuthUser } from "@/shared/types";

type AuthLayoutClientProps = {
  user: AuthUser;
  children: React.ReactNode;
};

/**
 * 認証済みレイアウトのクライアントコンポーネント
 *
 * AppShellにユーザー情報とログアウトアクションを渡す。
 */
export function AuthLayoutClient({ user, children }: AuthLayoutClientProps) {
  return (
    <AppShell user={user} onLogout={logoutAction}>
      {children}
    </AppShell>
  );
}
