"use client";

import { useState, useEffect, useCallback, type CSSProperties } from "react";
import type {
  ConstipationAssessmentData,
  ConstipationDetails,
  ConstipationQuestionId,
} from "../types";
import { ConstipationForm } from "./ConstipationForm";
import { ConstipationResultView } from "./ConstipationResultView";

export interface ConstipationPageClientProps {
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
 * 便秘ケアプランページのクライアントコンポーネント
 *
 * 既存データの取得、フォーム表示、保存結果表示を管理する。
 */
export function ConstipationPageClient({ admissionId }: ConstipationPageClientProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [completedDetails, setCompletedDetails] = useState<ConstipationDetails | null>(null);
  const [initialData, setInitialData] = useState<Partial<ConstipationAssessmentData> | undefined>(
    undefined,
  );
  const [initialQuestionId, setInitialQuestionId] = useState<ConstipationQuestionId | undefined>(
    undefined,
  );

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/care-plan/constipation?admissionId=${admissionId}`);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "取得に失敗しました");
      }
      const data = await response.json();

      if (data.details) {
        // 完了済みの場合は結果表示
        setCompletedDetails(data.details as ConstipationDetails);
      } else if (data.assessment) {
        // 途中保存データがある場合
        setInitialData(data.assessment as Partial<ConstipationAssessmentData>);
        if (data.currentQuestionId) {
          setInitialQuestionId(data.currentQuestionId as ConstipationQuestionId);
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "便秘アセスメントデータの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, [admissionId]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleSave = async (data: ConstipationAssessmentData) => {
    try {
      setSaving(true);
      setError(null);
      const response = await fetch("/api/care-plan/constipation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admissionId, assessment: data }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error ?? "保存に失敗しました");
      }

      const result = await response.json();
      setCompletedDetails(result.details as ConstipationDetails);
    } catch (e) {
      setError(e instanceof Error ? e.message : "便秘ケアプランの保存に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  const handleProgressUpdate = useCallback(
    (questionId: ConstipationQuestionId) => {
      // 進捗更新（fire-and-forget）
      void fetch("/api/care-plan/constipation", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admissionId, currentQuestionId: questionId }),
      });
    },
    [admissionId],
  );

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

  return (
    <div style={containerStyle}>
      <a href={`/admissions/${admissionId}/care-plan`} style={backLinkStyle}>
        &larr; ケアプラン一覧に戻る
      </a>

      {completedDetails ? (
        <ConstipationResultView details={completedDetails} admissionId={admissionId} />
      ) : (
        <ConstipationForm
          admissionId={admissionId}
          initialData={initialData}
          initialQuestionId={initialQuestionId}
          onSave={handleSave}
          onProgressUpdate={handleProgressUpdate}
          saving={saving}
        />
      )}
    </div>
  );
}
