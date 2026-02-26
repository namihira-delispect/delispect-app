"use client";

import type { CSSProperties } from "react";
import type { LabResultEntry, DeviationStatus } from "../types";

export interface LabResultsStepProps {
  labResults: LabResultEntry[];
  onNext: () => void;
}

const containerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
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
  marginBottom: "1rem",
};

const tableStyle: CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  border: "1px solid #e2e8f0",
  borderRadius: "0.5rem",
  overflow: "hidden",
};

const thStyle: CSSProperties = {
  padding: "0.75rem 1rem",
  backgroundColor: "#f8fafc",
  fontSize: "0.8125rem",
  fontWeight: 600,
  color: "#475569",
  textAlign: "left",
  borderBottom: "1px solid #e2e8f0",
};

const tdStyle: CSSProperties = {
  padding: "0.75rem 1rem",
  fontSize: "0.875rem",
  color: "#1e293b",
  borderBottom: "1px solid #e2e8f0",
};

const noDataStyle: CSSProperties = {
  textAlign: "center",
  padding: "2rem",
  color: "#94a3b8",
  fontSize: "0.875rem",
};

const buttonContainerStyle: CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  marginTop: "1rem",
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
};

function getDeviationBadgeStyle(status: DeviationStatus): CSSProperties {
  const colorMap: Record<DeviationStatus, { bg: string; text: string }> = {
    NORMAL: { bg: "#f0fdf4", text: "#16a34a" },
    HIGH: { bg: "#fef2f2", text: "#dc2626" },
    LOW: { bg: "#fffbeb", text: "#d97706" },
  };
  const colors = colorMap[status];
  return {
    display: "inline-block",
    padding: "0.125rem 0.5rem",
    borderRadius: "9999px",
    fontSize: "0.75rem",
    fontWeight: 600,
    backgroundColor: colors.bg,
    color: colors.text,
  };
}

const DEVIATION_LABELS: Record<DeviationStatus, string> = {
  NORMAL: "正常",
  HIGH: "高値",
  LOW: "低値",
};

function formatReferenceRange(lower: number | null, upper: number | null): string {
  if (lower !== null && upper !== null) {
    return `${lower} - ${upper}`;
  }
  if (lower !== null) {
    return `${lower} 以上`;
  }
  if (upper !== null) {
    return `${upper} 以下`;
  }
  return "-";
}

function formatDate(isoString: string | null): string {
  if (!isoString) return "-";
  const date = new Date(isoString);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${y}/${m}/${d} ${h}:${min}`;
}

/**
 * 採血結果確認ステップ
 *
 * CRP/WBCの採血結果を基準値と比較して表示する。
 * 逸脱している場合はバッジで視覚的に示す。
 */
export function LabResultsStep({ labResults, onNext }: LabResultsStepProps) {
  const hasData = labResults.some((r) => r.value !== null);

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>採血結果の確認</h2>
      <p style={descriptionStyle}>
        CRP・WBCの値を確認します。基準値と比較して逸脱がないか確認してください。
      </p>

      {!hasData ? (
        <div style={noDataStyle}>
          採血結果が取得されていません。電子カルテとの同期を確認してください。
        </div>
      ) : (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>項目</th>
              <th style={thStyle}>測定値</th>
              <th style={thStyle}>単位</th>
              <th style={thStyle}>基準値</th>
              <th style={thStyle}>判定</th>
              <th style={thStyle}>測定日時</th>
            </tr>
          </thead>
          <tbody>
            {labResults.map((result) => (
              <tr key={result.itemCode}>
                <td style={tdStyle}>{result.itemName}</td>
                <td style={{ ...tdStyle, fontWeight: 600 }}>
                  {result.value !== null ? result.value : "-"}
                </td>
                <td style={tdStyle}>{result.unit}</td>
                <td style={tdStyle}>
                  {formatReferenceRange(result.lowerLimit, result.upperLimit)}
                </td>
                <td style={tdStyle}>
                  {result.deviationStatus ? (
                    <span style={getDeviationBadgeStyle(result.deviationStatus)}>
                      {DEVIATION_LABELS[result.deviationStatus]}
                    </span>
                  ) : (
                    "-"
                  )}
                </td>
                <td style={{ ...tdStyle, fontSize: "0.75rem", color: "#64748b" }}>
                  {formatDate(result.measuredAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div style={buttonContainerStyle}>
        <button onClick={onNext} style={nextButtonStyle}>
          次へ
        </button>
      </div>
    </div>
  );
}
