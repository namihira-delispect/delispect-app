"use client";

import { useCallback, useEffect, useRef, type CSSProperties } from "react";

export interface ConfirmDialogProps {
  /** ダイアログが開いているか */
  isOpen: boolean;
  /** タイトル */
  title: string;
  /** 確認メッセージ */
  message: string;
  /** 確認ボタンラベル（デフォルト: "確認"） */
  confirmLabel?: string;
  /** キャンセルボタンラベル（デフォルト: "キャンセル"） */
  cancelLabel?: string;
  /** 確認時のコールバック */
  onConfirm: () => void;
  /** キャンセル時のコールバック */
  onCancel: () => void;
  /** 確認ボタンのバリアント（デフォルト: "primary"） */
  variant?: "primary" | "danger";
}

const overlayStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const dialogStyle: CSSProperties = {
  backgroundColor: "#ffffff",
  borderRadius: "0.5rem",
  padding: "1.5rem",
  minWidth: "20rem",
  maxWidth: "28rem",
  boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
};

const titleStyle: CSSProperties = {
  fontSize: "1.125rem",
  fontWeight: 600,
  color: "#1e293b",
  marginBottom: "0.5rem",
};

const messageStyle: CSSProperties = {
  fontSize: "0.875rem",
  color: "#64748b",
  marginBottom: "1.5rem",
  lineHeight: 1.5,
};

const buttonGroupStyle: CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "0.5rem",
};

const cancelButtonStyle: CSSProperties = {
  padding: "0.5rem 1rem",
  backgroundColor: "#f1f5f9",
  color: "#475569",
  border: "1px solid #cbd5e1",
  borderRadius: "0.375rem",
  fontSize: "0.875rem",
  cursor: "pointer",
};

const confirmButtonBaseStyle: CSSProperties = {
  padding: "0.5rem 1rem",
  color: "#ffffff",
  border: "none",
  borderRadius: "0.375rem",
  fontSize: "0.875rem",
  cursor: "pointer",
};

/**
 * 確認ダイアログコンポーネント
 *
 * @param isOpen - ダイアログの表示状態
 * @param title - ダイアログタイトル
 * @param message - 確認メッセージ
 * @param onConfirm - 確認時コールバック
 * @param onCancel - キャンセル時コールバック
 */
export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = "確認",
  cancelLabel = "キャンセル",
  onConfirm,
  onCancel,
  variant = "primary",
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
      }
    },
    [onCancel],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const confirmBgColor = variant === "danger" ? "#dc2626" : "#3b82f6";

  return (
    <div
      style={overlayStyle}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div style={dialogStyle} ref={dialogRef}>
        <h2 id="confirm-dialog-title" style={titleStyle}>
          {title}
        </h2>
        <p style={messageStyle}>{message}</p>
        <div style={buttonGroupStyle}>
          <button type="button" style={cancelButtonStyle} onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            type="button"
            style={{ ...confirmButtonBaseStyle, backgroundColor: confirmBgColor }}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
