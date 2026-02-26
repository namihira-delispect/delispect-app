type GuidanceMessageVariant = "info" | "warning" | "success";

type GuidanceMessageProps = {
  /** ガイダンスメッセージ */
  message: string;
  /** 表示バリアント */
  variant?: GuidanceMessageVariant;
};

const VARIANT_STYLES: Record<
  GuidanceMessageVariant,
  { container: React.CSSProperties; icon: string; iconBg: React.CSSProperties }
> = {
  info: {
    container: {
      backgroundColor: "#eff6ff",
      border: "1px solid #bfdbfe",
    },
    icon: "i",
    iconBg: {
      backgroundColor: "#2563eb",
    },
  },
  warning: {
    container: {
      backgroundColor: "#fffbeb",
      border: "1px solid #fde68a",
    },
    icon: "!",
    iconBg: {
      backgroundColor: "#d97706",
    },
  },
  success: {
    container: {
      backgroundColor: "#f0fdf4",
      border: "1px solid #bbf7d0",
    },
    icon: "\u2713",
    iconBg: {
      backgroundColor: "#16a34a",
    },
  },
};

/**
 * ガイダンスメッセージ表示コンポーネント
 *
 * ユーザーに対する案内・警告・成功メッセージを表示する。
 */
export function GuidanceMessage({
  message,
  variant = "info",
}: GuidanceMessageProps) {
  const variantStyle = VARIANT_STYLES[variant];

  return (
    <div
      style={{ ...styles.container, ...variantStyle.container }}
      role="status"
      data-testid="guidance-message"
    >
      <div
        style={{ ...styles.iconWrapper, ...variantStyle.iconBg }}
        aria-hidden="true"
      >
        {variantStyle.icon}
      </div>
      <p style={styles.message}>{message}</p>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    alignItems: "flex-start",
    gap: "0.75rem",
    padding: "1rem",
    borderRadius: "4px",
  },
  iconWrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "1.5rem",
    height: "1.5rem",
    borderRadius: "9999px",
    color: "#ffffff",
    fontSize: "0.75rem",
    fontWeight: "bold",
    flexShrink: 0,
  },
  message: {
    margin: 0,
    color: "#374151",
    fontSize: "0.875rem",
    lineHeight: "1.5",
  },
};
