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
  color: "#94a3b8",
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
 * 404 Not Found ページ
 *
 * 指定されたURLに対応するページが見つからない場合に表示する。
 */
export default function NotFound() {
  return (
    <div style={containerStyle}>
      <div style={codeStyle}>404</div>
      <h2 style={titleStyle}>ページが見つかりません</h2>
      <p style={messageStyle}>
        お探しのページは存在しないか、移動された可能性があります。
        URLを確認するか、トップページからお探しください。
      </p>
      <Link href="/" style={linkStyle}>
        トップページへ戻る
      </Link>
    </div>
  );
}
