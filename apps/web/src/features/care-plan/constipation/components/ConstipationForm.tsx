"use client";

import { useState, useCallback, type CSSProperties } from "react";
import type { ConstipationAssessmentData, ConstipationQuestionId } from "../types";
import {
  CONSTIPATION_QUESTION_ORDER,
  CONSTIPATION_QUESTION_LABELS,
  BRISTOL_SCALE_VALUES,
  BRISTOL_SCALE_LABELS,
  BRISTOL_SCALE_SHORT_LABELS,
  MEAL_AMOUNT_VALUES,
  MEAL_AMOUNT_LABELS,
} from "../types";
import { ConstipationConfirmView } from "./ConstipationConfirmView";

export interface ConstipationFormProps {
  admissionId: number;
  initialData?: Partial<ConstipationAssessmentData>;
  initialQuestionId?: ConstipationQuestionId;
  onSave: (data: ConstipationAssessmentData) => Promise<void>;
  onProgressUpdate?: (questionId: ConstipationQuestionId) => void;
  saving?: boolean;
}

// =============================================================================
// スタイル定義
// =============================================================================

const containerStyle: CSSProperties = {
  maxWidth: "640px",
  margin: "0 auto",
};

const cardStyle: CSSProperties = {
  border: "1px solid #e2e8f0",
  borderRadius: "0.5rem",
  backgroundColor: "#ffffff",
  padding: "1.5rem",
};

const progressStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "1.5rem",
  fontSize: "0.8125rem",
  color: "#64748b",
};

const progressBarContainerStyle: CSSProperties = {
  width: "100%",
  height: "4px",
  backgroundColor: "#e2e8f0",
  borderRadius: "2px",
  marginTop: "0.5rem",
};

const questionTitleStyle: CSSProperties = {
  fontSize: "1.125rem",
  fontWeight: 600,
  color: "#1e293b",
  marginBottom: "1rem",
};

const questionDescStyle: CSSProperties = {
  fontSize: "0.875rem",
  color: "#64748b",
  marginBottom: "1.5rem",
};

const inputContainerStyle: CSSProperties = {
  marginBottom: "1.5rem",
};

const labelStyle: CSSProperties = {
  display: "block",
  fontSize: "0.875rem",
  fontWeight: 500,
  color: "#374151",
  marginBottom: "0.5rem",
};

const numberInputStyle: CSSProperties = {
  width: "100%",
  padding: "0.625rem 0.75rem",
  border: "1px solid #d1d5db",
  borderRadius: "0.375rem",
  fontSize: "1rem",
  outline: "none",
  maxWidth: "200px",
};

const buttonGroupStyle: CSSProperties = {
  display: "flex",
  gap: "0.5rem",
  flexWrap: "wrap",
};

const optionButtonStyle: CSSProperties = {
  padding: "0.5rem 1rem",
  border: "1px solid #d1d5db",
  borderRadius: "0.375rem",
  backgroundColor: "#ffffff",
  fontSize: "0.875rem",
  cursor: "pointer",
  textAlign: "left",
  transition: "border-color 0.15s",
};

const optionButtonSelectedStyle: CSSProperties = {
  ...optionButtonStyle,
  borderColor: "#3b82f6",
  backgroundColor: "#eff6ff",
  color: "#1d4ed8",
};

const bristolOptionStyle: CSSProperties = {
  ...optionButtonStyle,
  display: "block",
  width: "100%",
  marginBottom: "0.5rem",
  padding: "0.75rem 1rem",
};

const bristolOptionSelectedStyle: CSSProperties = {
  ...bristolOptionStyle,
  borderColor: "#3b82f6",
  backgroundColor: "#eff6ff",
  color: "#1d4ed8",
};

const boolButtonStyle: CSSProperties = {
  padding: "0.75rem 2rem",
  border: "1px solid #d1d5db",
  borderRadius: "0.375rem",
  backgroundColor: "#ffffff",
  fontSize: "0.9375rem",
  cursor: "pointer",
  minWidth: "100px",
  textAlign: "center",
};

