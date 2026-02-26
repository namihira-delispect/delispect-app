"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createUser, type ActionResult } from "../actions";

type Role = {
  id: number;
  name: string;
  description: string | null;
};

type CreateUserFormProps = {
  roles: Role[];
};

const ROLE_DISPLAY_NAMES: Record<string, string> = {
  SUPER_ADMIN: "全権管理者",
  SYSTEM_ADMIN: "システム管理者",
  GENERAL_USER: "一般ユーザー",
};

export function CreateUserForm({ roles }: CreateUserFormProps) {
  const [state, formAction, isPending] = useActionState<
    ActionResult | undefined,
    FormData
  >(createUser, undefined);

  const getFieldError = (field: string): string | undefined => {
    return state?.fieldErrors?.[field]?.[0];
  };

  return (
    <form
      action={formAction}
      style={styles.form}
      data-testid="create-user-form"
    >
      {state?.error && !state.fieldErrors && (
        <div style={styles.errorBox} role="alert" data-testid="form-error">
          {state.error}
        </div>
      )}

      <div style={styles.fieldGroup}>
        <label htmlFor="username" style={styles.label}>
          ユーザーID <span style={styles.required}>*</span>
        </label>
        <input
          id="username"
          name="username"
          type="text"
          required
          disabled={isPending}
          style={{
            ...styles.input,
            ...(getFieldError("username") ? styles.inputError : {}),
          }}
          placeholder="例: yamada_taro"
          data-testid="input-username"
        />
        {getFieldError("username") && (
          <p style={styles.fieldError} data-testid="error-username">
            {getFieldError("username")}
          </p>
        )}
      </div>

      <div style={styles.row}>
        <div style={styles.fieldGroup}>
          <label htmlFor="lastName" style={styles.label}>
            姓 <span style={styles.required}>*</span>
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            required
            disabled={isPending}
            style={{
              ...styles.input,
              ...(getFieldError("lastName") ? styles.inputError : {}),
            }}
            placeholder="例: 山田"
            data-testid="input-lastName"
          />
          {getFieldError("lastName") && (
            <p style={styles.fieldError} data-testid="error-lastName">
              {getFieldError("lastName")}
            </p>
          )}
        </div>

        <div style={styles.fieldGroup}>
          <label htmlFor="firstName" style={styles.label}>
            名 <span style={styles.required}>*</span>
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            required
            disabled={isPending}
            style={{
              ...styles.input,
              ...(getFieldError("firstName") ? styles.inputError : {}),
            }}
            placeholder="例: 太郎"
            data-testid="input-firstName"
          />
          {getFieldError("firstName") && (
            <p style={styles.fieldError} data-testid="error-firstName">
              {getFieldError("firstName")}
            </p>
          )}
        </div>
      </div>

      <div style={styles.fieldGroup}>
        <label htmlFor="email" style={styles.label}>
          メールアドレス <span style={styles.required}>*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          disabled={isPending}
          style={{
            ...styles.input,
            ...(getFieldError("email") ? styles.inputError : {}),
          }}
          placeholder="例: yamada@example.com"
          data-testid="input-email"
        />
        {getFieldError("email") && (
          <p style={styles.fieldError} data-testid="error-email">
            {getFieldError("email")}
          </p>
        )}
      </div>

      <div style={styles.fieldGroup}>
        <label htmlFor="password" style={styles.label}>
          パスワード <span style={styles.required}>*</span>
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          disabled={isPending}
          style={{
            ...styles.input,
            ...(getFieldError("password") ? styles.inputError : {}),
          }}
          placeholder="12文字以上（大文字・小文字・数字・記号を含む）"
          data-testid="input-password"
        />
        {getFieldError("password") && (
          <p style={styles.fieldError} data-testid="error-password">
            {getFieldError("password")}
          </p>
        )}
      </div>

      <div style={styles.fieldGroup}>
        <label htmlFor="confirmPassword" style={styles.label}>
          パスワード（確認） <span style={styles.required}>*</span>
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

      <fieldset style={styles.fieldset}>
        <legend style={styles.legend}>
          ロール <span style={styles.required}>*</span>
        </legend>
        {roles.map((role) => (
          <label key={role.id} style={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="roleIds"
              value={role.id}
              disabled={isPending}
              data-testid={`role-checkbox-${role.id}`}
            />
            <span>{ROLE_DISPLAY_NAMES[role.name] ?? role.name}</span>
            {role.description && (
              <span style={styles.roleDescription}>({role.description})</span>
            )}
          </label>
        ))}
        {getFieldError("roleIds") && (
          <p style={styles.fieldError} data-testid="error-roleIds">
            {getFieldError("roleIds")}
          </p>
        )}
      </fieldset>

      <div style={styles.fieldGroup}>
        <label style={styles.checkboxLabel}>
          <input
            type="hidden"
            name="isActive"
            value="false"
          />
          <input
            type="checkbox"
            name="isActive"
            value="true"
            defaultChecked
            disabled={isPending}
            data-testid="input-isActive"
            onChange={(e) => {
              const hidden = e.target.previousElementSibling as HTMLInputElement;
              if (hidden) {
                hidden.disabled = e.target.checked;
              }
            }}
          />
          <span>有効</span>
        </label>
      </div>

      <div style={styles.buttonGroup}>
        <Link href="/admin/users" style={styles.cancelButton}>
          キャンセル
        </Link>
        <button
          type="submit"
          disabled={isPending}
          style={styles.submitButton}
          data-testid="submit-create-user"
        >
          {isPending ? "登録中..." : "登録"}
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
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.375rem",
  },
  row: {
    display: "flex",
    gap: "1rem",
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
  fieldset: {
    border: "1px solid #e5e7eb",
    borderRadius: "4px",
    padding: "0.75rem",
    margin: 0,
  },
  legend: {
    fontSize: "0.875rem",
    fontWeight: "500",
    color: "#374151",
    padding: "0 0.25rem",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "0.875rem",
    color: "#374151",
    cursor: "pointer",
    padding: "0.25rem 0",
  },
  roleDescription: {
    color: "#9ca3af",
    fontSize: "0.8125rem",
  },
  buttonGroup: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "0.75rem",
    paddingTop: "0.5rem",
  },
  cancelButton: {
    padding: "0.5rem 1rem",
    border: "1px solid #d1d5db",
    borderRadius: "4px",
    backgroundColor: "#ffffff",
    color: "#374151",
    fontSize: "0.875rem",
    textDecoration: "none",
    cursor: "pointer",
  },
  submitButton: {
    padding: "0.5rem 1.5rem",
    backgroundColor: "#1a1a2e",
    color: "#ffffff",
    border: "none",
    borderRadius: "4px",
    fontSize: "0.875rem",
    fontWeight: "500",
    cursor: "pointer",
  },
};
