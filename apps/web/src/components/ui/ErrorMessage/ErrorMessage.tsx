type ErrorMessageProps = {
  /** エラーメッセージ */
  message: string;
  /** 再試行ボタンのコールバック（undefinedの場合はボタン非表示） */
  onRetry?: () => void;
};

/**
 * エラーメッセージ表示コンポーネント
 *
 * システムエラーやユーザー操作エラーのメッセージを表示する。
 * オプションで再試行ボタンを表示する。
 */
export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div style={styles.container} role="alert" data-testid="error-message">
      <div style={styles.iconWrapper} aria-hidden="true">
        !
      </div>
      <div style={styles.content}>
        <p style={styles.message}>{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            style={styles.retryButton}
            data-testid="error-retry-button"
          >
            再試行
          </button>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    alignItems: "flex-start",
    gap: "0.75rem",
    padding: "1rem",
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "4px",
  },
  iconWrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "1.5rem",
    height: "1.5rem",
    borderRadius: "9999px",
    backgroundColor: "#dc2626",
    color: "#ffffff",
    fontSize: "0.875rem",
    fontWeight: "bold",
    flexShrink: 0,
  },
  content: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  message: {
    margin: 0,
    color: "#991b1b",
    fontSize: "0.875rem",
    lineHeight: "1.5",
  },
  retryButton: {
    alignSelf: "flex-start",
    padding: "0.375rem 0.75rem",
    backgroundColor: "#ffffff",
    color: "#dc2626",
    border: "1px solid #fecaca",
    borderRadius: "4px",
    fontSize: "0.8125rem",
    cursor: "pointer",
    transition: "background-color 0.15s",
  },
};
