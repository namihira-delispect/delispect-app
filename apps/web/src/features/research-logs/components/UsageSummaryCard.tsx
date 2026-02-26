"use client";

import type { CSSProperties } from "react";
import type { UsageSummary } from "@/lib/research-log";

/** 機能名ラベルマッピング */
const FEATURE_LABELS: Record<string, string> = {
  EMR_SYNC_COMPLETE: "電子カルテ同期",
  RISK_ASSESSMENT_COMPLETE: "リスク評価",
  CARE_PLAN_COMPLETE: "ケアプラン作成",
  HIGH_RISK_KASAN_ASSESS: "ハイリスクケア加算判定",
  NURSING_TRANSCRIPTION: "看護記録転記",
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

interface UsageSummaryCardProps {
  summary: UsageSummary;
}

export function UsageSummaryCard({ summary }: UsageSummaryCardProps) {
  return (
    <div style={cardStyle}>
      <h2 style={titleStyle}>利用状況サマリー</h2>
      <div style={statGridStyle}>
        <div style={statItemStyle}>
          <div style={statLabelStyle}>ログイン数</div>
          <div style={statValueStyle}>{summary.loginCount}</div>
        </div>
        <div style={statItemStyle}>
          <div style={statLabelStyle}>ケアプラン完了率</div>
          <div style={statValueStyle}>
            {(summary.carePlanCompletionRate * 100).toFixed(1)}%
          </div>
        </div>
        {Object.entries(summary.featureUsage).map(([key, count]) => (
          <div key={key} style={statItemStyle}>
            <div style={statLabelStyle}>{FEATURE_LABELS[key] ?? key}</div>
            <div style={statValueStyle}>{count}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
