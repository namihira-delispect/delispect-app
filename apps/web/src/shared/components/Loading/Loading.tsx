import type { CSSProperties } from "react";

export interface LoadingProps {
  /** 表示メッセージ */
  message?: string;
  /** サイズ（デフォルト: "medium"） */
  size?: "small" | "medium" | "large";
}

const sizeMap: Record<string, { spinner: number; fontSize: string }> = {
  small: { spinner: 16, fontSize: "0.75rem" },
  medium: { spinner: 32, fontSize: "0.875rem" },
  large: { spinner: 48, fontSize: "1rem" },
};

const containerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.5rem",
  padding: "1rem",
};

const spinnerStyle = (spinnerSize: number): CSSProperties => ({
  width: spinnerSize,
  height: spinnerSize,
  border: "3px solid #e2e8f0",
  borderTop: "3px solid #3b82f6",
  borderRadius: "50%",
  animation: "spin 0.8s linear infinite",
});

/**
 * ローディング表示コンポーネント
 *
 * @param message - 表示メッセージ（省略時: "読み込み中..."）
 * @param size - スピナーサイズ
 */
export function Loading({
  message = "読み込み中...",
  size = "medium",
}: LoadingProps) {
  const { spinner, fontSize } = sizeMap[size];

  return (
    <div style={containerStyle} role="status" aria-label={message}>
      <div style={spinnerStyle(spinner)} aria-hidden="true" />
      <span style={{ fontSize, color: "#64748b" }}>{message}</span>
    </div>
  );
}
