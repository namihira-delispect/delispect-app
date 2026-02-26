"use client";

import { useActionState, useState } from "react";
import { resetUserPassword, type ActionResult } from "../actions";

type ResetPasswordFormProps = {
  userId: number;
};

export function ResetPasswordForm({ userId }: ResetPasswordFormProps) {
  const resetPasswordWithId = resetUserPassword.bind(null, userId);
  const [showSuccess, setShowSuccess] = useState(false);

  const [state, formAction, isPending] = useActionState<
    ActionResult | undefined,
    FormData
  >(async (prevState, formData) => {
    setShowSuccess(false);
    const result = await resetPasswordWithId(prevState, formData);
    if (result.success) {
      setShowSuccess(true);
    }
    return result;
  }, undefined);

  const getFieldError = (field: string): string | undefined => {
    return state?.fieldErrors?.[field]?.[0];
  };

  return (
    <form
      action={formAction}
      style={styles.form}
      data-testid="reset-password-form"
    >
      {state?.error && !state.fieldErrors && (
        <div style={styles.errorBox} role="alert" data-testid="password-form-error">
          {state.error}
        </div>
      )}

      {showSuccess && (
        <div style={styles.successBox} role="status" data-testid="password-reset-success">
          パスワードをリセットしました。対象ユーザーのセッションは無効化されます。
        </div>
      )}

      <div style={styles.fieldGroup}>
        <label htmlFor="newPassword" style={styles.label}>
          新しいパスワード <span style={styles.required}>*</span>
        </label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          required
          disabled={isPending}
          style={{
            ...styles.input,
            ...(getFieldError("newPassword") ? styles.inputError : {}),
          }}
          placeholder="12文字以上（大文字・小文字・数字・記号を含む）"
          data-testid="input-newPassword"
        />
        {getFieldError("newPassword") && (
          <p style={styles.fieldError} data-testid="error-newPassword">
            {getFieldError("newPassword")}
          </p>
        )}
      </div>

      <div style={styles.fieldGroup}>
        <label htmlFor="confirmPassword" style={styles.label}>
          新しいパスワード（確認） <span style={styles.required}>*</span>
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          disabled={isPending}
          style={{
            ...styles.input,
            ...(getFieldError("confirmPassword") ? styles.inputError : {}),
          }}
          placeholder="パスワードを再入力"
          data-testid="input-confirmPassword"
        />
        {getFieldError("confirmPassword") && (
          <p style={styles.fieldError} data-testid="error-confirmPassword">
            {getFieldError("confirmPassword")}
          </p>
        )}
      </div>

      <div style={styles.buttonGroup}>
        <button
          type="submit"
          disabled={isPending}
          style={styles.submitButton}
          data-testid="submit-reset-password"
        >
          {isPending ? "リセット中..." : "パスワードをリセット"}
        </button>
      </div>
    </form>
  );
}

const styles: Record<string, React.CSSProperties> = {
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem",
    maxWidth: "600px",
    backgroundColor: "#ffffff",
    padding: "1.5rem",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
  },
  errorBox: {
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "4px",
    padding: "0.75rem",
    color: "#dc2626",
    fontSize: "0.875rem",
  },
  successBox: {
    backgroundColor: "#f0fdf4",
    border: "1px solid #bbf7d0",
    borderRadius: "4px",
    padding: "0.75rem",
    color: "#16a34a",
    fontSize: "0.875rem",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.375rem",
  },
  label: {
    fontSize: "0.875rem",
    fontWeight: "500",
    color: "#374151",
  },
  required: {
    color: "#dc2626",
  },
  input: {
    padding: "0.5rem 0.75rem",
    border: "1px solid #d1d5db",
    borderRadius: "4px",
    fontSize: "0.875rem",
    outline: "none",
    transition: "border-color 0.2s",
    width: "100%",
    boxSizing: "border-box" as const,
  },
  inputError: {
    borderColor: "#dc2626",
  },
  fieldError: {
    margin: 0,
    fontSize: "0.8125rem",
    color: "#dc2626",
  },
  buttonGroup: {
    display: "flex",
    justifyContent: "flex-end",
    paddingTop: "0.5rem",
  },
  submitButton: {
    padding: "0.5rem 1.5rem",
    backgroundColor: "#dc2626",
    color: "#ffffff",
    border: "none",
    borderRadius: "4px",
    fontSize: "0.875rem",
    fontWeight: "500",
    cursor: "pointer",
  },
};
