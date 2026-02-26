"use client";

import { useState, useEffect, useCallback, type CSSProperties } from "react";
import type { CarePlanListResponse } from "../types";
import { CarePlanItemRow } from "./CarePlanItemRow";
import { CarePlanStatusSummary } from "./CarePlanStatusSummary";

export interface CarePlanListViewerProps {
  admissionId: number;
}

const containerStyle: CSSProperties = {
  maxWidth: "100%",
};

const cardStyle: CSSProperties = {
  border: "1px solid #e2e8f0",
  borderRadius: "0.5rem",
  backgroundColor: "#ffffff",
  overflow: "hidden",
};

const headerStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "1rem",
  borderBottom: "1px solid #e2e8f0",
};

const titleStyle: CSSProperties = {
  fontSize: "1.125rem",
  fontWeight: 600,
  color: "#1e293b",
};

const createButtonStyle: CSSProperties = {
  padding: "0.5rem 1rem",
  backgroundColor: "#3b82f6",
  color: "#ffffff",
  border: "none",
  borderRadius: "0.375rem",
  fontSize: "0.875rem",
  fontWeight: 500,
  cursor: "pointer",
};

const createButtonDisabledStyle: CSSProperties = {
  ...createButtonStyle,
  backgroundColor: "#94a3b8",
  cursor: "not-allowed",
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

const emptyStyle: CSSProperties = {
  textAlign: "center",
  padding: "3rem 2rem",
  color: "#64748b",
};

const emptyTitleStyle: CSSProperties = {
  fontSize: "1rem",
  fontWeight: 600,
  color: "#475569",
  marginBottom: "0.5rem",
};

const emptyDescStyle: CSSProperties = {
  fontSize: "0.875rem",
  color: "#94a3b8",
  marginBottom: "1.5rem",
};

const backLinkStyle: CSSProperties = {
  display: "inline-block",
  fontSize: "0.8125rem",
  color: "#3b82f6",
  textDecoration: "none",
  marginBottom: "1rem",
};

/**
 * ケアプラン一覧ビューワーコンポーネント
 *
 * 入院IDに対応するケアプランの各項目を一覧表示する。
 * ケアプランが未作成の場合は作成ボタンを表示する。
 */
export function CarePlanListViewer({ admissionId }: CarePlanListViewerProps) {
  const [carePlan, setCarePlan] = useState<CarePlanListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const fetchCarePlan = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/care-plan?admissionId=${admissionId}`);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "取得に失敗しました");
      }
      const data = await response.json();
      setCarePlan(data.carePlan ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "ケアプラン情報の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, [admissionId]);

  useEffect(() => {
    void fetchCarePlan();
  }, [fetchCarePlan]);

  const handleCreate = async () => {
    try {
      setCreating(true);
      setError(null);
      const response = await fetch("/api/care-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admissionId }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "作成に失敗しました");
      }
      // 作成後にケアプランを再取得
      await fetchCarePlan();
    } catch (e) {
      setError(e instanceof Error ? e.message : "ケアプランの作成に失敗しました");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return <div style={loadingStyle}>読み込み中...</div>;
  }

  if (error) {
    return (
      <div style={errorStyle}>
        <p>{error}</p>
        <button
          onClick={() => void fetchCarePlan()}
          style={{ ...createButtonStyle, marginTop: "0.5rem" }}
        >
          再試行
        </button>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <a href={`/admissions/${admissionId}`} style={backLinkStyle}>
        &larr; 入院詳細に戻る
      </a>

      {!carePlan ? (
        <div style={cardStyle}>
          <div style={emptyStyle}>
            <p style={emptyTitleStyle}>ケアプランが作成されていません</p>
            <p style={emptyDescStyle}>
              ケアプラン作成ボタンを押すと、10カテゴリーのケアプランアイテムが自動生成されます。
            </p>
            <button
              onClick={() => void handleCreate()}
              disabled={creating}
              style={creating ? createButtonDisabledStyle : createButtonStyle}
            >
              {creating ? "作成中..." : "ケアプラン作成"}
            </button>
          </div>
        </div>
      ) : (
        <>
          <CarePlanStatusSummary
            overallStatus={carePlan.overallStatus}
            itemStatuses={carePlan.items.map((item) => item.status)}
            createdBy={carePlan.createdBy}
            createdAt={carePlan.createdAt}
            updatedAt={carePlan.updatedAt}
          />

          <div style={cardStyle}>
            <div style={headerStyle}>
              <span style={titleStyle}>ケアプラン項目一覧</span>
            </div>
            {carePlan.items.map((item) => (
              <CarePlanItemRow key={item.id} item={item} admissionId={admissionId} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
