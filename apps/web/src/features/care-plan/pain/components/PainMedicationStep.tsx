"use client";

import type { CSSProperties } from "react";
import type { PainMedicationInfo } from "../types";

export interface PainMedicationStepProps {
  /** 痛み止め処方一覧 */
  medications: PainMedicationInfo[];
}

const containerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
};

const titleStyle: CSSProperties = {
  fontSize: "1rem",
  fontWeight: 600,
  color: "#1e293b",
  marginBottom: "0.5rem",
};

const emptyStyle: CSSProperties = {
  padding: "1.5rem",
  backgroundColor: "#f8fafc",
  borderRadius: "0.5rem",
  textAlign: "center",
  color: "#64748b",
  fontSize: "0.875rem",
};

const listStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
};

const medicationCardStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "0.75rem 1rem",
  backgroundColor: "#f8fafc",
  borderRadius: "0.375rem",
  border: "1px solid #e2e8f0",
};

const drugNameStyle: CSSProperties = {
  fontSize: "0.875rem",
  fontWeight: 500,
  color: "#1e293b",
};

const metaStyle: CSSProperties = {
  display: "flex",
  gap: "0.75rem",
  fontSize: "0.75rem",
  color: "#64748b",
};

const prescriptionTypeLabels: Record<string, string> = {
  ORAL: "内服",
  INJECTION: "注射",
  EXTERNAL: "外用",
};

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}/${m}/${d}`;
}

/**
 * 痛み止め処方表示ステップ
 *
 * 現在処方されている痛み止めの一覧を表示する。
 */
export function PainMedicationStep({ medications }: PainMedicationStepProps) {
  return (
    <div style={containerStyle}>
      <h3 style={titleStyle}>痛み止めの処方状況</h3>
      {medications.length === 0 ? (
        <div style={emptyStyle}>
          <p>現在、痛み止めの処方はありません</p>
        </div>
      ) : (
        <div style={listStyle}>
          {medications.map((med) => (
            <div key={med.id} style={medicationCardStyle}>
              <span style={drugNameStyle}>{med.drugName}</span>
              <div style={metaStyle}>
                <span>{prescriptionTypeLabels[med.prescriptionType] ?? med.prescriptionType}</span>
                <span>{formatDate(med.prescribedAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
