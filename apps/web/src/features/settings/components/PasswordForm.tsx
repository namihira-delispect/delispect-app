"use client";

import { useActionState, useRef, type CSSProperties } from "react";
import { changePasswordAction } from "../server-actions/changePasswordAction";
import type { PasswordFormState } from "../types";

const initialState: PasswordFormState = {};

const formStyle: CSSProperties = {
  backgroundColor: "#ffffff",
  borderRadius: "0.5rem",
  padding: "1.5rem",
  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
};

const headingStyle: CSSProperties = {
  fontSize: "1.25rem",
  fontWeight: 600,
  marginBottom: "1.5rem",
  color: "#1e293b",
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

const buttonStyle = (disabled: boolean): CSSProperties => ({
  padding: "0.5rem 1.5rem",
  fontSize: "0.875rem",
  fontWeight: 500,
  color: "#ffffff",
  backgroundColor: disabled ? "#9ca3af" : "#2563eb",
  border: "none",
  borderRadius: "0.375rem",
  cursor: disabled ? "not-allowed" : "pointer",
});

const errorStyle: CSSProperties = {
  fontSize: "0.75rem",
  color: "#dc2626",
  marginTop: "0.25rem",
};

const messageStyle = (isSuccess: boolean): CSSProperties => ({
  padding: "0.75rem",
  marginBottom: "1rem",
  borderRadius: "0.375rem",
  fontSize: "0.875rem",
  backgroundColor: isSuccess ? "#f0fdf4" : "#fef2f2",
  color: isSuccess ? "#166534" : "#991b1b",
  border: `1px solid ${isSuccess ? "#bbf7d0" : "#fecaca"}`,
});

const hintStyle: CSSProperties = {
  fontSize: "0.75rem",
  color: "#6b7280",
  marginTop: "0.25rem",
};

/**
 * パスワード変更フォーム
 */
export function PasswordForm() {
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction, isPending] = useActionState(
    async (prevState: PasswordFormState, formData: FormData) => {
      const result = await changePasswordAction(prevState, formData);
      if (result.success) {
        formRef.current?.reset();
      }
      return result;
    },
    initialState,
  );

  return (
    <form ref={formRef} action={formAction} style={formStyle} noValidate>
      <h2 style={headingStyle}>パスワード変更</h2>

      {state.message && (
        <div
          style={messageStyle(state.success === true)}
          role="alert"
          data-testid="password-message"
        >
          {state.message}
        </div>
      )}

      <div style={fieldStyle}>
        <label htmlFor="currentPassword" style={labelStyle}>
          現在のパスワード
        </label>
        <input
          id="currentPassword"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
          style={inputStyle}
          disabled={isPending}
          aria-describedby={
            state.fieldErrors?.currentPassword ? "currentPassword-error" : undefined
          }
        />
        {state.fieldErrors?.currentPassword && (
          <p id="currentPassword-error" style={errorStyle} role="alert">
            {state.fieldErrors.currentPassword[0]}
          </p>
        )}
      </div>

      <div style={fieldStyle}>
        <label htmlFor="newPassword" style={labelStyle}>
          新しいパスワード
        </label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          required
          style={inputStyle}
          disabled={isPending}
          aria-describedby={
            state.fieldErrors?.newPassword ? "newPassword-error" : "newPassword-hint"
          }
        />
        <p id="newPassword-hint" style={hintStyle}>
          12文字以上、大文字・小文字・数字・記号をそれぞれ含めてください
        </p>
        {state.fieldErrors?.newPassword && (
          <p id="newPassword-error" style={errorStyle} role="alert">
            {state.fieldErrors.newPassword[0]}
          </p>
        )}
      </div>

      <div style={fieldStyle}>
        <label htmlFor="confirmPassword" style={labelStyle}>
          新しいパスワード（確認）
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          style={inputStyle}
          disabled={isPending}
          aria-describedby={
            state.fieldErrors?.confirmPassword ? "confirmPassword-error" : undefined
          }
        />
        {state.fieldErrors?.confirmPassword && (
          <p id="confirmPassword-error" style={errorStyle} role="alert">
            {state.fieldErrors.confirmPassword[0]}
          </p>
        )}
      </div>

      <button
        type="submit"
        style={buttonStyle(isPending)}
        disabled={isPending}
        data-testid="password-submit"
      >
        {isPending ? "変更中..." : "パスワードを変更する"}
      </button>
    </form>
  );
}
