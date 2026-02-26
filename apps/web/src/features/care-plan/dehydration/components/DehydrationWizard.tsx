"use client";

import { useState, useEffect, useCallback, type CSSProperties } from "react";
import type {
  DehydrationDetails,
  DehydrationResponse,
  DehydrationQuestionId,
  VisualCondition,
  IntakeFrequency,
} from "../types";
import {
  DEHYDRATION_QUESTION_ORDER,
  DEHYDRATION_QUESTIONS,
  DEHYDRATION_GROUP_LABELS,
  VISUAL_CONDITION_LABELS,
  INTAKE_FREQUENCY_LABELS,
  EMPTY_DEHYDRATION_DETAILS,
} from "../types";
import { DehydrationLabQuestion } from "./DehydrationLabQuestion";
import { DehydrationVitalQuestion } from "./DehydrationVitalQuestion";
import { DehydrationSelectQuestion } from "./DehydrationSelectQuestion";
import { DehydrationNumberQuestion } from "./DehydrationNumberQuestion";
import { DehydrationResult } from "./DehydrationResult";

export interface DehydrationWizardProps {
  /** ケアプランアイテムID */
  itemId: number;
  /** 入院ID */
  admissionId: number;
}

const containerStyle: CSSProperties = {
  maxWidth: "100%",
};

const loadingStyle: CSSProperties = {
  textAlign: "center",
  padding: "2rem",
  color: "#64748b",
  fontSize: "0.875rem",
};

const errorStyle: CSSProperties = {
  textAlign: "center",
  padding: "2rem",
  color: "#dc2626",
  fontSize: "0.875rem",
};

const retryButtonStyle: CSSProperties = {
  padding: "0.5rem 1rem",
  backgroundColor: "#3b82f6",
  color: "#ffffff",
  border: "none",
  borderRadius: "0.375rem",
  fontSize: "0.875rem",
  fontWeight: 500,
  cursor: "pointer",
  marginTop: "0.5rem",
};

const progressStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "0.75rem 1rem",
  backgroundColor: "#f8fafc",
  borderRadius: "0.5rem",
  marginBottom: "1rem",
  fontSize: "0.8125rem",
  color: "#475569",
};

const progressBarContainerStyle: CSSProperties = {
  width: "100%",
  height: "4px",
  backgroundColor: "#e2e8f0",
  borderRadius: "2px",
  marginTop: "0.5rem",
};

const backLinkStyle: CSSProperties = {
  display: "inline-block",
  fontSize: "0.8125rem",
  color: "#3b82f6",
  textDecoration: "none",
  marginBottom: "1rem",
};

/**
 * 脱水アセスメントウィザードコンポーネント
 *
 * 一問一答形式で脱水アセスメントを進める。
 * 戻る/進むボタンで質問間を移動できる。
 */
export function DehydrationWizard({ itemId, admissionId }: DehydrationWizardProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [details, setDetails] = useState<DehydrationDetails>(EMPTY_DEHYDRATION_DETAILS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [response, setResponse] = useState<DehydrationResponse | null>(null);

  const totalQuestions = DEHYDRATION_QUESTION_ORDER.length;
  const currentQuestionId = DEHYDRATION_QUESTION_ORDER[currentIndex];
  const currentQuestion = DEHYDRATION_QUESTIONS[currentQuestionId];

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/care-plan/dehydration?itemId=${itemId}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "取得に失敗しました");
      }
      const data: DehydrationResponse = await res.json();
      setResponse(data);
      setDetails(data.details);

      if (data.status === "COMPLETED" && data.assessmentResult) {
        setIsCompleted(true);
      } else if (data.currentQuestionId) {
        // 中断位置から再開
        const idx = DEHYDRATION_QUESTION_ORDER.indexOf(data.currentQuestionId);
        if (idx >= 0) {
          setCurrentIndex(idx);
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "データの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, [itemId]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const saveProgress = useCallback(
    async (questionId: DehydrationQuestionId, updatedDetails: DehydrationDetails) => {
      try {
        setSaving(true);
        const res = await fetch("/api/care-plan/dehydration", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            itemId,
            currentQuestionId: questionId,
            details: updatedDetails,
          }),
        });
        if (!res.ok) {
          const data = await res.json();
          console.error("保存エラー:", data.error);
        }
      } catch (e) {
        console.error("保存エラー:", e);
      } finally {
        setSaving(false);
      }
    },
    [itemId],
  );

  const completeAssessment = useCallback(
    async (finalDetails: DehydrationDetails) => {
      try {
        setSaving(true);
        setError(null);
        const res = await fetch("/api/care-plan/dehydration", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            itemId,
            details: finalDetails,
          }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error ?? "完了に失敗しました");
        }
        const data: DehydrationResponse = await res.json();
        setResponse(data);
        setIsCompleted(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : "アセスメントの完了に失敗しました");
      } finally {
        setSaving(false);
      }
    },
    [itemId],
  );

  const handleNext = useCallback(() => {
    if (currentIndex < totalQuestions - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      void saveProgress(DEHYDRATION_QUESTION_ORDER[nextIndex], details);
    } else {
      // 最後の質問の場合はアセスメント完了
      void completeAssessment(details);
    }
  }, [currentIndex, totalQuestions, details, saveProgress, completeAssessment]);

  const handleBack = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex]);

  const handleBackToList = useCallback(() => {
    window.location.href = `/admissions/${admissionId}/care-plan`;
  }, [admissionId]);

  if (loading) {
    return <div style={loadingStyle}>読み込み中...</div>;
  }

  if (error) {
    return (
      <div style={errorStyle}>
        <p>{error}</p>
        <button onClick={() => void fetchData()} style={retryButtonStyle}>
          再試行
        </button>
      </div>
    );
  }

  // 完了状態の場合は結果を表示
  if (isCompleted && response?.assessmentResult) {
    return (
      <div style={containerStyle}>
        <a href={`/admissions/${admissionId}/care-plan`} style={backLinkStyle}>
          &larr; ケアプラン一覧に戻る
        </a>
        <DehydrationResult
          result={response.assessmentResult}
          details={details}
          onBackToList={handleBackToList}
        />
      </div>
    );
  }

  // ウィザード表示
  const groupLabel = DEHYDRATION_GROUP_LABELS[currentQuestion.group] ?? "";
  const progressPercent = ((currentIndex + 1) / totalQuestions) * 100;

  return (
    <div style={containerStyle}>
      <a href={`/admissions/${admissionId}/care-plan`} style={backLinkStyle}>
        &larr; ケアプラン一覧に戻る
      </a>

      {/* プログレスバー */}
      <div style={progressStyle}>
        <span>
          {groupLabel} - {currentIndex + 1}/{totalQuestions}
        </span>
        {saving && <span style={{ color: "#3b82f6" }}>保存中...</span>}
        <div style={progressBarContainerStyle}>
          <div
            style={{
              width: `${progressPercent}%`,
              height: "100%",
              backgroundColor: "#3b82f6",
              borderRadius: "2px",
              transition: "width 0.3s ease",
            }}
          />
        </div>
      </div>

      {/* 質問コンポーネント */}
      {renderQuestion({
        questionId: currentQuestionId,
        details,
        setDetails,
        onNext: handleNext,
        onBack: currentIndex > 0 ? handleBack : null,
      })}
    </div>
  );
}

