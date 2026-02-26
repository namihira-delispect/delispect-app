"use client";

import { useCallback, type CSSProperties } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/shared/components/Sidebar";
import { Header } from "@/shared/components/Header";
import type { UserRole } from "@/shared/types";

interface AppShellProps {
  children: React.ReactNode;
}

/** ログインページはサイドバー・ヘッダーを表示しない */
const AUTH_ROUTES = ["/login"];

const layoutStyle: CSSProperties = {
  display: "flex",
  minHeight: "100vh",
};

const mainAreaStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  flex: 1,
  minWidth: 0,
};

const contentStyle: CSSProperties = {
  flex: 1,
  padding: "1.5rem",
  backgroundColor: "#f8fafc",
  overflowY: "auto",
};

/**
 * アプリケーションシェル
 *
 * サイドバー + ヘッダー + メインコンテンツ領域のレイアウトを提供する。
 * ログイン画面などの認証ルートではサイドバー・ヘッダーを非表示にする。
 */
export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  // TODO: 実際の認証状態から取得する（現在はモック）
  const mockUsername = "テストユーザー";
  const mockRoles: UserRole[] = ["SUPER_ADMIN"];

  const handleLogout = useCallback(() => {
    // TODO: 実際のログアウト処理を実装
    window.location.href = "/login";
  }, []);

  if (isAuthRoute) {
    return <>{children}</>;
  }

  return (
    <div style={layoutStyle}>
      <Sidebar userRoles={mockRoles} currentPath={pathname} />
      <div style={mainAreaStyle}>
        <Header username={mockUsername} onLogout={handleLogout} />
        <main style={contentStyle}>{children}</main>
      </div>
    </div>
  );
}
