import type { CSSProperties } from "react";
import Link from "next/link";

const containerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "50vh",
  padding: "2rem",
  textAlign: "center",
};

const codeStyle: CSSProperties = {
  fontSize: "4rem",
  fontWeight: "bold",
  color: "#ef4444",
  marginBottom: "0.5rem",
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

const linkStyle: CSSProperties = {
  display: "inline-block",
  padding: "0.75rem 1.5rem",
  backgroundColor: "#3b82f6",
  color: "#ffffff",
  borderRadius: "0.375rem",
  fontSize: "0.875rem",
  fontWeight: "bold",
  textDecoration: "none",
};

/**
 * 403 Forbidden ページ
 *
 * アクセス権限が不足している場合に表示する。
 */
export default function ForbiddenPage() {
  return (
    <div style={containerStyle}>
      <div style={codeStyle}>403</div>
      <h2 style={titleStyle}>アクセス権限がありません</h2>
      <p style={messageStyle}>
        このページにアクセスする権限がありません。
        必要な権限を持つ管理者にお問い合わせください。
      </p>
      <Link href="/" style={linkStyle}>
        トップページへ戻る
      </Link>
    </div>
  );
}