/**
 * 質問IDに応じた質問コンポーネントを返す
 */
function renderQuestion({
  questionId,
  details,
  setDetails,
  onNext,
  onBack,
}: {
  questionId: DehydrationQuestionId;
  details: DehydrationDetails;
  setDetails: (d: DehydrationDetails) => void;
  onNext: () => void;
  onBack: (() => void) | null;
}) {
  const question = DEHYDRATION_QUESTIONS[questionId];

  switch (questionId) {
    case "lab_ht":
      return (
        <DehydrationLabQuestion
          title={question.title}
          description={question.description}
          labValue={details.labHt}
          onNext={onNext}
          onBack={onBack}
        />
      );
    case "lab_hb":
      return (
        <DehydrationLabQuestion
          title={question.title}
          description={question.description}
          labValue={details.labHb}
          onNext={onNext}
          onBack={onBack}
        />
      );
    case "vital_pulse":
      return (
        <DehydrationVitalQuestion
          title={question.title}
          description={question.description}
          questionType="pulse"
          initialPulse={details.vitalPulse}
          onValueChange={(values) => {
            if (values.pulse !== undefined) {
              setDetails({ ...details, vitalPulse: values.pulse });
            }
          }}
          onNext={onNext}
          onBack={onBack}
        />
      );
    case "vital_bp":
      return (
        <DehydrationVitalQuestion
          title={question.title}
          description={question.description}
          questionType="bp"
          initialSystolicBp={details.vitalSystolicBp}
          initialDiastolicBp={details.vitalDiastolicBp}
          onValueChange={(values) => {
            const updated = { ...details };
            if (values.systolicBp !== undefined) updated.vitalSystolicBp = values.systolicBp;
            if (values.diastolicBp !== undefined) updated.vitalDiastolicBp = values.diastolicBp;
            setDetails(updated);
          }}
          onNext={onNext}
          onBack={onBack}
        />
      );
    case "visual_skin":
    case "visual_oral":
    case "visual_dizziness":
    case "visual_urine": {
      const fieldMap: Record<string, keyof DehydrationDetails> = {
        visual_skin: "visualSkin",
        visual_oral: "visualOral",
        visual_dizziness: "visualDizziness",
        visual_urine: "visualUrine",
      };
      const field = fieldMap[questionId];
      const options = Object.entries(VISUAL_CONDITION_LABELS).map(([value, label]) => ({
        value,
        label,
      }));
      return (
        <DehydrationSelectQuestion
          title={question.title}
          description={question.description}
          options={options}
          selectedValue={details[field] as string | null}
          onValueChange={(value) => setDetails({ ...details, [field]: value as VisualCondition })}
          onNext={onNext}
          onBack={onBack}
        />
      );
    }
    case "intake_frequency": {
      const options = Object.entries(INTAKE_FREQUENCY_LABELS).map(([value, label]) => ({
        value,
        label,
      }));
      return (
        <DehydrationSelectQuestion
          title={question.title}
          description={question.description}
          options={options}
          selectedValue={details.intakeFrequency}
          onValueChange={(value) =>
            setDetails({ ...details, intakeFrequency: value as IntakeFrequency })
          }
          onNext={onNext}
          onBack={onBack}
        />
      );
    }
    case "intake_amount":
      return (
        <DehydrationNumberQuestion
          title={question.title}
          description={question.description}
          initialValue={details.intakeAmount}
          unit="ml"
          min={0}
          max={10000}
          onValueChange={(value) => setDetails({ ...details, intakeAmount: value })}
          onNext={onNext}
          onBack={onBack}
        />
      );
    default:
      return null;
  }
}
