"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { filterNavItemsByRole } from "@/shared/navigation";
import { NAV_ITEMS } from "@/shared/constants";
import type { AuthUser } from "@/shared/types";

type AppShellProps = {
  user: AuthUser;
  onLogout: () => void;
  children: React.ReactNode;
};

/**
 * アプリケーションシェル
 *
 * ヘッダー・サイドナビゲーション・メインコンテンツ領域を含む
 * 認証済みページの共通レイアウト。
 *
 * PC 1920x1080 以上推奨、タブレット横向き 1024x768 以上対応。
 */
export function AppShell({ user, onLogout, children }: AppShellProps) {
  const pathname = usePathname();
  const filteredNavItems = filterNavItemsByRole(NAV_ITEMS, user.roles);

  return (
    <div style={styles.shell} data-testid="app-shell">
      <Header user={user} onLogout={onLogout} />
      <div style={styles.body}>
        <Sidebar items={filteredNavItems} currentPath={pathname} />
        <main style={styles.main}>{children}</main>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  shell: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    minWidth: "1024px",
  },
  body: {
    display: "flex",
    flex: 1,
    overflow: "hidden",
  },
  main: {
    flex: 1,
    overflow: "auto",
    padding: "1.5rem",
    backgroundColor: "#ffffff",
  },
};
