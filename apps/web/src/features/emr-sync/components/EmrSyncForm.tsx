"use client";

/**
 * 電子カルテ同期フォームコンポーネント
 *
 * 入院日付の範囲指定と同期実行ボタンを提供する。
 * 処理結果のフィードバック表示も行う。
 */

import { useState, type CSSProperties, type FormEvent } from "react";
import { executeManualImport } from "../server-actions/executeEmrSync";
import type { EmrSyncResult, EmrSyncStatus } from "../types";
import { MAX_DATE_RANGE_DAYS } from "../types";
import { EmrSyncResultPanel } from "./EmrSyncResultPanel";

const formContainerStyle: CSSProperties = {
  border: "1px solid #e2e8f0",
  borderRadius: "0.5rem",
  padding: "1.5rem",
  backgroundColor: "#ffffff",
};

const formTitleStyle: CSSProperties = {
  fontSize: "1.125rem",
  fontWeight: 600,
  color: "#1e293b",
  marginBottom: "1rem",
};

const formRowStyle: CSSProperties = {
  display: "flex",
  gap: "1rem",
  alignItems: "flex-end",
  flexWrap: "wrap",
};

const fieldStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.25rem",
};

const labelStyle: CSSProperties = {
  fontSize: "0.875rem",
  fontWeight: 500,
  color: "#475569",
};

const inputStyle: CSSProperties = {
  padding: "0.5rem 0.75rem",
  border: "1px solid #cbd5e1",
  borderRadius: "0.375rem",
  fontSize: "0.875rem",
  minWidth: "10rem",
};

const buttonStyle: CSSProperties = {
  padding: "0.5rem 1.5rem",
  backgroundColor: "#2563eb",
  color: "#ffffff",
  border: "none",
  borderRadius: "0.375rem",
  fontSize: "0.875rem",
  fontWeight: 600,
  cursor: "pointer",
  whiteSpace: "nowrap",
};

const disabledButtonStyle: CSSProperties = {
  ...buttonStyle,
  backgroundColor: "#94a3b8",
  cursor: "not-allowed",
};

const hintStyle: CSSProperties = {
  fontSize: "0.75rem",
  color: "#64748b",
  marginTop: "0.5rem",
};

const errorStyle: CSSProperties = {
  color: "#dc2626",
  fontSize: "0.875rem",
  marginTop: "0.5rem",
  padding: "0.5rem",
  backgroundColor: "#fef2f2",
  borderRadius: "0.375rem",
  border: "1px solid #fecaca",
};

const lockedStyle: CSSProperties = {
  color: "#d97706",
  fontSize: "0.875rem",
  marginTop: "0.5rem",
  padding: "0.5rem",
  backgroundColor: "#fffbeb",
  borderRadius: "0.375rem",
  border: "1px solid #fde68a",
};

export function EmrSyncForm() {
  const today = new Date().toISOString().slice(0, 10);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [syncStatus, setSyncStatus] = useState<EmrSyncStatus>("idle");
  const [syncResult, setSyncResult] = useState<EmrSyncResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isSyncing = syncStatus === "syncing";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSyncStatus("syncing");
    setErrorMessage(null);
    setSyncResult(null);

    try {
      const result = await executeManualImport({ startDate, endDate });

      if (result.success) {
        setSyncStatus("success");
        setSyncResult(result.value);
      } else {
        if (result.value.code === "IMPORT_LOCKED") {
          setSyncStatus("locked");
          setErrorMessage(String(result.value.cause));
        } else {
          setSyncStatus("error");
          setErrorMessage(
            typeof result.value.cause === "string"
              ? result.value.cause
              : "電子カルテ同期に失敗しました",
          );
        }
      }
    } catch {
      setSyncStatus("error");
      setErrorMessage("予期せぬエラーが発生しました");
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} style={formContainerStyle}>
        <div style={formTitleStyle}>手動インポート</div>
        <div style={formRowStyle}>
          <div style={fieldStyle}>
            <label htmlFor="startDate" style={labelStyle}>
              入院日（開始）
            </label>
            <input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={inputStyle}
              disabled={isSyncing}
              required
            />
          </div>
          <div style={fieldStyle}>
            <label htmlFor="endDate" style={labelStyle}>
              入院日（終了）
            </label>
            <input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={inputStyle}
              disabled={isSyncing}
              required
            />
          </div>
          <button
            type="submit"
            style={isSyncing ? disabledButtonStyle : buttonStyle}
            disabled={isSyncing}
          >
            {isSyncing ? "同期中..." : "電子カルテ同期"}
          </button>
        </div>
        <div style={hintStyle}>
          指定可能な範囲は最大{MAX_DATE_RANGE_DAYS}日間です。
        </div>
      </form>

      {syncStatus === "locked" && errorMessage && (
        <div style={lockedStyle} role="alert">
          {errorMessage}
        </div>
      )}

      {syncStatus === "error" && errorMessage && (
        <div style={errorStyle} role="alert">
          {errorMessage}
        </div>
      )}

      {syncStatus === "success" && syncResult && (
        <EmrSyncResultPanel result={syncResult} />
      )}
    </div>
  );
}
