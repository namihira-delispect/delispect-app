"use client";

import type { CSSProperties } from "react";
import { MEDICATION_STEPS } from "../types";

export interface MedicationStepNavigationProps {
  /** 現在のステップインデックス（0始まり） */
  currentStepIndex: number;
  /** 戻るボタン押下時のコールバック */
  onBack: () => void;
  /** 進むボタン押下時のコールバック */
  onNext: () => void;
  /** 保存ボタン押下時のコールバック（最終ステップ） */
  onSave: () => void;
  /** 保存中フラグ */
  saving: boolean;
}

const containerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
};

const stepIndicatorContainerStyle: CSSProperties = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "0.5rem",
  padding: "0.75rem 0",
};

function getStepDotStyle(isActive: boolean, isCompleted: boolean): CSSProperties {
  return {
    width: "2rem",
    height: "2rem",
    borderRadius: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "0.75rem",
    fontWeight: 600,
    backgroundColor: isActive ? "#3b82f6" : isCompleted ? "#16a34a" : "#e2e8f0",
    color: isActive || isCompleted ? "#ffffff" : "#64748b",
    transition: "all 0.2s ease",
  };
}

const stepConnectorStyle: CSSProperties = {
  width: "3rem",
  height: "2px",
  backgroundColor: "#e2e8f0",
};

const stepConnectorActiveStyle: CSSProperties = {
  ...stepConnectorStyle,
  backgroundColor: "#16a34a",
};

const stepTitleStyle: CSSProperties = {
  textAlign: "center",
  fontSize: "0.9375rem",
  fontWeight: 600,
  color: "#1e293b",
};

const stepDescriptionStyle: CSSProperties = {
  textAlign: "center",
  fontSize: "0.8125rem",
  color: "#64748b",
};

const buttonContainerStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "1rem 0",
  borderTop: "1px solid #e2e8f0",
  marginTop: "1rem",
};

const backButtonStyle: CSSProperties = {
  padding: "0.5rem 1.25rem",
  fontSize: "0.875rem",
  fontWeight: 500,
  borderRadius: "0.375rem",
  border: "1px solid #d1d5db",
  backgroundColor: "#ffffff",
  color: "#374151",
  cursor: "pointer",
};

const backButtonDisabledStyle: CSSProperties = {
  ...backButtonStyle,
  color: "#d1d5db",
  cursor: "not-allowed",
};

const nextButtonStyle: CSSProperties = {
  padding: "0.5rem 1.25rem",
  fontSize: "0.875rem",
  fontWeight: 500,
  borderRadius: "0.375rem",
  border: "none",
  backgroundColor: "#3b82f6",
  color: "#ffffff",
  cursor: "pointer",
};

const saveButtonStyle: CSSProperties = {
  ...nextButtonStyle,
  backgroundColor: "#16a34a",
};

const disabledButtonStyle: CSSProperties = {
  ...nextButtonStyle,
  backgroundColor: "#94a3b8",
  cursor: "not-allowed",
};

/**
 * 薬剤ケアプラン ステップナビゲーションコンポーネント
 *
 * ステップインジケーターと「戻る」「進む」ボタンを表示する。
 */
export function MedicationStepNavigation({
  currentStepIndex,
  onBack,
  onNext,
  onSave,
  saving,
}: MedicationStepNavigationProps) {
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === MEDICATION_STEPS.length - 1;
  const currentStep = MEDICATION_STEPS[currentStepIndex];

  return (
    <div style={containerStyle}>
      {/* ステップインジケーター */}
      <div style={stepIndicatorContainerStyle}>
        {MEDICATION_STEPS.map((step, index) => (
          <div key={step.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div style={getStepDotStyle(index === currentStepIndex, index < currentStepIndex)}>
              {index < currentStepIndex ? "\u2713" : step.stepNumber}
            </div>
            {index < MEDICATION_STEPS.length - 1 && (
              <div
                style={index < currentStepIndex ? stepConnectorActiveStyle : stepConnectorStyle}
              />
            )}
          </div>
        ))}
      </div>

      {/* 現在のステップ情報 */}
      <div>
        <p style={stepTitleStyle}>
          ステップ {currentStep.stepNumber}: {currentStep.title}
        </p>
        <p style={stepDescriptionStyle}>{currentStep.description}</p>
      </div>

      {/* 戻る・進むボタン */}
      <div style={buttonContainerStyle}>
        <button
          type="button"
          onClick={onBack}
          disabled={isFirstStep}
          style={isFirstStep ? backButtonDisabledStyle : backButtonStyle}
        >
          戻る
        </button>
        {isLastStep ? (
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            style={saving ? disabledButtonStyle : saveButtonStyle}
          >
            {saving ? "保存中..." : "保存して完了"}
          </button>
        ) : (
          <button type="button" onClick={onNext} style={nextButtonStyle}>
            進む
          </button>
        )}
      </div>
    </div>
  );
}
