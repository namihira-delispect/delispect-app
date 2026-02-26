"use client";

import type { CSSProperties } from "react";
import type { DehydrationAssessmentResult, DehydrationDetails } from "../types";
import {
  DEHYDRATION_QUESTIONS,
  DEHYDRATION_QUESTION_ORDER,
  VISUAL_CONDITION_LABELS,
  INTAKE_FREQUENCY_LABELS,
} from "../types";
import type { VisualCondition, IntakeFrequency } from "../types";

export interface DehydrationResultProps {
  /** アセスメント結果 */
  result: DehydrationAssessmentResult;
  /** アセスメント詳細 */
  details: DehydrationDetails;
  /** ケアプラン一覧に戻るコールバック */
  onBackToList: () => void;
}

const containerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "1.5rem",
};

const cardStyle: CSSProperties = {
  padding: "1.5rem",
  backgroundColor: "#ffffff",
  borderRadius: "0.5rem",
  border: "1px solid #e2e8f0",
};

const cardTitleStyle: CSSProperties = {
  fontSize: "1.125rem",
  fontWeight: 600,
  color: "#1e293b",
  marginBottom: "1rem",
};

function getRiskBadgeStyle(riskLevel: string): CSSProperties {
  const colorMap: Record<string, { bg: string; text: string }> = {
    HIGH: { bg: "#fef2f2", text: "#dc2626" },
    MODERATE: { bg: "#fffbeb", text: "#d97706" },
    LOW: { bg: "#ecfdf5", text: "#059669" },
    NONE: { bg: "#f0fdf4", text: "#16a34a" },
  };
  const colors = colorMap[riskLevel] ?? colorMap.NONE;
  return {
    display: "inline-block",
    padding: "0.375rem 1rem",
    borderRadius: "9999px",
    fontSize: "0.875rem",
    fontWeight: 600,
    backgroundColor: colors.bg,
    color: colors.text,
  };
}

const proposalListStyle: CSSProperties = {
  listStyle: "none",
  padding: 0,
  margin: 0,
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem",
};

const proposalItemStyle: CSSProperties = {
  padding: "0.75rem 1rem",
  backgroundColor: "#f8fafc",
  borderRadius: "0.375rem",
  borderLeft: "4px solid #3b82f6",
  fontSize: "0.875rem",
  color: "#1e293b",
};

const summaryTableStyle: CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
};

const summaryThStyle: CSSProperties = {
  padding: "0.5rem 0.75rem",
  textAlign: "left",
  fontSize: "0.75rem",
  color: "#64748b",
  fontWeight: 500,
  borderBottom: "1px solid #e2e8f0",
};

const summaryTdStyle: CSSProperties = {
  padding: "0.5rem 0.75rem",
  fontSize: "0.875rem",
  color: "#1e293b",
  borderBottom: "1px solid #e2e8f0",
};

const backButtonStyle: CSSProperties = {
  padding: "0.5rem 1.5rem",
  backgroundColor: "#3b82f6",
  color: "#ffffff",
  border: "none",
  borderRadius: "0.375rem",
  fontSize: "0.875rem",
  fontWeight: 500,
  cursor: "pointer",
};

/**
 * 質問IDに対応する回答値をテキスト表示用に変換する
 */
function getAnswerDisplay(questionId: string, details: DehydrationDetails): string {
  switch (questionId) {
    case "lab_ht":
      return details.labHt?.value !== null && details.labHt?.value !== undefined
        ? `${details.labHt.value}${details.labHt.unit ? ` ${details.labHt.unit}` : ""}`
        : "データなし";
    case "lab_hb":
      return details.labHb?.value !== null && details.labHb?.value !== undefined
        ? `${details.labHb.value}${details.labHb.unit ? ` ${details.labHb.unit}` : ""}`
        : "データなし";
    case "vital_pulse":
      return details.vitalPulse !== null ? `${details.vitalPulse} bpm` : "未入力";
    case "vital_bp":
      if (details.vitalSystolicBp !== null && details.vitalDiastolicBp !== null) {
        return `${details.vitalSystolicBp}/${details.vitalDiastolicBp} mmHg`;
      }
      return "未入力";
    case "visual_skin":
      return details.visualSkin
        ? VISUAL_CONDITION_LABELS[details.visualSkin as VisualCondition]
        : "未選択";
    case "visual_oral":
      return details.visualOral
        ? VISUAL_CONDITION_LABELS[details.visualOral as VisualCondition]
        : "未選択";
    case "visual_dizziness":
      return details.visualDizziness
        ? VISUAL_CONDITION_LABELS[details.visualDizziness as VisualCondition]
        : "未選択";
    case "visual_urine":
      return details.visualUrine
        ? VISUAL_CONDITION_LABELS[details.visualUrine as VisualCondition]
        : "未選択";
    case "intake_frequency":
      return details.intakeFrequency
        ? INTAKE_FREQUENCY_LABELS[details.intakeFrequency as IntakeFrequency]
        : "未選択";
    case "intake_amount":
      return details.intakeAmount !== null ? `${details.intakeAmount} ml` : "未入力";
    default:
      return "―";
  }
}

/**
 * 脱水アセスメント結果表示コンポーネント
 *
 * アセスメント結果のリスクレベル、対処提案、入力サマリーを表示する。
 */
export function DehydrationResult({ result, details, onBackToList }: DehydrationResultProps) {
  return (
    <div style={containerStyle}>
      {/* リスクレベル表示 */}
      <div style={cardStyle}>
        <h3 style={cardTitleStyle}>脱水評価結果</h3>
        <span style={getRiskBadgeStyle(result.riskLevel)}>{result.riskLevelLabel}</span>
      </div>

      {/* 対処提案 */}
      <div style={cardStyle}>
        <h3 style={cardTitleStyle}>対処提案</h3>
        {result.proposals.length === 0 ? (
          <p style={{ fontSize: "0.875rem", color: "#64748b" }}>
            現時点で特別な対処は不要です。引き続き水分摂取の状況を観察してください。
          </p>
        ) : (
          <ul style={proposalListStyle}>
            {result.proposals.map((proposal) => (
              <li key={proposal.id} style={proposalItemStyle}>
                {proposal.message}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 入力サマリー */}
      <div style={cardStyle}>
        <h3 style={cardTitleStyle}>入力内容サマリー</h3>
        <table style={summaryTableStyle}>
          <thead>
            <tr>
              <th style={summaryThStyle}>項目</th>
              <th style={summaryThStyle}>回答</th>
            </tr>
          </thead>
          <tbody>
            {DEHYDRATION_QUESTION_ORDER.map((qId) => (
              <tr key={qId}>
                <td style={summaryTdStyle}>{DEHYDRATION_QUESTIONS[qId].title}</td>
                <td style={summaryTdStyle}>{getAnswerDisplay(qId, details)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 戻るボタン */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <button type="button" onClick={onBackToList} style={backButtonStyle}>
          ケアプラン一覧に戻る
        </button>
      </div>
    </div>
  );
}
