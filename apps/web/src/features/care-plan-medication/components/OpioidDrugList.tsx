"use client";

import type { CSSProperties } from "react";
import type { PrescriptionEntry } from "../types";
import { PRESCRIPTION_TYPE_LABELS } from "../types";

export interface OpioidDrugListProps {
  /** オピオイド薬剤一覧 */
  opioidDrugs: PrescriptionEntry[];
}

const containerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem",
};

const emptyStyle: CSSProperties = {
  padding: "1.5rem",
  textAlign: "center",
  color: "#16a34a",
  backgroundColor: "#f0fdf4",
  borderRadius: "0.5rem",
  fontSize: "0.875rem",
};

const headerNoteStyle: CSSProperties = {
  padding: "0.75rem 1rem",
  backgroundColor: "#fefce8",
  borderRadius: "0.5rem",
  border: "1px solid #fde68a",
  fontSize: "0.8125rem",
  color: "#92400e",
  lineHeight: 1.5,
};

const cardStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "0.75rem 1rem",
  border: "1px solid #fde68a",
  borderRadius: "0.5rem",
  backgroundColor: "#fffbeb",
};

const drugInfoStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.25rem",
};

const drugNameStyle: CSSProperties = {
  fontSize: "0.875rem",
  fontWeight: 600,
  color: "#92400e",
};

const drugMetaStyle: CSSProperties = {
  display: "flex",
  gap: "1rem",
  fontSize: "0.75rem",
  color: "#a16207",
};

const opioidBadgeStyle: CSSProperties = {
  display: "inline-block",
  padding: "0.25rem 0.75rem",
  borderRadius: "9999px",
  fontSize: "0.75rem",
  fontWeight: 600,
  backgroundColor: "#fbbf24",
  color: "#78350f",
};

/**
 * オピオイド薬剤一覧コンポーネント
 *
 * 本システムで麻薬として取り扱うオピオイド薬剤を一覧表示する。
 */
export function OpioidDrugList({ opioidDrugs }: OpioidDrugListProps) {
  if (opioidDrugs.length === 0) {
    return <div style={emptyStyle}>オピオイド薬剤は処方されていません</div>;
  }

  return (
    <div style={containerStyle}>
      <div style={headerNoteStyle}>
        オピオイド薬剤は本システム上で麻薬として取り扱います。投与量の管理に注意してください。
      </div>
      {opioidDrugs.map((drug) => (
        <div key={drug.id} style={cardStyle}>
          <div style={drugInfoStyle}>
            <span style={drugNameStyle}>{drug.drugName}</span>
            <div style={drugMetaStyle}>
              <span>
                種別: {PRESCRIPTION_TYPE_LABELS[drug.prescriptionType] ?? drug.prescriptionType}
              </span>
              <span>コード: {drug.yjCode ?? "未設定"}</span>
              <span>処方日: {new Date(drug.prescribedAt).toLocaleDateString("ja-JP")}</span>
            </div>
          </div>
          <span style={opioidBadgeStyle}>麻薬</span>
        </div>
      ))}
    </div>
  );
}
