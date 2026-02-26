"use client";

import { useState, useEffect, useCallback, type CSSProperties } from "react";
import type {
  PainCarePlanDetails,
  PainSiteId,
  PainSiteDetail,
  PainMedicationInfo,
  PainQuestionStepId,
  LifeImpactId,
} from "../types";
import { PAIN_QUESTION_STEPS, createInitialPainDetails } from "../types";
import { PainMedicationStep } from "./PainMedicationStep";
import { BooleanQuestionStep } from "./BooleanQuestionStep";
import { PainSiteSelectionStep } from "./PainSiteSelectionStep";
import { SiteDetailStep } from "./SiteDetailStep";
import { LifeImpactStep } from "./LifeImpactStep";
import { PainConfirmationStep } from "./PainConfirmationStep";

export interface PainCarePlanWizardProps {
  /** 入院ID */
  admissionId: number;
}

const containerStyle: CSSProperties = {
  maxWidth: "100%",
};

const backLinkStyle: CSSProperties = {
  display: "inline-block",
  fontSize: "0.8125rem",
  color: "#3b82f6",
  textDecoration: "none",
  marginBottom: "1rem",
};

const cardStyle: CSSProperties = {
  border: "1px solid #e2e8f0",
  borderRadius: "0.5rem",
  backgroundColor: "#ffffff",
  overflow: "hidden",
};

const headerStyle: CSSProperties = {
  padding: "1rem",
  borderBottom: "1px solid #e2e8f0",
  backgroundColor: "#f8fafc",
};

const headerTitleStyle: CSSProperties = {
  fontSize: "1.125rem",
  fontWeight: 600,
  color: "#1e293b",
  marginBottom: "0.25rem",
};

const progressStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  fontSize: "0.75rem",
  color: "#64748b",
};

const progressBarContainerStyle: CSSProperties = {
  flex: 1,
  height: "4px",
  backgroundColor: "#e2e8f0",
  borderRadius: "2px",
  overflow: "hidden",
};

function progressBarFillStyle(percent: number): CSSProperties {
  return {
    width: `${percent}%`,
    height: "100%",
    backgroundColor: "#3b82f6",
    borderRadius: "2px",
    transition: "width 0.3s ease",
  };
}

const bodyStyle: CSSProperties = {
  padding: "1.5rem",
};

const footerStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "1rem",
  borderTop: "1px solid #e2e8f0",
  backgroundColor: "#f8fafc",
};

const prevButtonStyle: CSSProperties = {
  padding: "0.5rem 1.25rem",
  fontSize: "0.875rem",
  fontWeight: 500,
  border: "1px solid #d1d5db",
  borderRadius: "0.375rem",
  backgroundColor: "#ffffff",
  color: "#374151",
  cursor: "pointer",
};

const nextButtonStyle: CSSProperties = {
  padding: "0.5rem 1.25rem",
  fontSize: "0.875rem",
  fontWeight: 500,
  border: "none",
  borderRadius: "0.375rem",
  backgroundColor: "#3b82f6",
  color: "#ffffff",
  cursor: "pointer",
};

const completeButtonStyle: CSSProperties = {
  ...nextButtonStyle,
  backgroundColor: "#16a34a",
};

const disabledButtonStyle: CSSProperties = {
  ...nextButtonStyle,
  backgroundColor: "#94a3b8",
  cursor: "not-allowed",
};

const loadingStyle: CSSProperties = {
  textAlign: "center",
  padding: "3rem",
  color: "#64748b",
  fontSize: "0.875rem",
};

const errorStyle: CSSProperties = {
  textAlign: "center",
  padding: "2rem",
  color: "#dc2626",
  fontSize: "0.875rem",
};

const savingOverlayStyle: CSSProperties = {
  textAlign: "center",
  padding: "1rem",
  color: "#3b82f6",
  fontSize: "0.875rem",
  fontWeight: 500,
};

/**
 * 疼痛ケアプラン一問一答ウィザードコンポーネント
 *
 * 痛み止め処方確認 -> 日中の痛み -> 夜間覚醒 -> 部位選択 ->
 * 部位詳細 -> 生活影響 -> 確認 の一問一答フローを提供する。
 */
