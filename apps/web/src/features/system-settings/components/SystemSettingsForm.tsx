"use client";

import { useActionState, type CSSProperties } from "react";
import { updateSystemSettingsAction } from "../server-actions/updateSystemSettingsAction";
import type { SystemSettingsFormState, SystemSettingsData } from "../types";

interface SystemSettingsFormProps {
  initialSettings: SystemSettingsData;
}

const initialState: SystemSettingsFormState = {};

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

const helpTextStyle: CSSProperties = {
  fontSize: "0.75rem",
  color: "#6b7280",
  marginTop: "0.25rem",
};

/**
 * システム設定フォーム
 *
 * バッチインポート実行時刻と対象入院日付範囲を設定する。
 */
export function SystemSettingsForm({ initialSettings }: SystemSettingsFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateSystemSettingsAction,
    initialState,
  );

  return (
    <form action={formAction} style={formStyle} noValidate>
      <h2 style={headingStyle}>バッチインポート設定</h2>

      {state.message && (
        <div
          style={messageStyle(state.success === true)}
          role="alert"
          data-testid="system-settings-message"
        >
          {state.message}
        </div>
      )}

      <div style={fieldStyle}>
        <label htmlFor="batchImportTime" style={labelStyle}>
          バッチインポート実行時刻
        </label>
        <input
          id="batchImportTime"
          name="batchImportTime"
          type="time"
          defaultValue={initialSettings.batchImportTime}
          required
          style={inputStyle}
          disabled={isPending}
          aria-describedby={
            state.fieldErrors?.batchImportTime
              ? "batchImportTime-error"
              : "batchImportTime-help"
          }
        />
        <p id="batchImportTime-help" style={helpTextStyle}>
          日次バッチインポートを実行する時刻を設定します。
        </p>
        {state.fieldErrors?.batchImportTime && (
          <p id="batchImportTime-error" style={errorStyle} role="alert">
            {state.fieldErrors.batchImportTime[0]}
          </p>
        )}
      </div>

      <div style={fieldStyle}>
        <label htmlFor="batchImportDateRangeDays" style={labelStyle}>
          対象入院日付範囲（日数）
        </label>
        <input
          id="batchImportDateRangeDays"
          name="batchImportDateRangeDays"
          type="number"
          min={1}
          max={30}
          defaultValue={initialSettings.batchImportDateRangeDays}
          required
          style={inputStyle}
          disabled={isPending}
          aria-describedby={
            state.fieldErrors?.batchImportDateRangeDays
              ? "batchImportDateRangeDays-error"
              : "batchImportDateRangeDays-help"
          }
        />
        <p id="batchImportDateRangeDays-help" style={helpTextStyle}>
          実行日から何日前までの入院データを取り込み対象とするか設定します（1〜30日）。
        </p>
        {state.fieldErrors?.batchImportDateRangeDays && (
          <p id="batchImportDateRangeDays-error" style={errorStyle} role="alert">
            {state.fieldErrors.batchImportDateRangeDays[0]}
          </p>
        )}
      </div>

      <button
        type="submit"
        style={buttonStyle(isPending)}
        disabled={isPending}
        data-testid="system-settings-submit"
      >
        {isPending ? "保存中..." : "設定を保存"}
      </button>
    </form>
  );
}
