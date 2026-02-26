"use client";

import { useState, useEffect, useCallback, type CSSProperties } from "react";
import type {
  MedicationCarePlanResponse,
  SelectedAlternative,
  MedicationCarePlanDetails,
} from "../types";
import { MEDICATION_STEPS } from "../types";
import { RiskDrugList } from "./RiskDrugList";
import { OpioidDrugList } from "./OpioidDrugList";
import { AlternativeDrugPanel } from "./AlternativeDrugPanel";
import { MedicationStepNavigation } from "./MedicationStepNavigation";

export interface MedicationCarePlanViewerProps {
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

const stepContentStyle: CSSProperties = {
  minHeight: "200px",
  padding: "1rem 0",
};

const completedStyle: CSSProperties = {
  padding: "2rem",
  textAlign: "center",
  backgroundColor: "#f0fdf4",
  borderRadius: "0.5rem",
  border: "1px solid #bbf7d0",
};

const completedTitleStyle: CSSProperties = {
  fontSize: "1.125rem",
  fontWeight: 600,
  color: "#16a34a",
  marginBottom: "0.5rem",
};

const completedDescStyle: CSSProperties = {
  fontSize: "0.875rem",
  color: "#15803d",
};

const confirmationContainerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
};

const confirmSectionStyle: CSSProperties = {
  padding: "0.75rem 1rem",
  backgroundColor: "#f8fafc",
  borderRadius: "0.375rem",
  border: "1px solid #e2e8f0",
};

const confirmLabelStyle: CSSProperties = {
  fontSize: "0.75rem",
  fontWeight: 600,
  color: "#64748b",
  marginBottom: "0.25rem",
};

const confirmValueStyle: CSSProperties = {
  fontSize: "0.875rem",
  color: "#1e293b",
};

/**
 * 薬剤ケアプラン ビューワーコンポーネント
 *
 * 一問一答形式で薬剤ケアプランの入力を行う。
 * ステップ: リスク薬剤確認 → オピオイド確認 → 代替薬剤選択 → 確認・保存
 */
