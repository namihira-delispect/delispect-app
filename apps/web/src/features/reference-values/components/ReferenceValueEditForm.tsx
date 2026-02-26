"use client";

import { useState, useCallback, type CSSProperties, type FormEvent } from "react";
import { updateReferenceValueAction } from "../server-actions/updateReferenceValueAction";

interface ReferenceValueEditFormProps {
  id: number;
  label: string;
  initialLowerLimit: string;
  initialUpperLimit: string;
  onClose: () => void;
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
  width: "100%",
  maxWidth: "28rem",
  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
};

const headingStyle: CSSProperties = {
  fontSize: "1.125rem",
  fontWeight: 600,
  color: "#1e293b",
  marginBottom: "1rem",
};

const fieldStyle: CSSProperties = {
  marginBottom: "1rem",
};

const labelStyle: CSSProperties = {
  display: "block",
  fontSize: "0.875rem",
  fontWeight: 500,
  color: "#374151",
  marginBottom: "0.375rem",
};

const inputStyle: CSSProperties = {
  width: "100%",
  padding: "0.5rem 0.75rem",
  fontSize: "0.875rem",
  border: "1px solid #d1d5db",
  borderRadius: "0.375rem",
  boxSizing: "border-box",
};

const errorTextStyle: CSSProperties = {
  fontSize: "0.75rem",
  color: "#dc2626",
  marginTop: "0.25rem",
};

const buttonGroupStyle: CSSProperties = {
  display: "flex",
  gap: "0.75rem",
  justifyContent: "flex-end",
  marginTop: "1.5rem",
};

const cancelButtonStyle: CSSProperties = {
  padding: "0.5rem 1.25rem",
  fontSize: "0.875rem",
  fontWeight: 500,
  color: "#374151",
  backgroundColor: "#ffffff",
  border: "1px solid #d1d5db",
  borderRadius: "0.375rem",
  cursor: "pointer",
};

const submitButtonStyle = (disabled: boolean): CSSProperties => ({
  padding: "0.5rem 1.25rem",
  fontSize: "0.875rem",
  fontWeight: 500,
  color: "#ffffff",
  backgroundColor: disabled ? "#9ca3af" : "#2563eb",
  border: "none",
  borderRadius: "0.375rem",
  cursor: disabled ? "not-allowed" : "pointer",
});

const messageStyle = (isSuccess: boolean): CSSProperties => ({
  padding: "0.75rem",
  marginBottom: "1rem",
  borderRadius: "0.375rem",
  fontSize: "0.875rem",
  backgroundColor: isSuccess ? "#f0fdf4" : "#fef2f2",
  color: isSuccess ? "#166534" : "#991b1b",
  border: `1px solid ${isSuccess ? "#bbf7d0" : "#fecaca"}`,
});

/**
 * 基準値編集フォーム（モーダルダイアログ）
 */
export function ReferenceValueEditForm({
  id,
  label,
  initialLowerLimit,
  initialUpperLimit,
  onClose,
}: ReferenceValueEditFormProps) {
  const [lowerLimit, setLowerLimit] = useState(initialLowerLimit);
  const [upperLimit, setUpperLimit] = useState(initialUpperLimit);
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setIsPending(true);
      setMessage(null);
      setFieldErrors({});

      const result = await updateReferenceValueAction({
        id,
        lowerLimit: lowerLimit || null,
        upperLimit: upperLimit || null,
      });

      setIsPending(false);

      if (result.success) {
        setIsSuccess(true);
        setMessage("基準値を更新しました。ページを再読み込みして反映します。");
        // 少し待ってからモーダルを閉じて再読み込み
        setTimeout(() => {
          onClose();
          window.location.reload();
        }, 1000);
      } else {
        setIsSuccess(false);
        if (
          result.value.code === "INVALID_INPUT" &&
          typeof result.value.cause === "object" &&
          result.value.cause !== null
        ) {
          setFieldErrors(result.value.cause as Record<string, string[]>);
        } else {
          setMessage(
            typeof result.value.cause === "string"
              ? result.value.cause
              : "基準値の更新に失敗しました",
          );
        }
      }
    },
    [id, lowerLimit, upperLimit, onClose],
  );

  return (
    <div style={overlayStyle} data-testid="edit-dialog">
      <div style={dialogStyle} role="dialog" aria-modal="true">
        <h3 style={headingStyle}>基準値の編集 - {label}</h3>

        {message && (
          <div
            style={messageStyle(isSuccess)}
            role="alert"
            data-testid="edit-message"
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div style={fieldStyle}>
            <label htmlFor="lowerLimit" style={labelStyle}>
              下限値
            </label>
            <input
              id="lowerLimit"
              name="lowerLimit"
              type="text"
              inputMode="decimal"
              value={lowerLimit}
              onChange={(e) => setLowerLimit(e.target.value)}
              style={inputStyle}
              disabled={isPending}
              data-testid="input-lower-limit"
            />
            {fieldErrors.lowerLimit && (
              <p style={errorTextStyle} role="alert">
                {fieldErrors.lowerLimit[0]}
              </p>
            )}
          </div>

          <div style={fieldStyle}>
            <label htmlFor="upperLimit" style={labelStyle}>
              上限値
            </label>
            <input
              id="upperLimit"
              name="upperLimit"
              type="text"
              inputMode="decimal"
              value={upperLimit}
              onChange={(e) => setUpperLimit(e.target.value)}
              style={inputStyle}
              disabled={isPending}
              data-testid="input-upper-limit"
            />
            {fieldErrors.upperLimit && (
              <p style={errorTextStyle} role="alert">
                {fieldErrors.upperLimit[0]}
              </p>
            )}
          </div>

          <div style={buttonGroupStyle}>
            <button
              type="button"
              style={cancelButtonStyle}
              onClick={onClose}
              disabled={isPending}
              data-testid="edit-cancel"
            >
              キャンセル
            </button>
            <button
              type="submit"
              style={submitButtonStyle(isPending)}
              disabled={isPending}
              data-testid="edit-submit"
            >
              {isPending ? "更新中..." : "更新する"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
