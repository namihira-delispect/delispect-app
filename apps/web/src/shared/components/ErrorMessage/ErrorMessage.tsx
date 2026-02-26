import type { CSSProperties } from "react";

/** エラーメッセージの種別 */
export type ErrorVariant = "error" | "warning" | "guidance";

export interface ErrorMessageProps {
  /** エラーメッセージ */
  message: string;
  /** ユーザーへのガイダンス（操作方法の案内等） */
  guidance?: string;
  /** 再試行コールバック */
  onRetry?: () => void;
  /** メッセージ種別（デフォルト: "error"） */
  variant?: ErrorVariant;
}

const variantStyles: Record<
  ErrorVariant,
  { background: string; border: string; color: string; buttonBg: string }
> = {
  error: {
    background: "#fef2f2",
    border: "#fecaca",
    color: "#991b1b",
    buttonBg: "#dc2626",
  },
  warning: {
    background: "#fffbeb",
    border: "#fed7aa",
    color: "#92400e",
    buttonBg: "#d97706",
  },
  guidance: {
    background: "#eff6ff",
    border: "#bfdbfe",
    color: "#1e40af",
    buttonBg: "#3b82f6",
  },
};

const containerBaseStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
  padding: "0.75rem 1rem",
  borderRadius: "0.375rem",
  fontSize: "0.875rem",
};

const rowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
};

const guidanceTextStyle: CSSProperties = {
  fontSize: "0.8125rem",
  opacity: 0.85,
  lineHeight: 1.5,
};

const buttonBaseStyle: CSSProperties = {
  padding: "0.25rem 0.75rem",
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
 * システムエラー時のエラーメッセージ、ユーザー操作エラー時のガイダンス、
 * リトライ可能なエラーに対する再試行ボタンを表示する。
 *
 * @param message - エラーメッセージ
 * @param guidance - ユーザーへのガイダンス
 * @param onRetry - 再試行ボタンクリック時のコールバック
 * @param variant - メッセージ種別
 */
export function ErrorMessage({
  message,
  guidance,
  onRetry,
  variant = "error",
}: ErrorMessageProps) {
  const styles = variantStyles[variant];

  const containerStyle: CSSProperties = {
    ...containerBaseStyle,
    backgroundColor: styles.background,
    border: `1px solid ${styles.border}`,
    color: styles.color,
  };

  const buttonStyle: CSSProperties = {
    ...buttonBaseStyle,
    backgroundColor: styles.buttonBg,
  };

  return (
    <div style={containerStyle} role="alert" data-variant={variant}>
      <div style={rowStyle}>
        <span>{message}</span>
        {onRetry && (
          <button type="button" style={buttonStyle} onClick={onRetry}>
            再試行
          </button>
        )}
      </div>
      {guidance && <div style={guidanceTextStyle}>{guidance}</div>}
    </div>
  );
}
