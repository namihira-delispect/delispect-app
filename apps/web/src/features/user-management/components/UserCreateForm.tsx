"use client";

import { useActionState, type CSSProperties } from "react";
import { createUserAction } from "../server-actions/createUserAction";
import type { CreateUserFormState } from "../types";

const initialState: CreateUserFormState = {};

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

const checkboxGroupStyle: CSSProperties = {
  display: "flex",
  gap: "1rem",
  flexWrap: "wrap",
};

const checkboxLabelStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.375rem",
  fontSize: "0.875rem",
  color: "#374151",
  cursor: "pointer",
};

const buttonGroupStyle: CSSProperties = {
  display: "flex",
  gap: "0.75rem",
  marginTop: "1.5rem",
};

const submitButtonStyle = (disabled: boolean): CSSProperties => ({
  padding: "0.5rem 1.5rem",
  fontSize: "0.875rem",
  fontWeight: 500,
  color: "#ffffff",
  backgroundColor: disabled ? "#9ca3af" : "#2563eb",
  border: "none",
  borderRadius: "0.375rem",
  cursor: disabled ? "not-allowed" : "pointer",
});

const cancelButtonStyle: CSSProperties = {
  padding: "0.5rem 1.5rem",
  fontSize: "0.875rem",
  fontWeight: 500,
  color: "#475569",
  backgroundColor: "#f1f5f9",
  border: "1px solid #cbd5e1",
  borderRadius: "0.375rem",
  cursor: "pointer",
  textDecoration: "none",
};

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

const ROLE_OPTIONS = [
  { value: "GENERAL", label: "一般ユーザー" },
  { value: "SYSTEM_ADMIN", label: "システム管理者" },
  { value: "SUPER_ADMIN", label: "全権管理者" },
];

/**
 * ユーザー登録フォーム
 */
export function UserCreateForm() {
  const [state, formAction, isPending] = useActionState(
    createUserAction,
    initialState,
  );

  return (
    <form action={formAction} style={formStyle} noValidate>
      <h2 style={headingStyle}>ユーザー登録</h2>

      {state.message && (
        <div
          style={messageStyle(state.success === true)}
          role="alert"
          data-testid="create-user-message"
        >
          {state.message}
        </div>
      )}

      <div style={fieldStyle}>
        <label htmlFor="username" style={labelStyle}>
          ユーザー名
        </label>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          required
          style={inputStyle}
          disabled={isPending}
          aria-describedby={
            state.fieldErrors?.username ? "username-error" : undefined
          }
        />
        {state.fieldErrors?.username && (
          <p id="username-error" style={errorStyle} role="alert">
            {state.fieldErrors.username[0]}
          </p>
        )}
      </div>

      <div style={fieldStyle}>
        <label htmlFor="email" style={labelStyle}>
          メールアドレス
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          style={inputStyle}
          disabled={isPending}
          aria-describedby={
            state.fieldErrors?.email ? "email-error" : undefined
          }
        />
        {state.fieldErrors?.email && (
          <p id="email-error" style={errorStyle} role="alert">
            {state.fieldErrors.email[0]}
          </p>
        )}
      </div>

      <div style={fieldStyle}>
        <label htmlFor="password" style={labelStyle}>
          パスワード
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          style={inputStyle}
          disabled={isPending}
          aria-describedby={
            state.fieldErrors?.password ? "password-error" : undefined
          }
        />
        {state.fieldErrors?.password && (
          <p id="password-error" style={errorStyle} role="alert">
            {state.fieldErrors.password[0]}
          </p>
        )}
      </div>

      <div style={fieldStyle}>
        <label htmlFor="confirmPassword" style={labelStyle}>
          パスワード（確認）
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
            state.fieldErrors?.confirmPassword
              ? "confirmPassword-error"
              : undefined
          }
        />
        {state.fieldErrors?.confirmPassword && (
          <p id="confirmPassword-error" style={errorStyle} role="alert">
            {state.fieldErrors.confirmPassword[0]}
          </p>
        )}
      </div>

      <div style={fieldStyle}>
        <span style={labelStyle}>ロール</span>
        <div style={checkboxGroupStyle}>
          {ROLE_OPTIONS.map((option) => (
            <label key={option.value} style={checkboxLabelStyle}>
              <input
                type="checkbox"
                name="roles"
                value={option.value}
                disabled={isPending}
              />
              {option.label}
            </label>
          ))}
        </div>
        {state.fieldErrors?.roles && (
          <p style={errorStyle} role="alert">
            {state.fieldErrors.roles[0]}
          </p>
        )}
      </div>

      <div style={buttonGroupStyle}>
        <button
          type="submit"
          style={submitButtonStyle(isPending)}
          disabled={isPending}
          data-testid="create-user-submit"
        >
          {isPending ? "登録中..." : "登録する"}
        </button>
        <a href="/admin/users" style={cancelButtonStyle}>
          キャンセル
        </a>
      </div>
    </form>
  );
}
