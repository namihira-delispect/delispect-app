"use client";

import type { CSSProperties } from "react";

export interface HeaderProps {
  /** ログインユーザー名 */
  username: string;
  /** ログアウト処理のコールバック */
  onLogout: () => void;
}

const headerStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  height: "3.5rem",
  padding: "0 1.5rem",
  backgroundColor: "#ffffff",
  borderBottom: "1px solid #e2e8f0",
  gap: "1rem",
};

const userInfoStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  fontSize: "0.875rem",
  color: "#475569",
};

const usernameStyle: CSSProperties = {
  fontWeight: 500,
  color: "#1e293b",
};

const logoutButtonStyle: CSSProperties = {
  padding: "0.375rem 0.75rem",
  backgroundColor: "#f1f5f9",
  color: "#475569",
  border: "1px solid #cbd5e1",
  borderRadius: "0.375rem",
  fontSize: "0.8125rem",
  cursor: "pointer",
};

/**
 * ヘッダーコンポーネント
 *
 * ログインユーザー名とログアウトボタンを表示する。
 */
export function Header({ username, onLogout }: HeaderProps) {
  return (
    <header style={headerStyle} role="banner">
      <div style={userInfoStyle}>
        <span>ログイン:</span>
        <span style={usernameStyle} data-testid="header-username">
          {username}
        </span>
      </div>
      <button
        type="button"
        style={logoutButtonStyle}
        onClick={onLogout}
        aria-label="ログアウト"
      >
        ログアウト
      </button>
    </header>
  );
}
