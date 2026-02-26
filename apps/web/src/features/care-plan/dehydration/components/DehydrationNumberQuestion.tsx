"use client";

import { useState, type CSSProperties } from "react";

export interface DehydrationNumberQuestionProps {
  /** 質問タイトル */
  title: string;
  /** 質問説明文 */
  description: string;
  /** 現在の値 */
  initialValue: number | null;
  /** 単位 */
  unit: string;
  /** 最小値 */
  min?: number;
  /** 最大値 */
  max?: number;
  /** 値変更コールバック */
  onValueChange: (value: number | null) => void;
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

const inputGroupStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  marginBottom: "1.5rem",
};

const inputStyle: CSSProperties = {
  padding: "0.5rem",
  border: "1px solid #e2e8f0",
  borderRadius: "0.375rem",
  fontSize: "1rem",
  width: "150px",
};

const unitStyle: CSSProperties = {
  fontSize: "0.875rem",
  color: "#64748b",
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
 * 数値入力質問コンポーネント
 *
 * 水分摂取量などの数値入力フォームを表示する。
 */
export function DehydrationNumberQuestion({
  title,
  description,
  initialValue,
  unit,
  min = 0,
  max = 10000,
  onValueChange,
  onNext,
  onBack,
}: DehydrationNumberQuestionProps) {
  const [value, setValue] = useState<string>(initialValue != null ? String(initialValue) : "");

  const handleChange = (newValue: string) => {
    setValue(newValue);
    if (newValue === "") {
      onValueChange(null);
    } else {
      const numValue = parseFloat(newValue);
      onValueChange(isNaN(numValue) ? null : numValue);
    }
  };

  return (
    <div style={containerStyle}>
      <h3 style={titleStyle}>{title}</h3>
      <p style={descriptionStyle}>{description}</p>

      <div style={inputGroupStyle}>
        <input
          type="number"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          style={inputStyle}
          min={min}
          max={max}
          placeholder="--"
          aria-label={title}
        />
        <span style={unitStyle}>{unit}</span>
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
