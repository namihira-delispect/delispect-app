"use client";

import type { CSSProperties } from "react";
import type { ConstipationDetails } from "../types";
import {
  CONSTIPATION_SEVERITY_LABELS,
  BRISTOL_SCALE_SHORT_LABELS,
  MEAL_AMOUNT_LABELS,
} from "../types";

export interface ConstipationResultViewProps {
  details: ConstipationDetails;
  admissionId: number;
}

const containerStyle: CSSProperties = {
  maxWidth: "640px",
  margin: "0 auto",
};

const cardStyle: CSSProperties = {
  border: "1px solid #e2e8f0",
  borderRadius: "0.5rem",
  backgroundColor: "#ffffff",
  padding: "1.5rem",
  marginBottom: "1rem",
};

const titleStyle: CSSProperties = {
  fontSize: "1.125rem",
  fontWeight: 600,
  color: "#1e293b",
  marginBottom: "1rem",
};

const sectionStyle: CSSProperties = {
  marginBottom: "1.5rem",
};

const sectionTitleStyle: CSSProperties = {
  fontSize: "0.9375rem",
  fontWeight: 600,
  color: "#1e293b",
  marginBottom: "0.75rem",
  paddingBottom: "0.375rem",
  borderBottom: "1px solid #e2e8f0",
};

const rowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  padding: "0.375rem 0",
  fontSize: "0.875rem",
};

const itemLabelStyle: CSSProperties = {
  color: "#64748b",
};

const itemValueStyle: CSSProperties = {
  color: "#1e293b",
  fontWeight: 500,
};

function getSeverityBadgeStyle(severity: string): CSSProperties {
  const colorMap: Record<string, { bg: string; text: string }> = {
    NONE: { bg: "#f0fdf4", text: "#16a34a" },
    MILD: { bg: "#fffbeb", text: "#d97706" },
    MODERATE: { bg: "#fff7ed", text: "#ea580c" },
    SEVERE: { bg: "#fef2f2", text: "#dc2626" },
  };
  const colors = colorMap[severity] ?? { bg: "#f1f5f9", text: "#64748b" };
  return {
    display: "inline-block",
    padding: "0.25rem 0.75rem",
    borderRadius: "9999px",
    fontSize: "0.8125rem",
    fontWeight: 600,
    backgroundColor: colors.bg,
    color: colors.text,
  };
}

const suggestionListStyle: CSSProperties = {
  listStyle: "none",
  padding: 0,
  margin: 0,
};

const suggestionItemStyle: CSSProperties = {
  padding: "0.5rem 0",
  fontSize: "0.875rem",
  color: "#374151",
  borderBottom: "1px solid #f1f5f9",
  paddingLeft: "1.25rem",
  position: "relative",
};

const backLinkStyle: CSSProperties = {
  display: "inline-block",
  fontSize: "0.8125rem",
  color: "#3b82f6",
  textDecoration: "none",
  padding: "0.5rem 1rem",
  border: "1px solid #3b82f6",
  borderRadius: "0.375rem",
  marginTop: "1rem",
};

/**
 * 便秘アセスメント結果表示コンポーネント
 *
 * 保存済みの便秘アセスメントデータと対処提案を表示する。
 */
export function ConstipationResultView({ details, admissionId }: ConstipationResultViewProps) {
  const { assessment, suggestion } = details;

  return (
    <div style={containerStyle}>
      {/* 重症度と対処提案 */}
      <div style={cardStyle}>
        <h3 style={titleStyle}>便秘の対処提案</h3>
        <div style={{ marginBottom: "1rem" }}>
          <span style={{ fontSize: "0.875rem", color: "#64748b", marginRight: "0.5rem" }}>
            重症度:
          </span>
          <span style={getSeverityBadgeStyle(suggestion.severity)}>
            {CONSTIPATION_SEVERITY_LABELS[suggestion.severity]}
          </span>
        </div>

        <ul style={suggestionListStyle}>
          {suggestion.suggestions.map((text, index) => (
            <li key={index} style={suggestionItemStyle}>
              <span style={{ position: "absolute", left: 0, color: "#3b82f6" }}>-</span>
              {text}
            </li>
          ))}
        </ul>
      </div>

      {/* 入力データの表示 */}
      <div style={cardStyle}>
        <h3 style={titleStyle}>入力内容</h3>

        <div style={sectionStyle}>
          <h4 style={sectionTitleStyle}>排便状況</h4>
          <div style={rowStyle}>
            <span style={itemLabelStyle}>便が出ていない日数</span>
            <span style={itemValueStyle}>{assessment.daysWithoutBowelMovement}日</span>
          </div>
          <div style={rowStyle}>
            <span style={itemLabelStyle}>便の性状</span>
            <span style={itemValueStyle}>
              {assessment.bristolScale !== null
                ? `タイプ${assessment.bristolScale}: ${BRISTOL_SCALE_SHORT_LABELS[assessment.bristolScale]}`
                : "該当なし"}
            </span>
          </div>
        </div>

        <div style={sectionStyle}>
          <h4 style={sectionTitleStyle}>体調面</h4>
          <div style={rowStyle}>
            <span style={itemLabelStyle}>吐き気、気分の悪さ</span>
            <span style={itemValueStyle}>{assessment.hasNausea ? "あり" : "なし"}</span>
          </div>
          <div style={rowStyle}>
            <span style={itemLabelStyle}>お腹の張り</span>
            <span style={itemValueStyle}>
              {assessment.hasAbdominalDistension ? "あり" : "なし"}
            </span>
          </div>
        </div>

        <div style={sectionStyle}>
          <h4 style={sectionTitleStyle}>食事</h4>
          <div style={rowStyle}>
            <span style={itemLabelStyle}>食欲</span>
            <span style={itemValueStyle}>{assessment.hasAppetite ? "あり" : "なし"}</span>
          </div>
          <div style={rowStyle}>
            <span style={itemLabelStyle}>一度の食事量</span>
            <span style={itemValueStyle}>{MEAL_AMOUNT_LABELS[assessment.mealAmount]}</span>
          </div>
        </div>

        <div style={sectionStyle}>
          <h4 style={sectionTitleStyle}>腸の状態</h4>
          <div style={rowStyle}>
            <span style={itemLabelStyle}>腸蠕動音</span>
            <span style={itemValueStyle}>
              {assessment.hasBowelSounds ? "聴取あり" : "聴取なし"}
            </span>
          </div>
          <div style={rowStyle}>
            <span style={itemLabelStyle}>腸内ガス</span>
            <span style={itemValueStyle}>{assessment.hasIntestinalGas ? "あり" : "なし"}</span>
          </div>
          <div style={rowStyle}>
            <span style={itemLabelStyle}>触診による便塊</span>
            <span style={itemValueStyle}>{assessment.hasFecalMass ? "あり" : "なし"}</span>
          </div>
        </div>
      </div>

      <a href={`/admissions/${admissionId}/care-plan`} style={backLinkStyle}>
        ケアプラン一覧に戻る
      </a>
    </div>
  );
}
