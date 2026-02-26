"use client";

import type { CSSProperties } from "react";
import type { ClinicalSummary } from "@/lib/research-log";

/** ケアプラン項目カテゴリのラベルマッピング */
const CATEGORY_LABELS: Record<string, string> = {
  MEDICATION: "薬剤",
  PAIN: "疼痛",
  DEHYDRATION: "脱水",
  CONSTIPATION: "便秘",
  INFLAMMATION: "炎症",
  MOBILITY: "離床",
  DEMENTIA: "認知症",
  SAFETY: "安全管理",
  SLEEP: "睡眠",
};

const cardStyle: CSSProperties = {
  border: "1px solid #e2e8f0",
  borderRadius: "0.5rem",
  padding: "1.5rem",
  backgroundColor: "#ffffff",
};

const titleStyle: CSSProperties = {
  fontSize: "1.125rem",
  fontWeight: 600,
  color: "#1e293b",
  marginBottom: "1rem",
  marginTop: 0,
};

const statGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(10rem, 1fr))",
  gap: "1rem",
  marginBottom: "1rem",
};

const statItemStyle: CSSProperties = {
  padding: "0.75rem",
  backgroundColor: "#f8fafc",
  borderRadius: "0.375rem",
};

const statLabelStyle: CSSProperties = {
  fontSize: "0.75rem",
  color: "#64748b",
  marginBottom: "0.25rem",
};

const statValueStyle: CSSProperties = {
  fontSize: "1.5rem",
  fontWeight: 700,
  color: "#1e293b",
};

const subTitleStyle: CSSProperties = {
  fontSize: "0.875rem",
  fontWeight: 600,
  color: "#475569",
  marginBottom: "0.5rem",
  marginTop: "0.5rem",
};

const itemRateGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(8rem, 1fr))",
  gap: "0.5rem",
};

const itemRateStyle: CSSProperties = {
  padding: "0.5rem",
  backgroundColor: "#f1f5f9",
  borderRadius: "0.25rem",
  textAlign: "center" as const,
};

const itemRateLabelStyle: CSSProperties = {
  fontSize: "0.75rem",
  color: "#64748b",
};

const itemRateValueStyle: CSSProperties = {
  fontSize: "1rem",
  fontWeight: 600,
  color: "#1e293b",
};

interface ClinicalSummaryCardProps {
  summary: ClinicalSummary;
}

export function ClinicalSummaryCard({ summary }: ClinicalSummaryCardProps) {
  return (
    <div style={cardStyle}>
      <h2 style={titleStyle}>臨床指標サマリー</h2>
      <div style={statGridStyle}>
        <div style={statItemStyle}>
          <div style={statLabelStyle}>リスク評価実施率</div>
          <div style={statValueStyle}>
            {(summary.riskAssessmentRate * 100).toFixed(1)}%
          </div>
        </div>
        <div style={statItemStyle}>
          <div style={statLabelStyle}>ケアプラン作成率</div>
          <div style={statValueStyle}>
            {(summary.carePlanCreationRate * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      <div style={subTitleStyle}>ケアプラン項目別作成実施率</div>
      <div style={itemRateGridStyle}>
        {Object.entries(summary.itemCreationRates).map(([key, rate]) => (
          <div key={key} style={itemRateStyle}>
            <div style={itemRateLabelStyle}>{CATEGORY_LABELS[key] ?? key}</div>
            <div style={itemRateValueStyle}>
              {(rate * 100).toFixed(1)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
