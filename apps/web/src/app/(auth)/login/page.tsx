"use client";

import { useActionState } from "react";
import { loginAction, type LoginActionResult } from "./actions";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState<
    LoginActionResult | undefined,
    FormData
  >(loginAction, undefined);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>DELISPECT</h1>
          <p style={styles.subtitle}>せん妄リスク評価システム</p>
        </div>

        <form action={formAction} style={styles.form}>
          {state?.error && (
            <div style={styles.errorBox} role="alert">
              {state.error}
            </div>
          )}

          <div style={styles.fieldGroup}>
            <label htmlFor="username" style={styles.label}>
              ユーザーID
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              autoComplete="username"
              autoFocus
              disabled={isPending}
              style={styles.input}
              placeholder="ユーザーIDを入力"
            />
          </div>

          <div style={styles.fieldGroup}>
            <label htmlFor="password" style={styles.label}>
              パスワード
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              disabled={isPending}
              style={styles.input}
              placeholder="パスワードを入力"
            />
          </div>

          <button type="submit" disabled={isPending} style={styles.button}>
            {isPending ? "ログイン中..." : "ログイン"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
    padding: "1rem",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    padding: "2rem",
    width: "100%",
    maxWidth: "400px",
  },
  header: {
    textAlign: "center" as const,
    marginBottom: "2rem",
  },
  title: {
    fontSize: "1.75rem",
    fontWeight: "bold",
    color: "#1a1a2e",
    margin: "0 0 0.5rem 0",
  },
  subtitle: {
    fontSize: "0.875rem",
    color: "#666",
    margin: 0,
  },
  form: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "1.25rem",
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
    flexDirection: "column" as const,
    gap: "0.5rem",
  },
  label: {
    fontSize: "0.875rem",
    fontWeight: "500",
    color: "#374151",
  },
  input: {
    padding: "0.625rem 0.75rem",
    border: "1px solid #d1d5db",
    borderRadius: "4px",
    fontSize: "1rem",
    outline: "none",
    transition: "border-color 0.2s",
  },
  button: {
    backgroundColor: "#1a1a2e",
    color: "#ffffff",
    border: "none",
    borderRadius: "4px",
    padding: "0.75rem",
    fontSize: "1rem",
    fontWeight: "500",
    cursor: "pointer",
    transition: "background-color 0.2s",
    marginTop: "0.5rem",
  },
};
