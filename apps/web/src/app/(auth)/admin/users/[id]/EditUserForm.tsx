"use client";

import { useActionState } from "react";
import Link from "next/link";
import { updateUser, type ActionResult } from "../actions";

type Role = {
  id: number;
  name: string;
  description: string | null;
};

type UserData = {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  roles: { id: number; name: string }[];
};

type EditUserFormProps = {
  user: UserData;
  roles: Role[];
};

const ROLE_DISPLAY_NAMES: Record<string, string> = {
  SUPER_ADMIN: "全権管理者",
  SYSTEM_ADMIN: "システム管理者",
  GENERAL_USER: "一般ユーザー",
};

export function EditUserForm({ user, roles }: EditUserFormProps) {
  const updateUserWithId = updateUser.bind(null, user.id);

  const [state, formAction, isPending] = useActionState<
    ActionResult | undefined,
    FormData
  >(updateUserWithId, undefined);

  const getFieldError = (field: string): string | undefined => {
    return state?.fieldErrors?.[field]?.[0];
  };

  const currentRoleIds = user.roles.map((r) => r.id);

  return (
    <form
      action={formAction}
      style={styles.form}
      data-testid="edit-user-form"
    >
      {state?.error && !state.fieldErrors && (
        <div style={styles.errorBox} role="alert" data-testid="form-error">
          {state.error}
        </div>
      )}

      <div style={styles.fieldGroup}>
        <label style={styles.label}>ユーザーID</label>
        <div style={styles.readonlyValue} data-testid="display-username">
          {user.username}
        </div>
        <p style={styles.hint}>ユーザーIDは変更できません</p>
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
            defaultValue={user.lastName}
            disabled={isPending}
            style={{
              ...styles.input,
              ...(getFieldError("lastName") ? styles.inputError : {}),
            }}
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
            defaultValue={user.firstName}
            disabled={isPending}
            style={{
              ...styles.input,
              ...(getFieldError("firstName") ? styles.inputError : {}),
            }}
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
          defaultValue={user.email}
          disabled={isPending}
          style={{
            ...styles.input,
            ...(getFieldError("email") ? styles.inputError : {}),
          }}
          data-testid="input-email"
        />
        {getFieldError("email") && (
          <p style={styles.fieldError} data-testid="error-email">
            {getFieldError("email")}
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
              defaultChecked={currentRoleIds.includes(role.id)}
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
            defaultChecked={user.isActive}
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
          data-testid="submit-edit-user"
        >
          {isPending ? "更新中..." : "更新"}
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
  readonlyValue: {
    padding: "0.5rem 0.75rem",
    backgroundColor: "#f3f4f6",
    borderRadius: "4px",
    fontSize: "0.875rem",
    color: "#6b7280",
  },
  hint: {
    margin: 0,
    fontSize: "0.75rem",
    color: "#9ca3af",
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