export function PainCarePlanWizard({ admissionId }: PainCarePlanWizardProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [details, setDetails] = useState<PainCarePlanDetails>(createInitialPainDetails());
  const [medications, setMedications] = useState<PainMedicationInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [itemId, setItemId] = useState<number | null>(null);

  const currentStep = PAIN_QUESTION_STEPS[currentStepIndex];
  const totalSteps = PAIN_QUESTION_STEPS.length;
  const progressPercent = ((currentStepIndex + 1) / totalSteps) * 100;

  // 初回データ取得
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/care-plan/pain?admissionId=${admissionId}`);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "取得に失敗しました");
      }
      const data = await response.json();
      if (data.painCarePlan) {
        setItemId(data.painCarePlan.itemId);
        setMedications(data.painCarePlan.painMedications ?? []);
        if (data.painCarePlan.details) {
          setDetails(data.painCarePlan.details);
        }
        // 現在の質問ステップを復元
        if (data.painCarePlan.currentQuestionId) {
          const stepIndex = PAIN_QUESTION_STEPS.findIndex(
            (s) => s.id === data.painCarePlan.currentQuestionId,
          );
          if (stepIndex >= 0) {
            setCurrentStepIndex(stepIndex);
          }
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "疼痛ケアプラン情報の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, [admissionId]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  // 途中保存
  const saveProgress = useCallback(
    async (stepId: PainQuestionStepId, currentDetails: PainCarePlanDetails) => {
      try {
        setSaving(true);
        const response = await fetch("/api/care-plan/pain", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            admissionId,
            currentQuestionId: stepId,
            details: currentDetails,
            isCompleted: false,
          }),
        });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error ?? "保存に失敗しました");
        }
        const data = await response.json();
        if (data.itemId) {
          setItemId(data.itemId);
        }
      } catch (e) {
        console.error("途中保存に失敗:", e);
      } finally {
        setSaving(false);
      }
    },
    [admissionId],
  );

  // 完了保存
  const saveComplete = useCallback(async () => {
    try {
      setSaving(true);
      setError(null);
      const response = await fetch("/api/care-plan/pain", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          admissionId,
          currentQuestionId: "CONFIRMATION",
          details,
          isCompleted: true,
        }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "保存に失敗しました");
      }
      // 完了後はケアプラン一覧に戻る
      window.location.href = `/admissions/${admissionId}/care-plan`;
    } catch (e) {
      setError(e instanceof Error ? e.message : "ケアプランの保存に失敗しました");
    } finally {
      setSaving(false);
    }
  }, [admissionId, details]);

  // 次へ
  const handleNext = () => {
    if (currentStepIndex < totalSteps - 1) {
      const nextIndex = currentStepIndex + 1;
      // 部位選択がない場合は部位詳細ステップをスキップ
      const nextStep = PAIN_QUESTION_STEPS[nextIndex];
      if (nextStep.id === "SITE_DETAILS" && details.selectedSiteIds.length === 0) {
        setCurrentStepIndex(nextIndex + 1);
        void saveProgress(PAIN_QUESTION_STEPS[nextIndex + 1].id, details);
      } else {
        setCurrentStepIndex(nextIndex);
        void saveProgress(nextStep.id, details);
      }
    }
  };

  // 前へ
  const handlePrev = () => {
    if (currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1;
      const prevStep = PAIN_QUESTION_STEPS[prevIndex];
      // 部位選択がない場合は部位詳細ステップをスキップ（戻る時）
      if (prevStep.id === "SITE_DETAILS" && details.selectedSiteIds.length === 0) {
        setCurrentStepIndex(prevIndex - 1);
      } else {
        setCurrentStepIndex(prevIndex);
      }
    }
  };

  // 部位トグル
  const handleToggleSite = (siteId: PainSiteId) => {
    setDetails((prev) => {
      const isSelected = prev.selectedSiteIds.includes(siteId);
      const newSelectedIds = isSelected
        ? prev.selectedSiteIds.filter((id) => id !== siteId)
        : [...prev.selectedSiteIds, siteId];

      // 部位が削除された場合、対応するdetailも削除
      const newSiteDetails = isSelected
        ? prev.siteDetails.filter((d) => d.siteId !== siteId)
        : [
            ...prev.siteDetails,
            {
              siteId,
              touchPain: null,
              movementPain: null,
              numbness: null,
            },
          ];

      return {
        ...prev,
        selectedSiteIds: newSelectedIds,
        siteDetails: newSiteDetails,
      };
    });
  };

  // 部位詳細更新
  const handleUpdateSiteDetail = (
    siteId: PainSiteId,
    field: keyof PainSiteDetail,
    value: boolean,
  ) => {
    setDetails((prev) => {
      const newSiteDetails = prev.siteDetails.map((d) =>
        d.siteId === siteId ? { ...d, [field]: value } : d,
      );
      return {
        ...prev,
        siteDetails: newSiteDetails,
      };
    });
  };

  // 生活影響更新
  const handleChangeImpact = (id: LifeImpactId, value: boolean) => {
    setDetails((prev) => {
      switch (id) {
        case "SLEEP_IMPACT":
          return { ...prev, sleepImpact: value };
        case "MOBILITY_IMPACT":
          return { ...prev, mobilityImpact: value };
        case "TOILET_IMPACT":
          return { ...prev, toiletImpact: value };
        default:
          return prev;
      }
    });
  };

  if (loading) {
    return <div style={loadingStyle}>読み込み中...</div>;
  }

  if (error && !itemId) {
    return (
      <div style={errorStyle}>
        <p>{error}</p>
        <button
          onClick={() => void fetchData()}
          style={{ ...nextButtonStyle, marginTop: "0.5rem" }}
        >
          再試行
        </button>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <a href={`/admissions/${admissionId}/care-plan`} style={backLinkStyle}>
        &larr; ケアプラン一覧に戻る
      </a>

      <div style={cardStyle}>
        {/* ヘッダー + プログレスバー */}
        <div style={headerStyle}>
          <div style={headerTitleStyle}>{currentStep.label}</div>
          <div style={progressStyle}>
            <span>
              {currentStepIndex + 1} / {totalSteps}
            </span>
            <div style={progressBarContainerStyle}>
              <div style={progressBarFillStyle(progressPercent)} />
            </div>
          </div>
        </div>

        {/* ステップ内容 */}
        <div style={bodyStyle}>
          {error && (
            <div style={{ ...errorStyle, padding: "0.5rem", marginBottom: "1rem" }}>{error}</div>
          )}

          {currentStep.id === "PAIN_MEDICATION" && <PainMedicationStep medications={medications} />}

          {currentStep.id === "DAYTIME_PAIN" && (
            <BooleanQuestionStep
              title="日中活動時の痛みの有無"
              description="日中の活動時に痛みはありますか？"
              value={details.hasDaytimePain}
              onChange={(value) => setDetails((prev) => ({ ...prev, hasDaytimePain: value }))}
            />
          )}

          {currentStep.id === "NIGHTTIME_AWAKENING" && (
            <BooleanQuestionStep
              title="痛みによる夜間覚醒"
              description="痛みのせいで夜間に目が覚めることがありますか？"
              value={details.hasNighttimeAwakening}
              onChange={(value) =>
                setDetails((prev) => ({ ...prev, hasNighttimeAwakening: value }))
              }
            />
          )}

          {currentStep.id === "PAIN_SITES" && (
            <PainSiteSelectionStep
              selectedSiteIds={details.selectedSiteIds}
              onToggleSite={handleToggleSite}
            />
          )}

          {currentStep.id === "SITE_DETAILS" && (
            <SiteDetailStep
              selectedSiteIds={details.selectedSiteIds}
              siteDetails={details.siteDetails}
              onUpdateSiteDetail={handleUpdateSiteDetail}
            />
          )}

          {currentStep.id === "LIFE_IMPACT" && (
            <LifeImpactStep
              sleepImpact={details.sleepImpact}
              mobilityImpact={details.mobilityImpact}
              toiletImpact={details.toiletImpact}
              onChangeImpact={handleChangeImpact}
            />
          )}

          {currentStep.id === "CONFIRMATION" && (
            <PainConfirmationStep details={details} medications={medications} />
          )}
        </div>

        {/* フッター: 戻る/進むボタン */}
        <div style={footerStyle}>
          <button
            type="button"
            style={
              currentStepIndex === 0
                ? { ...prevButtonStyle, visibility: "hidden" }
                : prevButtonStyle
            }
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
          >
            戻る
          </button>

          {saving && <span style={savingOverlayStyle}>保存中...</span>}

          {currentStep.id === "CONFIRMATION" ? (
            <button
              type="button"
              style={saving ? disabledButtonStyle : completeButtonStyle}
              onClick={() => void saveComplete()}
              disabled={saving}
            >
              {saving ? "保存中..." : "完了"}
            </button>
          ) : (
            <button
              type="button"
              style={saving ? disabledButtonStyle : nextButtonStyle}
              onClick={handleNext}
              disabled={saving}
            >
              次へ
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
