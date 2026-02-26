import type { CSSProperties } from "react";

export interface ErrorMessageProps {
  /** エラーメッセージ */
  message: string;
  /** 再試行コールバック */
  onRetry?: () => void;
}

const containerStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  padding: "0.75rem 1rem",
  backgroundColor: "#fef2f2",
  border: "1px solid #fecaca",
  borderRadius: "0.375rem",
  color: "#991b1b",
  fontSize: "0.875rem",
};

const buttonStyle: CSSProperties = {
  padding: "0.25rem 0.75rem",
  backgroundColor: "#dc2626",
  color: "#ffffff",
  border: "none",
  borderRadius: "0.25rem",
  fontSize: "0.75rem",
  cursor: "pointer",
  whiteSpace: "nowrap",
};

/**
 * エラーメッセージ表示コンポーネント
 *
 * @param message - エラーメッセージ
 * @param onRetry - 再試行ボタンクリック時のコールバック
 */
export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div style={containerStyle} role="alert">
      <span>{message}</span>
      {onRetry && (
        <button type="button" style={buttonStyle} onClick={onRetry}>
          再試行
        </button>
      )}
    </div>
  );
}