export function MedicationCarePlanViewer({ admissionId }: MedicationCarePlanViewerProps) {
  const [data, setData] = useState<MedicationCarePlanResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedAlternatives, setSelectedAlternatives] = useState<SelectedAlternative[]>([]);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/care-plan/medication?admissionId=${admissionId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error ?? "取得に失敗しました");
      }
      const result = await response.json();
      setData(result.data);

      // 保存済みデータがある場合はステートを復元
      if (result.data?.savedDetails) {
        setSelectedAlternatives(result.data.savedDetails.selectedAlternatives ?? []);
        // ステータスが完了済みの場合は最終ステップに
        if (result.data.status === "COMPLETED") {
          setCurrentStepIndex(MEDICATION_STEPS.length - 1);
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "薬剤ケアプランデータの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, [admissionId]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleSelectAlternative = (alternative: SelectedAlternative) => {
    setSelectedAlternatives((prev) => {
      // 同じ処方に対する選択を上書き
      const filtered = prev.filter(
        (a) => a.originalPrescriptionId !== alternative.originalPrescriptionId,
      );
      return [...filtered, alternative];
    });
  };

  const handleRemoveAlternative = (originalPrescriptionId: number) => {
    setSelectedAlternatives((prev) =>
      prev.filter((a) => a.originalPrescriptionId !== originalPrescriptionId),
    );
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleNext = async () => {
    if (!data) return;

    // 中間ステップの保存（IN_PROGRESS）
    const nextIndex = currentStepIndex + 1;
    const nextStep = MEDICATION_STEPS[nextIndex];

    try {
      setSaving(true);
      const details: MedicationCarePlanDetails = {
        riskDrugMatches: data.riskDrugMatches,
        opioidDrugs: data.opioidDrugs,
        selectedAlternatives,
        instructions: "",
      };

      await fetch("/api/care-plan/medication", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          carePlanItemId: data.carePlanItemId,
          currentQuestionId: nextStep.id,
          details,
          status: "IN_PROGRESS",
        }),
      });

      setCurrentStepIndex(nextIndex);
    } catch {
      // 保存に失敗してもステップ遷移は許可
      setCurrentStepIndex(nextIndex);
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (!data) return;

    try {
      setSaving(true);
      setError(null);

      const details: MedicationCarePlanDetails = {
        riskDrugMatches: data.riskDrugMatches,
        opioidDrugs: data.opioidDrugs,
        selectedAlternatives,
        instructions: generateInstructionsSummary(data, selectedAlternatives),
        completedAt: new Date().toISOString(),
      };

      const response = await fetch("/api/care-plan/medication", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          carePlanItemId: data.carePlanItemId,
          currentQuestionId: "confirmation",
          details,
          status: "COMPLETED",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error ?? "保存に失敗しました");
      }

      // データを再取得
      await fetchData();
    } catch (e) {
      setError(e instanceof Error ? e.message : "薬剤ケアプランの保存に失敗しました");
    } finally {
      setSaving(false);
    }
  };

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
    return (
      <div style={errorStyle}>
        <p>薬剤ケアプランデータが取得できませんでした</p>
      </div>
    );
  }

  // 完了済みの場合
  if (data.status === "COMPLETED" && data.savedDetails) {
    return (
      <div style={containerStyle}>
        <a href={`/admissions/${admissionId}/care-plan`} style={backLinkStyle}>
          &larr; ケアプラン一覧に戻る
        </a>
        <div style={completedStyle}>
          <p style={completedTitleStyle}>薬剤ケアプランは完了済みです</p>
          <p style={completedDescStyle}>
            リスク薬剤 {data.riskDrugMatches.length}件、 オピオイド薬剤 {data.opioidDrugs.length}
            件を確認済み
          </p>
          {data.savedDetails.selectedAlternatives.length > 0 && (
            <p style={completedDescStyle}>
              代替薬剤提案 {data.savedDetails.selectedAlternatives.length}件
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <a href={`/admissions/${admissionId}/care-plan`} style={backLinkStyle}>
        &larr; ケアプラン一覧に戻る
      </a>

      <div style={cardStyle}>
        <MedicationStepNavigation
          currentStepIndex={currentStepIndex}
          onBack={handleBack}
          onNext={() => void handleNext()}
          onSave={() => void handleSave()}
          saving={saving}
        />

        <div style={stepContentStyle}>
          {currentStepIndex === 0 && <RiskDrugList riskDrugMatches={data.riskDrugMatches} />}
          {currentStepIndex === 1 && <OpioidDrugList opioidDrugs={data.opioidDrugs} />}
          {currentStepIndex === 2 && (
            <AlternativeDrugPanel
              riskDrugMatches={data.riskDrugMatches}
              selectedAlternatives={selectedAlternatives}
              onSelectAlternative={handleSelectAlternative}
              onRemoveAlternative={handleRemoveAlternative}
            />
          )}
          {currentStepIndex === 3 && (
            <ConfirmationStep data={data} selectedAlternatives={selectedAlternatives} />
          )}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// 確認ステップコンポーネント
// =============================================================================

function ConfirmationStep({
  data,
  selectedAlternatives,
}: {
  data: MedicationCarePlanResponse;
  selectedAlternatives: SelectedAlternative[];
}) {
  return (
    <div style={confirmationContainerStyle}>
      <div style={confirmSectionStyle}>
        <p style={confirmLabelStyle}>リスク薬剤</p>
        <p style={confirmValueStyle}>
          {data.riskDrugMatches.length > 0
            ? `${data.riskDrugMatches.length}件のリスク薬剤が処方されています`
            : "リスク薬剤は処方されていません"}
        </p>
      </div>

      <div style={confirmSectionStyle}>
        <p style={confirmLabelStyle}>オピオイド薬剤</p>
        <p style={confirmValueStyle}>
          {data.opioidDrugs.length > 0
            ? `${data.opioidDrugs.length}件のオピオイド薬剤が処方されています`
            : "オピオイド薬剤は処方されていません"}
        </p>
      </div>

      <div style={confirmSectionStyle}>
        <p style={confirmLabelStyle}>代替薬剤提案</p>
        {selectedAlternatives.length > 0 ? (
          <div>
            {selectedAlternatives.map((alt) => (
              <p key={alt.originalPrescriptionId} style={confirmValueStyle}>
                {alt.originalDrugName} → {alt.alternativeDrugName}
              </p>
            ))}
          </div>
        ) : (
          <p style={confirmValueStyle}>代替薬剤の選択はありません</p>
        )}
      </div>
    </div>
  );
}

/**
 * 指示内容サマリーを生成する
 */
function generateInstructionsSummary(
  data: MedicationCarePlanResponse,
  selectedAlternatives: SelectedAlternative[],
): string {
  const parts: string[] = [];

  if (data.riskDrugMatches.length > 0) {
    parts.push(`リスク薬剤 ${data.riskDrugMatches.length}件を確認`);
  }

  if (data.opioidDrugs.length > 0) {
    parts.push(`オピオイド薬剤 ${data.opioidDrugs.length}件を確認`);
  }

  if (selectedAlternatives.length > 0) {
    const altSummary = selectedAlternatives
      .map((a) => `${a.originalDrugName} → ${a.alternativeDrugName}`)
      .join("、");
    parts.push(`代替薬剤提案: ${altSummary}`);
  }

  return parts.join("。") || "薬剤評価を完了";
}
