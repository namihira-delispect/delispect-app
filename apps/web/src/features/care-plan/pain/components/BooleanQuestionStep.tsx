"use client";

import type { CSSProperties } from "react";

export interface BooleanQuestionStepProps {
  /** 質問タイトル */
  title: string;
  /** 質問の説明文 */
  description: string;
  /** 現在の回答値 */
  value: boolean | null;
  /** 回答変更コールバック */
  onChange: (value: boolean) => void;
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
};

const descriptionStyle: CSSProperties = {
  fontSize: "0.875rem",
  color: "#64748b",
};

const buttonGroupStyle: CSSProperties = {
  display: "flex",
  gap: "1rem",
  marginTop: "0.5rem",
};

function getButtonStyle(isSelected: boolean): CSSProperties {
  return {
    flex: 1,
    padding: "1rem",
    fontSize: "1rem",
    fontWeight: 500,
    border: isSelected ? "2px solid #3b82f6" : "2px solid #e2e8f0",
    borderRadius: "0.5rem",
    backgroundColor: isSelected ? "#eff6ff" : "#ffffff",
    color: isSelected ? "#1d4ed8" : "#475569",
    cursor: "pointer",
    textAlign: "center",
  };
}

/**
 * はい/いいえの二択質問ステップ
 *
 * 日中の痛みの有無、夜間覚醒の有無などに使用する。
 */
export function BooleanQuestionStep({
  title,
  description,
  value,
  onChange,
}: BooleanQuestionStepProps) {
  return (
    <div style={containerStyle}>
      <h3 style={titleStyle}>{title}</h3>
      <p style={descriptionStyle}>{description}</p>
      <div style={buttonGroupStyle}>
        <button
          type="button"
          style={getButtonStyle(value === true)}
          onClick={() => onChange(true)}
          aria-pressed={value === true}
        >
          はい
        </button>
        <button
          type="button"
          style={getButtonStyle(value === false)}
          onClick={() => onChange(false)}
          aria-pressed={value === false}
        >
          いいえ
        </button>
      </div>
    </div>
  );
}
