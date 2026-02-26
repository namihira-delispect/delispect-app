"use client";

import { useState, useEffect, useCallback, type CSSProperties } from "react";
import type {
  InflammationDataResponse,
  InflammationQuestionId,
  InflammationSuggestion,
} from "../types";
import { INFLAMMATION_QUESTION_ORDER } from "../types";
import { LabResultsStep } from "./LabResultsStep";
import { VitalSignsStep } from "./VitalSignsStep";
import { PainCheckStep } from "./PainCheckStep";
import { SuggestionStep } from "./SuggestionStep";

export interface InflammationFlowProps {
  admissionId: number;
}

const containerStyle: CSSProperties = {
  maxWidth: "100%",
};

const cardStyle: CSSProperties = {
  border: "1px solid #e2e8f0",
  borderRadius: "0.5rem",
  backgroundColor: "#ffffff",
  padding: "1.5rem",
};

const progressStyle: CSSProperties = {
  display: "flex",
  gap: "0.5rem",
  marginBottom: "1.5rem",
};

function getProgressDotStyle(isActive: boolean, isCompleted: boolean): CSSProperties {
  return {
    width: "2rem",
    height: "0.25rem",
    borderRadius: "9999px",
    backgroundColor: isCompleted ? "#16a34a" : isActive ? "#3b82f6" : "#e2e8f0",
    flex: 1,
  };
}

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

const backLinkStyle: CSSProperties = {
  display: "inline-block",
  fontSize: "0.8125rem",
  color: "#3b82f6",
  textDecoration: "none",
  marginBottom: "1rem",
};

/**
 * 炎症ケアプラン入力フローコンポーネント
 *
 * 一問一答形式で採血結果、バイタルサイン、痛みの確認を行い、
 * 対処提案を表示する。戻る/進むボタンでステップ間を移動できる。
 */
export function InflammationFlow({ admissionId }: InflammationFlowProps) {
  const [data, setData] = useState<InflammationDataResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [hasPain, setHasPain] = useState<boolean | null>(null);
  const [suggestions, setSuggestions] = useState<InflammationSuggestion[]>([]);
  const [shouldNavigateToPain, setShouldNavigateToPain] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/care-plan/inflammation?admissionId=${admissionId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error ?? "データの取得に失敗しました");
      }
      const responseData = await response.json();
      setData(responseData);

      // 既存データがある場合はステップを復元
      if (responseData.currentQuestionId) {
        const stepIndex = INFLAMMATION_QUESTION_ORDER.indexOf(
          responseData.currentQuestionId as InflammationQuestionId,
        );
        if (stepIndex >= 0) {
          setCurrentStep(stepIndex);
        }
      }

      // 既存の詳細データから痛みの有無を復元
      if (responseData.details?.hasPain !== null && responseData.details?.hasPain !== undefined) {
        setHasPain(responseData.details.hasPain);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "炎症データの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, [admissionId]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const saveProgress = useCallback(
    async (questionId: InflammationQuestionId) => {
      if (!data) return;
      try {
        setSaving(true);
        const response = await fetch("/api/care-plan/inflammation", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            itemId: data.itemId,
            admissionId,
            currentQuestionId: questionId,
            hasPain,
          }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          console.error("進捗の保存に失敗しました:", errorData.error);
        }
      } catch (e) {
        console.error("進捗の保存に失敗しました:", e);
      } finally {
        setSaving(false);
      }
    },
    [data, admissionId, hasPain],
  );

  const handleNext = useCallback(async () => {
    const nextStep = currentStep + 1;
    if (nextStep < INFLAMMATION_QUESTION_ORDER.length) {
      await saveProgress(INFLAMMATION_QUESTION_ORDER[nextStep]);
      setCurrentStep(nextStep);
    }
  }, [currentStep, saveProgress]);

  const handleBack = useCallback(() => {
    const prevStep = currentStep - 1;
    if (prevStep >= 0) {
      setCurrentStep(prevStep);
    }
  }, [currentStep]);

  const handleComplete = useCallback(async () => {
    if (!data) return;
    try {
      setIsCompleting(true);
      // まず痛みの情報を保存
      await saveProgress("suggestion");

      const response = await fetch("/api/care-plan/inflammation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: data.itemId,
          admissionId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error ?? "完了に失敗しました");
      }

      const result = await response.json();
      setSuggestions(result.suggestions ?? []);
      setShouldNavigateToPain(result.shouldNavigateToPain ?? false);
      setIsCompleted(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "炎症ケアプランの完了に失敗しました");
    } finally {
      setIsCompleting(false);
    }
  }, [data, admissionId, saveProgress]);

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

  if (!data) {
    return <div style={errorStyle}>炎症データが見つかりません</div>;
  }

  const currentQuestionId = INFLAMMATION_QUESTION_ORDER[currentStep];

  return (
    <div style={containerStyle}>
      <a href={`/admissions/${admissionId}/care-plan`} style={backLinkStyle}>
        &larr; ケアプラン一覧に戻る
      </a>

      <div style={cardStyle}>
        {/* プログレスバー */}
        <div style={progressStyle}>
          {INFLAMMATION_QUESTION_ORDER.map((_, index) => (
            <div
              key={index}
              style={getProgressDotStyle(index === currentStep, index < currentStep)}
            />
          ))}
        </div>

        {/* 保存中インジケーター */}
        {saving && (
          <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginBottom: "0.5rem" }}>
            保存中...
          </div>
        )}

        {/* ステップコンテンツ */}
        {currentQuestionId === "lab_results" && (
          <LabResultsStep labResults={data.labResults} onNext={() => void handleNext()} />
        )}

        {currentQuestionId === "vital_signs" && (
          <VitalSignsStep
            vitalSigns={data.vitalSigns}
            onBack={handleBack}
            onNext={() => void handleNext()}
          />
        )}

        {currentQuestionId === "pain_check" && (
          <PainCheckStep
            hasPain={hasPain}
            onPainChange={setHasPain}
            onBack={handleBack}
            onNext={() => void handleNext()}
          />
        )}

        {currentQuestionId === "suggestion" && (
          <SuggestionStep
            suggestions={suggestions}
            shouldNavigateToPain={shouldNavigateToPain}
            admissionId={admissionId}
            onBack={handleBack}
            onComplete={() => void handleComplete()}
            isCompleting={isCompleting}
            isCompleted={isCompleted}
          />
        )}
      </div>
    </div>
  );
}
