"use client";

import type { CSSProperties } from "react";
import type { RiskDrugMatch } from "../types";
import { RISK_DRUG_CATEGORIES, PRESCRIPTION_TYPE_LABELS } from "../types";

export interface RiskDrugListProps {
  /** リスク薬剤照合結果 */
  riskDrugMatches: RiskDrugMatch[];
}

const containerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
};

const emptyStyle: CSSProperties = {
  padding: "1.5rem",
  textAlign: "center",
  color: "#16a34a",
  backgroundColor: "#f0fdf4",
  borderRadius: "0.5rem",
  fontSize: "0.875rem",
};

const cardStyle: CSSProperties = {
  border: "1px solid #fecaca",
  borderRadius: "0.5rem",
  backgroundColor: "#fef2f2",
  overflow: "hidden",
};

const cardHeaderStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "0.75rem 1rem",
  backgroundColor: "#fee2e2",
  borderBottom: "1px solid #fecaca",
};

const drugNameStyle: CSSProperties = {
  fontSize: "0.875rem",
  fontWeight: 600,
  color: "#991b1b",
};

const categoryBadgeStyle: CSSProperties = {
  display: "inline-block",
  padding: "0.125rem 0.5rem",
  borderRadius: "9999px",
  fontSize: "0.75rem",
  fontWeight: 500,
  backgroundColor: "#fca5a5",
  color: "#7f1d1d",
};

const cardBodyStyle: CSSProperties = {
  padding: "0.75rem 1rem",
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
};

const warningStyle: CSSProperties = {
  fontSize: "0.8125rem",
  color: "#b91c1c",
  lineHeight: 1.5,
  padding: "0.5rem",
  backgroundColor: "#ffffff",
  borderRadius: "0.375rem",
  border: "1px solid #fecaca",
};

const prescriptionInfoStyle: CSSProperties = {
  display: "flex",
  gap: "1rem",
  fontSize: "0.75rem",
  color: "#6b7280",
};

/**
 * リスク薬剤一覧コンポーネント
 *
 * 処方されているリスク薬剤を一覧表示し、
 * 回避/調整メッセージを表示する。
 */
export function RiskDrugList({ riskDrugMatches }: RiskDrugListProps) {
  if (riskDrugMatches.length === 0) {
    return <div style={emptyStyle}>リスク薬剤は処方されていません</div>;
  }

  return (
    <div style={containerStyle}>
      {riskDrugMatches.map((match) => (
        <div key={match.prescription.id} style={cardStyle}>
          <div style={cardHeaderStyle}>
            <span style={drugNameStyle}>{match.prescription.drugName}</span>
            <span style={categoryBadgeStyle}>
              {RISK_DRUG_CATEGORIES[match.prescription.riskCategoryId!] ?? "リスク薬剤"}
            </span>
          </div>
          <div style={cardBodyStyle}>
            <div style={prescriptionInfoStyle}>
              <span>
                種別:{" "}
                {PRESCRIPTION_TYPE_LABELS[match.prescription.prescriptionType] ??
                  match.prescription.prescriptionType}
              </span>
              <span>コード: {match.prescription.yjCode ?? "未設定"}</span>
              <span>
                処方日: {new Date(match.prescription.prescribedAt).toLocaleDateString("ja-JP")}
              </span>
            </div>
            <div style={warningStyle}>{match.warningMessage}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
