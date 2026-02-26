"use client";

import type { CSSProperties } from "react";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

const containerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "50vh",
  padding: "2rem",
  textAlign: "center",
};

const iconStyle: CSSProperties = {
  fontSize: "3rem",
  marginBottom: "1rem",
  color: "#dc2626",
};

const titleStyle: CSSProperties = {
  fontSize: "1.5rem",
  fontWeight: "bold",
  color: "#1e293b",
  marginBottom: "0.5rem",
};

const messageStyle: CSSProperties = {
  fontSize: "1rem",
  color: "#64748b",
  marginBottom: "1.5rem",
  maxWidth: "480px",
  lineHeight: 1.6,
};

const buttonStyle: CSSProperties = {
  padding: "0.75rem 1.5rem",
  backgroundColor: "#3b82f6",
  color: "#ffffff",
  border: "none",
  borderRadius: "0.375rem",
  fontSize: "0.875rem",
  fontWeight: "bold",
  cursor: "pointer",
};

const digestStyle: CSSProperties = {
  marginTop: "1.5rem",
  padding: "1rem",
  backgroundColor: "#f1f5f9",
  borderRadius: "0.375rem",
  fontSize: "0.75rem",
  color: "#64748b",
  maxWidth: "600px",
  wordBreak: "break-all",
  textAlign: "left",
  whiteSpace: "pre-wrap",
};

/**
 * ランタイムエラー用Error Boundary
 *
 * Next.js App Routerの規約に従い、ランタイムエラーをキャッチして
 * ユーザーフレンドリーなエラー画面を表示する。
 * 本番環境ではスタックトレースを非表示にする。
 */
export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const isProduction = process.env.NODE_ENV === "production";

  return (
    <div style={containerStyle} role="alert">
      <div style={iconStyle} aria-hidden="true">
        !
      </div>
      <h2 style={titleStyle}>エラーが発生しました</h2>
      <p style={messageStyle}>
        システムエラーが発生しました。しばらく時間をおいて再度お試しください。
        問題が解決しない場合は管理者にお問い合わせください。
      </p>
      <button type="button" style={buttonStyle} onClick={reset}>
        再試行
      </button>
      {!isProduction && error.message && (
        <div style={digestStyle}>
          <strong>エラー詳細（開発環境のみ表示）:</strong>
          <br />
          {error.message}
          {error.stack && (
            <>
              <br />
              <br />
              {error.stack}
            </>
          )}
        </div>
      )}
    </div>
  );
}
