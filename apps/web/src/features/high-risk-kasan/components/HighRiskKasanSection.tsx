"use client";

import { useState, useCallback, useEffect, type CSSProperties } from "react";
import type { HighRiskKasanAssessmentDisplay } from "../types";
import { getHighRiskKasanAction } from "../server-actions/getHighRiskKasanAction";
import { saveHighRiskKasanAction } from "../server-actions/saveHighRiskKasanAction";
import { HighRiskKasanAssessmentForm } from "./HighRiskKasanAssessmentForm";

export interface HighRiskKasanSectionProps {
  /** 入院ID */
  admissionId: number;
}

const loadingStyle: CSSProperties = {
  padding: "1rem",
  textAlign: "center",
  color: "#64748b",
  fontSize: "0.875rem",
};

const errorStyle: CSSProperties = {
  padding: "0.75rem",
  backgroundColor: "#fef2f2",
  color: "#991b1b",
  borderRadius: "0.375rem",
  fontSize: "0.875rem",
};

const successStyle: CSSProperties = {
  padding: "0.75rem",
  backgroundColor: "#f0fdf4",
  color: "#166534",
  borderRadius: "0.375rem",
  fontSize: "0.875rem",
  marginBottom: "0.5rem",
};

/**
 * せん妄ハイリスクケア加算アセスメントセクション
 *
 * 患者入院詳細画面のサブセクションとして、
 * アセスメント情報の取得・表示・保存を管理する。
 */
export function HighRiskKasanSection({ admissionId }: HighRiskKasanSectionProps) {
  const [assessment, setAssessment] = useState<HighRiskKasanAssessmentDisplay | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // アセスメント情報の取得
  const fetchAssessment = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getHighRiskKasanAction({ admissionId });
      if (result.success) {
        setAssessment(result.value);
      } else {
        setError(
          typeof result.value.cause === "string"
            ? result.value.cause
            : "アセスメント情報の取得に失敗しました",
        );
      }
    } catch {
      setError("アセスメント情報の取得中にエラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  }, [admissionId]);

  // 初回ロード
  useEffect(() => {
    fetchAssessment();
  }, [fetchAssessment]);

  // アセスメント保存
  const handleSave = useCallback(
    async (medicalHistoryItems: {
      hasDementia: boolean;
      hasOrganicBrainDamage: boolean;
      isHeavyAlcohol: boolean;
      hasDeliriumHistory: boolean;
      hasGeneralAnesthesia: boolean;
    }) => {
      setIsSaving(true);
      setError(null);
      setSuccessMessage(null);

      try {
        const result = await saveHighRiskKasanAction({
          admissionId,
          medicalHistoryItems,
        });

        if (result.success) {
          setAssessment(result.value);
          setSuccessMessage("アセスメント結果を保存しました");
          // 3秒後にメッセージを消す
          setTimeout(() => setSuccessMessage(null), 3000);
        } else {
          setError(
            typeof result.value.cause === "string"
              ? result.value.cause
              : "アセスメントの保存に失敗しました",
          );
        }
      } catch {
        setError("アセスメントの保存中にエラーが発生しました");
      } finally {
        setIsSaving(false);
      }
    },
    [admissionId],
  );

  if (isLoading) {
    return <div style={loadingStyle}>アセスメント情報を読み込み中...</div>;
  }

  if (error && !assessment) {
    return <div style={errorStyle}>{error}</div>;
  }

  if (!assessment) {
    return null;
  }

  return (
    <div>
      {successMessage && <div style={successStyle}>{successMessage}</div>}
      {error && <div style={errorStyle}>{error}</div>}
      <HighRiskKasanAssessmentForm
        assessment={assessment}
        onSave={handleSave}
        isSaving={isSaving}
      />
    </div>
  );
}
