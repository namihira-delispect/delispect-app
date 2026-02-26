import type { CSSProperties } from "react";
import type { RiskAssessmentDisplay } from "../../types";
import { RISK_LEVEL_LABELS } from "../../types";
import {
  sectionCardStyle,
  sectionTitleStyle,
  tableStyle,
  thStyle,
  tdStyle,
  emptyStyle,
  getBadgeStyle,
} from "./sectionStyles";

export interface RiskAssessmentSectionProps {
  riskAssessments: RiskAssessmentDisplay[];
}

const riskLevelBadgeStyles: Record<string, CSSProperties> = {
  HIGH: getBadgeStyle("#fef2f2", "#dc2626"),
  MEDIUM: getBadgeStyle("#fffbeb", "#d97706"),
  LOW: getBadgeStyle("#f0fdf4", "#16a34a"),
};

/**
 * 日時をフォーマットする（YYYY/MM/DD HH:mm）
 */
function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${y}/${m}/${d} ${h}:${min}`;
}

/**
 * リスク要因をテキストに変換する
 */
function formatRiskFactors(riskFactors: Record<string, unknown>): string {
  const entries = Object.entries(riskFactors)
    .filter(([, value]) => value === true)
    .map(([key]) => key);

  if (entries.length === 0) {
    return "-";
  }
  return entries.join(", ");
}

/**
 * リスク評価情報セクション
 *
 * リスク評価結果、リスク要因、リスクスコア、評価日時を表示する。
 */
export function RiskAssessmentSection({ riskAssessments }: RiskAssessmentSectionProps) {
  return (
    <div style={sectionCardStyle}>
      <h2 style={sectionTitleStyle}>リスク評価情報</h2>
      {riskAssessments.length === 0 ? (
        <div style={emptyStyle}>リスク評価データがありません</div>
      ) : (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>評価結果</th>
              <th style={thStyle}>リスク要因</th>
              <th style={{ ...thStyle, textAlign: "right" }}>スコア</th>
              <th style={thStyle}>評価日時</th>
              <th style={thStyle}>評価者</th>
            </tr>
          </thead>
          <tbody>
            {riskAssessments.map((assessment, index) => (
              <tr key={index}>
                <td style={tdStyle}>
                  <span
                    style={
                      riskLevelBadgeStyles[assessment.riskLevel] ??
                      getBadgeStyle("#f1f5f9", "#64748b")
                    }
                  >
                    {RISK_LEVEL_LABELS[assessment.riskLevel as keyof typeof RISK_LEVEL_LABELS] ??
                      assessment.riskLevel}
                  </span>
                </td>
                <td style={{ ...tdStyle, maxWidth: "300px", wordBreak: "break-all" }}>
                  {formatRiskFactors(assessment.riskFactors)}
                </td>
                <td style={{ ...tdStyle, textAlign: "right" }}>
                  {assessment.riskScore != null ? assessment.riskScore.toFixed(2) : "-"}
                </td>
                <td style={tdStyle}>{formatDateTime(assessment.assessedAt)}</td>
                <td style={tdStyle}>{assessment.assessedBy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
