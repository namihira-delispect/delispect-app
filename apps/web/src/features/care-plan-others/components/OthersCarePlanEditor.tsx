"use client";

import { useState, useEffect, useCallback, type CSSProperties } from "react";
import type { OthersCategoryType, ChecklistSaveData, GetOthersCarePlanResponse } from "../types";
import {
  OTHERS_CATEGORY_LABELS,
  OTHERS_CATEGORY_DESCRIPTIONS,
  OTHERS_CHECKLIST_OPTIONS,
} from "../types";
import { ChecklistForm } from "./ChecklistForm";

export interface OthersCarePlanEditorProps {
  /** 入院ID */
  admissionId: number;
  /** カテゴリー */
  category: OthersCategoryType;
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

const successMessageStyle: CSSProperties = {
  padding: "0.75rem 1rem",
  backgroundColor: "#f0fdf4",
  color: "#16a34a",
  borderRadius: "0.375rem",
  fontSize: "0.875rem",
  fontWeight: 500,
  marginBottom: "1rem",
  border: "1px solid #bbf7d0",
};

/**
 * その他カテゴリ ケアプラン編集コンポーネント
 *
 * 入院ID+カテゴリーに基づいて、チェックリスト形式のケアプラン作成画面を表示する。
 * API経由でデータの取得・保存を行う。
 */
export function OthersCarePlanEditor({ admissionId, category }: OthersCarePlanEditorProps) {
  const [data, setData] = useState<GetOthersCarePlanResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `/api/care-plan/others?admissionId=${admissionId}&category=${category}`,
      );
      if (!response.ok) {
        const responseData = await response.json();
        throw new Error(responseData.error ?? "取得に失敗しました");
      }
      const responseData = await response.json();
      setData(responseData.item ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "ケアプランアイテムの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, [admissionId, category]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleSave = async (checklist: ChecklistSaveData) => {
    if (!data) return;

    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      const response = await fetch("/api/care-plan/others", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: data.itemId,
          checklist,
        }),
      });

      if (!response.ok) {
        const responseData = await response.json();
        throw new Error(responseData.error ?? "保存に失敗しました");
      }

      setSuccessMessage("ケアプランを保存しました");
      // 最新データを再取得
      await fetchData();
    } catch (e) {
      setError(e instanceof Error ? e.message : "ケアプランの保存に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  const categoryLabel = OTHERS_CATEGORY_LABELS[category];
  const categoryDescription = OTHERS_CATEGORY_DESCRIPTIONS[category];
  const options = OTHERS_CHECKLIST_OPTIONS[category];

  if (loading) {
    return <div style={loadingStyle}>読み込み中...</div>;
  }

  if (error && !data) {
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

      {successMessage && <div style={successMessageStyle}>{successMessage}</div>}

      {error && (
        <div style={{ ...errorStyle, textAlign: "left", marginBottom: "1rem" }}>{error}</div>
      )}

      <ChecklistForm
        categoryLabel={categoryLabel}
        categoryDescription={categoryDescription}
        options={options}
        initialData={data?.checklist ?? null}
        saving={saving}
        onSave={(checklist) => void handleSave(checklist)}
      />
    </div>
  );
}
