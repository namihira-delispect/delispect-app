"use client";

import type { CSSProperties } from "react";

export interface SelectOption {
  value: string;
  label: string;
}

export interface DehydrationSelectQuestionProps {
  /** 質問タイトル */
  title: string;
  /** 質問説明文 */
  description: string;
  /** 選択肢 */
  options: SelectOption[];
  /** 現在の選択値 */
  selectedValue: string | null;
  /** 値変更コールバック */
  onValueChange: (value: string) => void;
  /** 次へ進むコールバック */
  onNext: () => void;
  /** 戻るコールバック */
  onBack: (() => void) | null;
}

const containerStyle: CSSProperties = {
  padding: "1.5rem",
  backgroundColor: "#ffffff",
  borderRadius: "0.5rem",
  border: "1px solid #e2e8f0",
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
  marginBottom: "1.5rem",
};

const optionsStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
  marginBottom: "1.5rem",
};

function getOptionStyle(isSelected: boolean): CSSProperties {
  return {
    display: "flex",
    alignItems: "center",
    padding: "0.75rem 1rem",
    border: isSelected ? "2px solid #3b82f6" : "1px solid #e2e8f0",
    borderRadius: "0.375rem",
    backgroundColor: isSelected ? "#eff6ff" : "#ffffff",
    cursor: "pointer",
    fontSize: "0.875rem",
    fontWeight: isSelected ? 600 : 400,
    color: isSelected ? "#1d4ed8" : "#1e293b",
  };
}

const radioStyle: CSSProperties = {
  marginRight: "0.75rem",
  accentColor: "#3b82f6",
};

const buttonGroupStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: "0.75rem",
};

const backButtonStyle: CSSProperties = {
  padding: "0.5rem 1.5rem",
  backgroundColor: "#f1f5f9",
  color: "#475569",
  border: "1px solid #e2e8f0",
  borderRadius: "0.375rem",
  fontSize: "0.875rem",
  fontWeight: 500,
  cursor: "pointer",
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
  marginLeft: "auto",
};

/**
 * 選択式質問コンポーネント
 *
 * 目視確認・水分摂取頻度などの選択式質問を表示する。
 */
export function DehydrationSelectQuestion({
  title,
  description,
  options,
  selectedValue,
  onValueChange,
  onNext,
  onBack,
}: DehydrationSelectQuestionProps) {
  return (
    <div style={containerStyle}>
      <h3 style={titleStyle}>{title}</h3>
      <p style={descriptionStyle}>{description}</p>

      <div style={optionsStyle} role="radiogroup" aria-label={title}>
        {options.map((option) => (
          <label key={option.value} style={getOptionStyle(selectedValue === option.value)}>
            <input
              type="radio"
              name={`dehydration-select-${title}`}
              value={option.value}
              checked={selectedValue === option.value}
              onChange={() => onValueChange(option.value)}
              style={radioStyle}
            />
            {option.label}
          </label>
        ))}
      </div>

      <div style={buttonGroupStyle}>
        {onBack && (
          <button type="button" onClick={onBack} style={backButtonStyle}>
            戻る
          </button>
        )}
        <button type="button" onClick={onNext} style={nextButtonStyle}>
          次へ
        </button>
      </div>
    </div>
  );
}