const boolButtonSelectedStyle: CSSProperties = {
  ...boolButtonStyle,
  borderColor: "#3b82f6",
  backgroundColor: "#eff6ff",
  color: "#1d4ed8",
};

const navStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  marginTop: "2rem",
  paddingTop: "1rem",
  borderTop: "1px solid #e2e8f0",
};

const backButtonStyle: CSSProperties = {
  padding: "0.5rem 1.25rem",
  border: "1px solid #d1d5db",
  borderRadius: "0.375rem",
  backgroundColor: "#ffffff",
  fontSize: "0.875rem",
  cursor: "pointer",
  color: "#374151",
};

const nextButtonStyle: CSSProperties = {
  padding: "0.5rem 1.25rem",
  border: "none",
  borderRadius: "0.375rem",
  backgroundColor: "#3b82f6",
  color: "#ffffff",
  fontSize: "0.875rem",
  cursor: "pointer",
  fontWeight: 500,
};

const nextButtonDisabledStyle: CSSProperties = {
  ...nextButtonStyle,
  backgroundColor: "#94a3b8",
  cursor: "not-allowed",
};

const saveButtonStyle: CSSProperties = {
  ...nextButtonStyle,
  backgroundColor: "#16a34a",
};

const saveButtonDisabledStyle: CSSProperties = {
  ...saveButtonStyle,
  backgroundColor: "#94a3b8",
  cursor: "not-allowed",
};

const subLabelStyle: CSSProperties = {
  display: "block",
  fontSize: "0.8125rem",
  fontWeight: 500,
  color: "#374151",
  marginBottom: "0.375rem",
  marginTop: "1rem",
};

// =============================================================================
// コンポーネント
// =============================================================================

const DEFAULT_DATA: ConstipationAssessmentData = {
  daysWithoutBowelMovement: 0,
  bristolScale: null,
  hasNausea: false,
  hasAbdominalDistension: false,
  hasAppetite: true,
  mealAmount: "NORMAL",
  hasBowelSounds: true,
  hasIntestinalGas: false,
  hasFecalMass: false,
};

/**
 * 便秘ケアプラン一問一答フォームコンポーネント
 *
 * ステップ形式で便秘の確認項目を入力し、最後に確認画面を表示する。
 * 戻る/進むボタンで各設問を行き来できる。
 */
