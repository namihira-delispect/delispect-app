"use client";

import { useActionState } from "react";
import { loginAction } from "../server-actions/loginAction";
import type { LoginFormState } from "../types";

const initialState: LoginFormState = {};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialState,
  );

  return (
    <form action={formAction} className="login-form" noValidate>
      <div className="login-form__header">
        <h1 className="login-form__title">DELISPECT</h1>
        <p className="login-form__subtitle">せん妄リスク評価システム</p>
      </div>

      {state.error && (
        <div className="login-form__error" role="alert">
          {state.error}
        </div>
      )}

      <div className="login-form__field">
        <label htmlFor="username" className="login-form__label">
          ユーザーID
        </label>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          required
          className="login-form__input"
          disabled={isPending}
          aria-describedby={
            state.fieldErrors?.username ? "username-error" : undefined
          }
        />
        {state.fieldErrors?.username && (
          <p id="username-error" className="login-form__field-error" role="alert">
            {state.fieldErrors.username[0]}
          </p>
        )}
      </div>

      <div className="login-form__field">
        <label htmlFor="password" className="login-form__label">
          パスワード
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="login-form__input"
          disabled={isPending}
          aria-describedby={
            state.fieldErrors?.password ? "password-error" : undefined
          }
        />
        {state.fieldErrors?.password && (
          <p id="password-error" className="login-form__field-error" role="alert">
            {state.fieldErrors.password[0]}
          </p>
        )}
      </div>

      <button
        type="submit"
        className="login-form__submit"
        disabled={isPending}
      >
        {isPending ? "ログイン中..." : "ログイン"}
      </button>
    </form>
  );
}
