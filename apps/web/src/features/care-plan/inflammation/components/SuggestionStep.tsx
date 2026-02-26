"use client";

import type { CSSProperties } from "react";
import type { InflammationSuggestion } from "../types";

export interface SuggestionStepProps {
  suggestions: InflammationSuggestion[];
  shouldNavigateToPain: boolean;
  admissionId: number;
  onBack: () => void;
  onComplete: () => void;
  isCompleting: boolean;
  isCompleted: boolean;
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

const suggestionListStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem",
};

function getSuggestionCardStyle(category: string): CSSProperties {
  const colorMap: Record<string, { border: string; bg: string }> = {
    inflammation: { border: "#fca5a5", bg: "#fef2f2" },
    fever: { border: "#fdba74", bg: "#fff7ed" },
    pain: { border: "#93c5fd", bg: "#eff6ff" },
  };
  const colors = colorMap[category] ?? { border: "#e2e8f0", bg: "#f8fafc" };
  return {
    border: `1px solid ${colors.border}`,
    borderRadius: "0.5rem",
    padding: "1rem",
    backgroundColor: colors.bg,
  };
}

const suggestionCategoryStyle: CSSProperties = {
  fontSize: "0.75rem",
  fontWeight: 600,
  color: "#475569",
  textTransform: "uppercase",
  marginBottom: "0.25rem",
};

const suggestionMessageStyle: CSSProperties = {
  fontSize: "0.875rem",
  color: "#1e293b",
  lineHeight: 1.6,
};

const painNavigationStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  padding: "1rem",
  backgroundColor: "#eff6ff",
  border: "1px solid #93c5fd",
  borderRadius: "0.5rem",
  marginTop: "0.5rem",
};

const painNavTextStyle: CSSProperties = {
  fontSize: "0.875rem",
  color: "#1e40af",
  flex: 1,
};

const painNavLinkStyle: CSSProperties = {
  padding: "0.375rem 1rem",
  backgroundColor: "#3b82f6",
  color: "#ffffff",
  border: "none",
  borderRadius: "0.375rem",
  fontSize: "0.8125rem",
  fontWeight: 500,
  cursor: "pointer",
  textDecoration: "none",
  whiteSpace: "nowrap",
};

const buttonContainerStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  marginTop: "1rem",
};

const backButtonStyle: CSSProperties = {
  padding: "0.5rem 1.5rem",
  backgroundColor: "transparent",
  color: "#64748b",
  border: "1px solid #e2e8f0",
  borderRadius: "0.375rem",
  fontSize: "0.875rem",
  fontWeight: 500,
  cursor: "pointer",
};

const completeButtonStyle: CSSProperties = {
  padding: "0.5rem 1.5rem",
  backgroundColor: "#16a34a",
  color: "#ffffff",
  border: "none",
  borderRadius: "0.375rem",
  fontSize: "0.875rem",
  fontWeight: 500,
  cursor: "pointer",
};

const completeButtonDisabledStyle: CSSProperties = {
  ...completeButtonStyle,
  backgroundColor: "#94a3b8",
  cursor: "not-allowed",
};

const completedBannerStyle: CSSProperties = {
  padding: "1rem",
  backgroundColor: "#f0fdf4",
  border: "1px solid #86efac",
  borderRadius: "0.5rem",
  textAlign: "center",
  color: "#16a34a",
  fontWeight: 600,
};

const CATEGORY_LABELS: Record<string, string> = {
  inflammation: "炎症",
  fever: "発熱",
  pain: "痛み",
};

/**
 * 対処提案ステップ
 *
 * 炎症・発熱の有無に応じた対処方法を提案する。
 * 痛みがある場合は疼痛カテゴリへの誘導を表示する。
 */
export function SuggestionStep({
  suggestions,
  shouldNavigateToPain,
  admissionId,
  onBack,
  onComplete,
  isCompleting,
  isCompleted,
}: SuggestionStepProps) {
  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>対処提案</h2>
      <p style={descriptionStyle}>炎症・発熱の有無に応じた対処方法を提案します。</p>

      {isCompleted && <div style={completedBannerStyle}>炎症ケアプランが完了しました。</div>}

      <div style={suggestionListStyle}>
        {suggestions.map((suggestion) => (
          <div key={suggestion.id} style={getSuggestionCardStyle(suggestion.category)}>
            <div style={suggestionCategoryStyle}>
              {CATEGORY_LABELS[suggestion.category] ?? suggestion.category}
            </div>
            <div style={suggestionMessageStyle}>{suggestion.message}</div>
          </div>
        ))}
      </div>

      {shouldNavigateToPain && (
        <div style={painNavigationStyle}>
          <div style={painNavTextStyle}>
            痛みが認められます。疼痛管理のケアプランも合わせて作成することを推奨します。
          </div>
          <a href={`/admissions/${admissionId}/care-plan/pain`} style={painNavLinkStyle}>
            疼痛管理へ
          </a>
        </div>
      )}

      <div style={buttonContainerStyle}>
        <button onClick={onBack} style={backButtonStyle}>
          戻る
        </button>
        {!isCompleted && (
          <button
            onClick={onComplete}
            disabled={isCompleting}
            style={isCompleting ? completeButtonDisabledStyle : completeButtonStyle}
          >
            {isCompleting ? "保存中..." : "完了"}
          </button>
        )}
      </div>
    </div>
  );
}