export function ConstipationForm({
  admissionId: _admissionId,
  initialData,
  initialQuestionId,
  onSave,
  onProgressUpdate,
  saving = false,
}: ConstipationFormProps) {
  const [data, setData] = useState<ConstipationAssessmentData>({
    ...DEFAULT_DATA,
    ...initialData,
  });

  const initialIndex = initialQuestionId
    ? CONSTIPATION_QUESTION_ORDER.indexOf(initialQuestionId)
    : 0;
  const [currentStep, setCurrentStep] = useState(Math.max(0, initialIndex));

  const currentQuestionId = CONSTIPATION_QUESTION_ORDER[currentStep];
  const isLastStep = currentStep === CONSTIPATION_QUESTION_ORDER.length - 1;
  const isFirstStep = currentStep === 0;
  const totalSteps = CONSTIPATION_QUESTION_ORDER.length;

  const progress = ((currentStep + 1) / totalSteps) * 100;

  const handleNext = useCallback(() => {
    if (!isLastStep) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      const nextQuestionId = CONSTIPATION_QUESTION_ORDER[nextStep];
      onProgressUpdate?.(nextQuestionId);
    }
  }, [currentStep, isLastStep, onProgressUpdate]);

  const handleBack = useCallback(() => {
    if (!isFirstStep) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      const prevQuestionId = CONSTIPATION_QUESTION_ORDER[prevStep];
      onProgressUpdate?.(prevQuestionId);
    }
  }, [currentStep, isFirstStep, onProgressUpdate]);

  const handleSave = useCallback(async () => {
    await onSave(data);
  }, [data, onSave]);

  const updateField = <K extends keyof ConstipationAssessmentData>(
    field: K,
    value: ConstipationAssessmentData[K],
  ) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  // 現在の質問に対する入力が完了しているかチェック
  const isCurrentStepValid = (): boolean => {
    switch (currentQuestionId) {
      case "daysWithoutBowelMovement":
        return data.daysWithoutBowelMovement >= 0;
      case "bristolScale":
        return true; // nullも許可（便が出ていない場合）
      case "physicalCondition":
        return true; // boolean値なので常にvalid
      case "diet":
        return true; // boolean + enum なので常にvalid
      case "bowelState":
        return true; // boolean値なので常にvalid
      case "confirm":
        return true;
      default:
        return false;
    }
  };

  const renderQuestion = () => {
    switch (currentQuestionId) {
      case "daysWithoutBowelMovement":
        return (
          <div>
            <p style={questionDescStyle}>
              最後に排便があった日から数えて、現在何日間排便がないかを入力してください。
            </p>
            <div style={inputContainerStyle}>
              <label style={labelStyle}>便が出ていない日数</label>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input
                  type="number"
                  min={0}
                  max={30}
                  value={data.daysWithoutBowelMovement}
                  onChange={(e) =>
                    updateField(
                      "daysWithoutBowelMovement",
                      Math.max(0, parseInt(e.target.value) || 0),
                    )
                  }
                  style={numberInputStyle}
                />
                <span style={{ fontSize: "0.875rem", color: "#374151" }}>日</span>
              </div>
            </div>
          </div>
        );

      case "bristolScale":
        return (
          <div>
            <p style={questionDescStyle}>
              直近の排便の性状をブリストルスケールで選択してください。
              排便がない場合は「該当なし」を選択してください。
            </p>
            <div style={inputContainerStyle}>
              <button
                type="button"
                onClick={() => updateField("bristolScale", null)}
                style={data.bristolScale === null ? bristolOptionSelectedStyle : bristolOptionStyle}
              >
                該当なし（排便なし）
              </button>
              {BRISTOL_SCALE_VALUES.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => updateField("bristolScale", value)}
                  style={
                    data.bristolScale === value ? bristolOptionSelectedStyle : bristolOptionStyle
                  }
                >
                  <strong>
                    タイプ{value}: {BRISTOL_SCALE_SHORT_LABELS[value]}
                  </strong>
                  <span
                    style={{
                      display: "block",
                      fontSize: "0.75rem",
                      color: "#64748b",
                      marginTop: "0.125rem",
                    }}
                  >
                    {BRISTOL_SCALE_LABELS[value]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        );

      case "physicalCondition":
        return (
          <div>
            <p style={questionDescStyle}>以下の体調面の症状について確認してください。</p>
            <div style={inputContainerStyle}>
              <span style={subLabelStyle}>吐き気、気分の悪さがありますか？</span>
              <div style={buttonGroupStyle}>
                <button
                  type="button"
                  onClick={() => updateField("hasNausea", true)}
                  style={data.hasNausea ? boolButtonSelectedStyle : boolButtonStyle}
                >
                  あり
                </button>
                <button
                  type="button"
                  onClick={() => updateField("hasNausea", false)}
                  style={!data.hasNausea ? boolButtonSelectedStyle : boolButtonStyle}
                >
                  なし
                </button>
              </div>

              <span style={subLabelStyle}>お腹の張りがありますか？</span>
              <div style={buttonGroupStyle}>
                <button
                  type="button"
                  onClick={() => updateField("hasAbdominalDistension", true)}
                  style={data.hasAbdominalDistension ? boolButtonSelectedStyle : boolButtonStyle}
                >
                  あり
                </button>
                <button
                  type="button"
                  onClick={() => updateField("hasAbdominalDistension", false)}
                  style={!data.hasAbdominalDistension ? boolButtonSelectedStyle : boolButtonStyle}
                >
                  なし
                </button>
              </div>
            </div>
          </div>
        );

      case "diet":
        return (
          <div>
            <p style={questionDescStyle}>食事についての確認を行います。</p>
            <div style={inputContainerStyle}>
              <span style={subLabelStyle}>食欲はありますか？</span>
              <div style={buttonGroupStyle}>
                <button
                  type="button"
                  onClick={() => updateField("hasAppetite", true)}
                  style={data.hasAppetite ? boolButtonSelectedStyle : boolButtonStyle}
                >
                  あり
                </button>
                <button
                  type="button"
                  onClick={() => updateField("hasAppetite", false)}
                  style={!data.hasAppetite ? boolButtonSelectedStyle : boolButtonStyle}
                >
                  なし
                </button>
              </div>

              <span style={subLabelStyle}>一度の食事量はどの程度ですか？</span>
              <div style={buttonGroupStyle}>
                {MEAL_AMOUNT_VALUES.map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => updateField("mealAmount", amount)}
                    style={
                      data.mealAmount === amount ? optionButtonSelectedStyle : optionButtonStyle
                    }
                  >
                    {MEAL_AMOUNT_LABELS[amount]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case "bowelState":
        return (
          <div>
            <p style={questionDescStyle}>腸の状態について確認してください。</p>
            <div style={inputContainerStyle}>
              <span style={subLabelStyle}>腸蠕動音は聴取できますか？</span>
              <div style={buttonGroupStyle}>
                <button
                  type="button"
                  onClick={() => updateField("hasBowelSounds", true)}
                  style={data.hasBowelSounds ? boolButtonSelectedStyle : boolButtonStyle}
                >
                  聴取あり
                </button>
                <button
                  type="button"
                  onClick={() => updateField("hasBowelSounds", false)}
                  style={!data.hasBowelSounds ? boolButtonSelectedStyle : boolButtonStyle}
                >
                  聴取なし
                </button>
              </div>

              <span style={subLabelStyle}>腸内ガスはありますか？</span>
              <div style={buttonGroupStyle}>
                <button
                  type="button"
                  onClick={() => updateField("hasIntestinalGas", true)}
                  style={data.hasIntestinalGas ? boolButtonSelectedStyle : boolButtonStyle}
                >
                  あり
                </button>
                <button
                  type="button"
                  onClick={() => updateField("hasIntestinalGas", false)}
                  style={!data.hasIntestinalGas ? boolButtonSelectedStyle : boolButtonStyle}
                >
                  なし
                </button>
              </div>

              <span style={subLabelStyle}>触診で便塊は確認されますか？</span>
              <div style={buttonGroupStyle}>
                <button
                  type="button"
                  onClick={() => updateField("hasFecalMass", true)}
                  style={data.hasFecalMass ? boolButtonSelectedStyle : boolButtonStyle}
                >
                  あり
                </button>
                <button
                  type="button"
                  onClick={() => updateField("hasFecalMass", false)}
                  style={!data.hasFecalMass ? boolButtonSelectedStyle : boolButtonStyle}
                >
                  なし
                </button>
              </div>
            </div>
          </div>
        );

      case "confirm":
        return <ConstipationConfirmView data={data} />;

      default:
        return null;
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        {/* プログレスバー */}
        <div style={progressStyle}>
          <span>
            ステップ {currentStep + 1} / {totalSteps}
          </span>
          <span>{CONSTIPATION_QUESTION_LABELS[currentQuestionId]}</span>
        </div>
        <div style={progressBarContainerStyle}>
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              backgroundColor: "#3b82f6",
              borderRadius: "2px",
              transition: "width 0.3s ease",
            }}
          />
        </div>

        {/* 質問タイトル */}
        <h3 style={questionTitleStyle}>{CONSTIPATION_QUESTION_LABELS[currentQuestionId]}</h3>

        {/* 質問コンテンツ */}
        {renderQuestion()}

        {/* ナビゲーションボタン */}
        <div style={navStyle}>
          <button
            type="button"
            onClick={handleBack}
            disabled={isFirstStep}
            style={{
              ...backButtonStyle,
              ...(isFirstStep ? { opacity: 0.5, cursor: "not-allowed" } : {}),
            }}
          >
            戻る
          </button>

          {isLastStep ? (
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving}
              style={saving ? saveButtonDisabledStyle : saveButtonStyle}
            >
              {saving ? "保存中..." : "保存する"}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              disabled={!isCurrentStepValid()}
              style={isCurrentStepValid() ? nextButtonStyle : nextButtonDisabledStyle}
            >
              進む
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
