"use client";

import { useState, useCallback, type CSSProperties, type FormEvent } from "react";
import type { AdmissionSearchParams, RiskLevelDisplay, CareStatusDisplay } from "../types";
import { RISK_LEVEL_OPTIONS, CARE_STATUS_OPTIONS } from "../types";

export interface AdmissionSearchFormProps {
  /** 初期検索条件 */
  initialParams: AdmissionSearchParams;
  /** 検索実行コールバック */
  onSearch: (params: AdmissionSearchParams) => void;
  /** クリアコールバック */
  onClear: () => void;
}

const formStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem",
  padding: "1rem",
  backgroundColor: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "0.5rem",
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
  minWidth: "10rem",
};

const labelStyle: CSSProperties = {
  fontSize: "0.8125rem",
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

const selectStyle: CSSProperties = {
  padding: "0.375rem 0.5rem",
  border: "1px solid #cbd5e1",
  borderRadius: "0.375rem",
  fontSize: "0.875rem",
  color: "#1e293b",
  backgroundColor: "#ffffff",
};

const buttonGroupStyle: CSSProperties = {
  display: "flex",
  gap: "0.5rem",
  alignItems: "flex-end",
};

const searchButtonStyle: CSSProperties = {
  padding: "0.5rem 1rem",
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

/**
 * 入院日のデフォルト値を取得する（操作日の2日前）
 */
function getDefaultAdmissionDateFrom(): string {
  const date = new Date();
  date.setDate(date.getDate() - 2);
  return date.toISOString().split("T")[0];
}

/**
 * 入院日のデフォルト値を取得する（操作日）
 */
function getDefaultAdmissionDateTo(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * 患者入院一覧検索フォームコンポーネント
 *
 * リスク評価、ケア実施状況、入院日、評価日、名前でのフィルタリングを提供する。
 */
export function AdmissionSearchForm({
  initialParams,
  onSearch,
  onClear,
}: AdmissionSearchFormProps) {
  const [riskLevel, setRiskLevel] = useState<RiskLevelDisplay | "">(initialParams.riskLevel ?? "");
  const [careStatus, setCareStatus] = useState<CareStatusDisplay | "">(
    initialParams.careStatus ?? "",
  );
  const [admissionDateFrom, setAdmissionDateFrom] = useState(
    initialParams.admissionDateFrom ?? getDefaultAdmissionDateFrom(),
  );
  const [admissionDateTo, setAdmissionDateTo] = useState(
    initialParams.admissionDateTo ?? getDefaultAdmissionDateTo(),
  );
  const [assessmentDateFrom, setAssessmentDateFrom] = useState(
    initialParams.assessmentDateFrom ?? "",
  );
  const [assessmentDateTo, setAssessmentDateTo] = useState(initialParams.assessmentDateTo ?? "");
  const [name, setName] = useState(initialParams.name ?? "");

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      const params: AdmissionSearchParams = {};
      if (riskLevel) params.riskLevel = riskLevel as RiskLevelDisplay;
      if (careStatus) params.careStatus = careStatus as CareStatusDisplay;
      if (admissionDateFrom) params.admissionDateFrom = admissionDateFrom;
      if (admissionDateTo) params.admissionDateTo = admissionDateTo;
      if (assessmentDateFrom) params.assessmentDateFrom = assessmentDateFrom;
      if (assessmentDateTo) params.assessmentDateTo = assessmentDateTo;
      if (name) params.name = name;
      onSearch(params);
    },
    [
      riskLevel,
      careStatus,
      admissionDateFrom,
      admissionDateTo,
      assessmentDateFrom,
      assessmentDateTo,
      name,
      onSearch,
    ],
  );

  const handleClear = useCallback(() => {
    setRiskLevel("");
    setCareStatus("");
    setAdmissionDateFrom(getDefaultAdmissionDateFrom());
    setAdmissionDateTo(getDefaultAdmissionDateTo());
    setAssessmentDateFrom("");
    setAssessmentDateTo("");
    setName("");
    onClear();
  }, [onClear]);

  return (
    <form style={formStyle} onSubmit={handleSubmit} aria-label="検索フォーム">
      <div style={rowStyle}>
        <div style={fieldStyle}>
          <label style={labelStyle} htmlFor="search-risk-level">
            リスク評価
          </label>
          <select
            id="search-risk-level"
            style={selectStyle}
            value={riskLevel}
            onChange={(e) => setRiskLevel(e.target.value as RiskLevelDisplay | "")}
          >
            <option value="">すべて</option>
            {RISK_LEVEL_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle} htmlFor="search-care-status">
            ケア実施状況
          </label>
          <select
            id="search-care-status"
            style={selectStyle}
            value={careStatus}
            onChange={(e) => setCareStatus(e.target.value as CareStatusDisplay | "")}
          >
            <option value="">すべて</option>
            {CARE_STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle} htmlFor="search-name">
            名前
          </label>
          <input
            id="search-name"
            type="text"
            style={inputStyle}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="氏名で検索"
            maxLength={100}
          />
        </div>
      </div>

      <div style={rowStyle}>
        <div style={fieldStyle}>
          <label style={labelStyle} htmlFor="search-admission-from">
            入院日（開始）
          </label>
          <input
            id="search-admission-from"
            type="date"
            style={inputStyle}
            value={admissionDateFrom}
            onChange={(e) => setAdmissionDateFrom(e.target.value)}
          />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle} htmlFor="search-admission-to">
            入院日（終了）
          </label>
          <input
            id="search-admission-to"
            type="date"
            style={inputStyle}
            value={admissionDateTo}
            onChange={(e) => setAdmissionDateTo(e.target.value)}
          />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle} htmlFor="search-assessment-from">
            評価日（開始）
          </label>
          <input
            id="search-assessment-from"
            type="date"
            style={inputStyle}
            value={assessmentDateFrom}
            onChange={(e) => setAssessmentDateFrom(e.target.value)}
          />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle} htmlFor="search-assessment-to">
            評価日（終了）
          </label>
          <input
            id="search-assessment-to"
            type="date"
            style={inputStyle}
            value={assessmentDateTo}
            onChange={(e) => setAssessmentDateTo(e.target.value)}
          />
        </div>

        <div style={buttonGroupStyle}>
          <button type="submit" style={searchButtonStyle}>
            検索
          </button>
          <button type="button" style={clearButtonStyle} onClick={handleClear}>
            クリア
          </button>
        </div>
      </div>
    </form>
  );
}
