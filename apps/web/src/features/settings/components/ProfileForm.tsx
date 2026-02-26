"use client";

import { useActionState, type CSSProperties } from "react";
import { updateProfileAction } from "../server-actions/updateProfileAction";
import type { ProfileFormState, UserProfile } from "../types";

interface ProfileFormProps {
  initialProfile: UserProfile;
}

const initialState: ProfileFormState = {};

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

/**
 * プロフィール更新フォーム
 */
export function ProfileForm({ initialProfile }: ProfileFormProps) {
  const [state, formAction, isPending] = useActionState(updateProfileAction, initialState);

  return (
    <form action={formAction} style={formStyle} noValidate>
      <h2 style={headingStyle}>アカウント情報</h2>

      {state.message && (
        <div
          style={messageStyle(state.success === true)}
          role="alert"
          data-testid="profile-message"
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
          defaultValue={initialProfile.username}
          autoComplete="username"
          required
          style={inputStyle}
          disabled={isPending}
          aria-describedby={state.fieldErrors?.username ? "username-error" : undefined}
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
          defaultValue={initialProfile.email}
          autoComplete="email"
          required
          style={inputStyle}
          disabled={isPending}
          aria-describedby={state.fieldErrors?.email ? "email-error" : undefined}
        />
        {state.fieldErrors?.email && (
          <p id="email-error" style={errorStyle} role="alert">
            {state.fieldErrors.email[0]}
          </p>
        )}
      </div>

      <button
        type="submit"
        style={buttonStyle(isPending)}
        disabled={isPending}
        data-testid="profile-submit"
      >
        {isPending ? "更新中..." : "更新する"}
      </button>
    </form>
  );
}
