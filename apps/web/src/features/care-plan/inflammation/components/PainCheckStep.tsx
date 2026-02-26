"use client";

import type { CSSProperties } from "react";

export interface PainCheckStepProps {
  hasPain: boolean | null;
  onPainChange: (value: boolean) => void;
  onBack: () => void;
  onNext: () => void;
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

const questionStyle: CSSProperties = {
  fontSize: "1rem",
  fontWeight: 500,
  color: "#1e293b",
  marginBottom: "1rem",
};

const optionsStyle: CSSProperties = {
  display: "flex",
  gap: "1rem",
  flexWrap: "wrap",
};

function getOptionStyle(isSelected: boolean): CSSProperties {
  return {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.75rem 1.5rem",
    border: isSelected ? "2px solid #3b82f6" : "1px solid #e2e8f0",
    borderRadius: "0.5rem",
    backgroundColor: isSelected ? "#eff6ff" : "#ffffff",
    cursor: "pointer",
    fontSize: "0.875rem",
    fontWeight: isSelected ? 600 : 400,
    color: isSelected ? "#1d4ed8" : "#475569",
    minWidth: "120px",
    justifyContent: "center",
  };
}

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

const nextButtonStyle: CSSProperties = {
  padding: "0.5rem 1.5rem",
  backgroundColor: "#3b82f6",
  color: "#ffffff",
  border: "none",
  borderRadius: "0.375rem",
  fontSize: "0.875rem",
  fontWeight: 500,
  cursor: "pointer",
};

const nextButtonDisabledStyle: CSSProperties = {
  ...nextButtonStyle,
  backgroundColor: "#94a3b8",
  cursor: "not-allowed",
};

/**
 * 炎症にともなう痛みの確認ステップ
 *
 * 痛みの有無を選択する。
 */
export function PainCheckStep({ hasPain, onPainChange, onBack, onNext }: PainCheckStepProps) {
  const canProceed = hasPain !== null;

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>炎症にともなう痛みの確認</h2>
      <p style={descriptionStyle}>炎症に関連する痛みの有無を確認します。</p>

      <p style={questionStyle}>炎症にともなう痛みはありますか？</p>

      <div style={optionsStyle}>
        <button
          type="button"
          onClick={() => onPainChange(true)}
          style={getOptionStyle(hasPain === true)}
        >
          はい
        </button>
        <button
          type="button"
          onClick={() => onPainChange(false)}
          style={getOptionStyle(hasPain === false)}
        >
          いいえ
        </button>
      </div>

      <div style={buttonContainerStyle}>
        <button onClick={onBack} style={backButtonStyle}>
          戻る
        </button>
        <button
          onClick={onNext}
          disabled={!canProceed}
          style={canProceed ? nextButtonStyle : nextButtonDisabledStyle}
        >
          次へ
        </button>
      </div>
    </div>
  );
}
