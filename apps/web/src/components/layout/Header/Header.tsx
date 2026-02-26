"use client";

import type { AuthUser } from "@/shared/types";

type HeaderProps = {
  user: AuthUser;
  onLogout: () => void;
};

/**
 * アプリケーションヘッダー
 *
 * - ユーザー名の表示
 * - ログアウトボタン
 */
export function Header({ user, onLogout }: HeaderProps) {
  const displayName = `${user.lastName} ${user.firstName}`;

  return (
    <header style={styles.header}>
      <div style={styles.titleSection}>
        <h1 style={styles.title}>DELISPECT</h1>
        <span style={styles.subtitle}>せん妄リスク評価システム</span>
      </div>
      <div style={styles.userSection}>
        <span style={styles.userName} data-testid="header-user-name">
          {displayName}
        </span>
        <form action={onLogout}>
          <button
            type="submit"
            style={styles.logoutButton}
            data-testid="header-logout-button"
          >
            ログアウト
          </button>
        </form>
      </div>
    </header>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 1.5rem",
    height: "56px",
    backgroundColor: "#1a1a2e",
    color: "#ffffff",
    borderBottom: "1px solid #2d2d44",
    flexShrink: 0,
  },
  titleSection: {
    display: "flex",
    alignItems: "baseline",
    gap: "0.75rem",
  },
  title: {
    fontSize: "1.25rem",
    fontWeight: "bold",
    margin: 0,
    letterSpacing: "0.05em",
  },
  subtitle: {
    fontSize: "0.75rem",
    color: "#a0a0b8",
    margin: 0,
  },
  userSection: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  userName: {
    fontSize: "0.875rem",
    color: "#e0e0e8",
  },
  logoutButton: {
    backgroundColor: "transparent",
    color: "#a0a0b8",
    border: "1px solid #4a4a5e",
    borderRadius: "4px",
    padding: "0.375rem 0.75rem",
    fontSize: "0.8125rem",
    cursor: "pointer",
    transition: "all 0.2s",
  },
};
