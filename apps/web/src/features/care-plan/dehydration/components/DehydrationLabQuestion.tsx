"use client";

import type { CSSProperties } from "react";
import type { LabValueAnswer } from "../types";

export interface DehydrationLabQuestionProps {
  /** 質問タイトル */
  title: string;
  /** 質問説明文 */
  description: string;
  /** 採血結果データ */
  labValue: LabValueAnswer | null;
  /** 次へ進むコールバック */
  onNext: () => void;
  /** 戻るコールバック */
  onBack: (() => void) | null;
}

const containerStyle: CSSProperties = {
  padding: "1.5rem",
  backgroundColor: "#ffffff",
  borderRadius: "0.5rem",
  border: "1px solid #e2e8f0",
};

const titleStyle: CSSProperties = {
  fontSize: "1.125rem",
  fontWeight: 600,
  color: "#1e293b",
  marginBottom: "0.5rem",
};

const descriptionStyle: CSSProperties = {
  fontSize: "0.875rem",
  color: "#64748b",
  marginBottom: "1.5rem",
};

const valueContainerStyle: CSSProperties = {
  padding: "1rem",
  backgroundColor: "#f8fafc",
  borderRadius: "0.375rem",
  marginBottom: "1.5rem",
};

const valueLabelStyle: CSSProperties = {
  fontSize: "0.875rem",
  color: "#475569",
  marginBottom: "0.25rem",
};

const valueTextStyle: CSSProperties = {
  fontSize: "1.5rem",
  fontWeight: 700,
  color: "#1e293b",
};

const referenceStyle: CSSProperties = {
  fontSize: "0.75rem",
  color: "#64748b",
  marginTop: "0.5rem",
};

function getDeviationStyle(status: string): CSSProperties {
  const styleMap: Record<string, { bg: string; text: string; border: string }> = {
    NORMAL: { bg: "#f0fdf4", text: "#16a34a", border: "#bbf7d0" },
    HIGH: { bg: "#fef2f2", text: "#dc2626", border: "#fecaca" },
    LOW: { bg: "#fef9c3", text: "#ca8a04", border: "#fde68a" },
    NO_DATA: { bg: "#f1f5f9", text: "#64748b", border: "#e2e8f0" },
  };
  const colors = styleMap[status] ?? styleMap.NO_DATA;
  return {
    display: "inline-block",
    padding: "0.25rem 0.75rem",
    borderRadius: "9999px",
    fontSize: "0.75rem",
    fontWeight: 600,
    backgroundColor: colors.bg,
    color: colors.text,
    border: `1px solid ${colors.border}`,
    marginLeft: "0.75rem",
  };
}

const deviationLabels: Record<string, string> = {
  NORMAL: "基準値内",
  HIGH: "基準値超過",
  LOW: "基準値未満",
  NO_DATA: "データなし",
};

const buttonGroupStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: "0.75rem",
};

const backButtonStyle: CSSProperties = {
  padding: "0.5rem 1.5rem",
  backgroundColor: "#f1f5f9",
  color: "#475569",
  border: "1px solid #e2e8f0",
  borderRadius: "0.375rem",
  fontSize: "0.875rem",
  fontWeight: 500,
  cursor: "pointer",
};

const nextButtonStyle: CSSProperties = {
  padding: "0.5rem 1.5rem",
  backgroundColor: "#3b82f6",
  color: "#ffffff",
  border: "none",
  borderRadius: "0.375rem",
  fontSize: "0.875rem",
  fontWeight: 500,
  cursor: "pointer",
  marginLeft: "auto",
};

/**
 * 採血結果確認コンポーネント
 *
 * Ht/Hb の採血結果を基準値と共に表示し、逸脱判定を行う。
 */
export function DehydrationLabQuestion({
  title,
  description,
  labValue,
  onNext,
  onBack,
}: DehydrationLabQuestionProps) {
  return (
    <div style={containerStyle}>
      <h3 style={titleStyle}>{title}</h3>
      <p style={descriptionStyle}>{description}</p>

      <div style={valueContainerStyle}>
        <div style={valueLabelStyle}>検査値</div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={valueTextStyle}>
            {labValue?.value !== null && labValue?.value !== undefined
              ? `${labValue.value}${labValue.unit ? ` ${labValue.unit}` : ""}`
              : "データなし"}
          </span>
          {labValue && (
            <span style={getDeviationStyle(labValue.deviationStatus)}>
              {deviationLabels[labValue.deviationStatus] ?? labValue.deviationStatus}
            </span>
          )}
        </div>
        {labValue && (labValue.lowerLimit !== null || labValue.upperLimit !== null) && (
          <div style={referenceStyle}>
            基準値: {labValue.lowerLimit ?? "―"} ~ {labValue.upperLimit ?? "―"}
            {labValue.unit ? ` ${labValue.unit}` : ""}
          </div>
        )}
      </div>

      <div style={buttonGroupStyle}>
        {onBack && (
          <button type="button" onClick={onBack} style={backButtonStyle}>
            戻る
          </button>
        )}
        <button type="button" onClick={onNext} style={nextButtonStyle}>
          次へ
        </button>
      </div>
    </div>
  );
}
