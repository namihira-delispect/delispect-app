"use client";

import {
  useState,
  useCallback,
  type CSSProperties,
  type FormEvent,
} from "react";
import { AUDIT_ACTIONS } from "@/lib/audit";
import type { AuditLogSearchParams } from "../types";
import { ACTION_LABELS } from "../types";

export interface AuditLogSearchFormProps {
  /** 初期検索条件 */
  initialParams?: AuditLogSearchParams;
  /** 検索実行時のコールバック */
  onSearch: (params: AuditLogSearchParams) => void;
  /** クリア時のコールバック */
  onClear: () => void;
}

const formStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem",
  padding: "1rem",
  backgroundColor: "#f8fafc",
  borderRadius: "0.5rem",
  border: "1px solid #e2e8f0",
};

const rowStyle: CSSProperties = {
  display: "flex",
  gap: "1rem",
  flexWrap: "wrap",
  alignItems: "flex-end",
};

const fieldStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.25rem",
};

const labelStyle: CSSProperties = {
  fontSize: "0.75rem",
  fontWeight: 500,
  color: "#475569",
};

const inputStyle: CSSProperties = {
  padding: "0.375rem 0.5rem",
  border: "1px solid #cbd5e1",
  borderRadius: "0.375rem",
  fontSize: "0.875rem",
  color: "#1e293b",
};

const checkboxContainerStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "0.5rem",
  maxWidth: "40rem",
};

const checkboxLabelStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.25rem",
  fontSize: "0.8125rem",
  color: "#475569",
  cursor: "pointer",
};

const buttonRowStyle: CSSProperties = {
  display: "flex",
  gap: "0.5rem",
  marginTop: "0.25rem",
};

const searchButtonStyle: CSSProperties = {
  padding: "0.5rem 1.25rem",
  backgroundColor: "#3b82f6",
  color: "#ffffff",
  border: "none",
  borderRadius: "0.375rem",
  fontSize: "0.875rem",
  fontWeight: 500,
  cursor: "pointer",
};

const clearButtonStyle: CSSProperties = {
  padding: "0.5rem 1rem",
  backgroundColor: "#f1f5f9",
  color: "#475569",
  border: "1px solid #cbd5e1",
  borderRadius: "0.375rem",
  fontSize: "0.875rem",
  cursor: "pointer",
};

const actionOptions = Object.entries(AUDIT_ACTIONS).map(([key, value]) => ({
  value,
  label: ACTION_LABELS[value] ?? key,
}));

/**
 * 監査ログ検索フォーム
 *
 * 期間指定・ユーザー名・操作種別・患者ID・IPアドレス・フリーワードの
 * 検索条件を入力して検索を実行する。
 */
export function AuditLogSearchForm({
  initialParams,
  onSearch,
  onClear,
}: AuditLogSearchFormProps) {
  const [startDate, setStartDate] = useState(initialParams?.startDate ?? "");
  const [endDate, setEndDate] = useState(initialParams?.endDate ?? "");
  const [username, setUsername] = useState(initialParams?.username ?? "");
  const [selectedActions, setSelectedActions] = useState<string[]>(
    initialParams?.actions ?? [],
  );
  const [patientId, setPatientId] = useState(initialParams?.patientId ?? "");
  const [ipAddress, setIpAddress] = useState(initialParams?.ipAddress ?? "");
  const [keyword, setKeyword] = useState(initialParams?.keyword ?? "");

  const handleActionToggle = useCallback((action: string) => {
    setSelectedActions((prev) =>
      prev.includes(action)
        ? prev.filter((a) => a !== action)
        : [...prev, action],
    );
  }, []);

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      const params: AuditLogSearchParams = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (username) params.username = username;
      if (selectedActions.length > 0) params.actions = selectedActions;
      if (patientId) params.patientId = patientId;
      if (ipAddress) params.ipAddress = ipAddress;
      if (keyword) params.keyword = keyword;
      onSearch(params);
    },
    [
      startDate,
      endDate,
      username,
      selectedActions,
      patientId,
      ipAddress,
      keyword,
      onSearch,
    ],
  );

  const handleClear = useCallback(() => {
    setStartDate("");
    setEndDate("");
    setUsername("");
    setSelectedActions([]);
    setPatientId("");
    setIpAddress("");
    setKeyword("");
    onClear();
  }, [onClear]);

  return (
    <form style={formStyle} onSubmit={handleSubmit} role="search">
      <div style={rowStyle}>
        <div style={fieldStyle}>
          <label style={labelStyle} htmlFor="audit-start-date">
            開始日時
          </label>
          <input
            id="audit-start-date"
            type="datetime-local"
            style={inputStyle}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle} htmlFor="audit-end-date">
            終了日時
          </label>
          <input
            id="audit-end-date"
            type="datetime-local"
            style={inputStyle}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle} htmlFor="audit-username">
            ユーザー名
          </label>
          <input
            id="audit-username"
            type="text"
            style={inputStyle}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="部分一致"
          />
        </div>
      </div>

      <div style={rowStyle}>
        <div style={fieldStyle}>
          <label style={labelStyle} htmlFor="audit-patient-id">
            患者ID
          </label>
          <input
            id="audit-patient-id"
            type="text"
            style={inputStyle}
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            placeholder="患者ID"
          />
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle} htmlFor="audit-ip-address">
            IPアドレス
          </label>
          <input
            id="audit-ip-address"
            type="text"
            style={inputStyle}
            value={ipAddress}
            onChange={(e) => setIpAddress(e.target.value)}
            placeholder="IPアドレス"
          />
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle} htmlFor="audit-keyword">
            フリーワード
          </label>
          <input
            id="audit-keyword"
            type="text"
            style={inputStyle}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="キーワード"
          />
        </div>
      </div>

      <div style={fieldStyle}>
        <span style={labelStyle}>操作種別</span>
        <div style={checkboxContainerStyle}>
          {actionOptions.map((option) => (
            <label key={option.value} style={checkboxLabelStyle}>
              <input
                type="checkbox"
                checked={selectedActions.includes(option.value)}
                onChange={() => handleActionToggle(option.value)}
              />
              {option.label}
            </label>
          ))}
        </div>
      </div>

      <div style={buttonRowStyle}>
        <button type="submit" style={searchButtonStyle}>
          検索
        </button>
        <button type="button" style={clearButtonStyle} onClick={handleClear}>
          条件クリア
        </button>
      </div>
    </form>
  );
}
