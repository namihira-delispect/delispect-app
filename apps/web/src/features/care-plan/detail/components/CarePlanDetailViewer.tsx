"use client";

import { useState, useEffect, useCallback, type CSSProperties } from "react";
import type { CarePlanDetailResponse, TranscriptionHistoryEntry } from "../types";
import { ASSESSMENT_CATEGORIES, OTHER_CATEGORIES, CATEGORY_GROUP_LABELS } from "../types";
import { CarePlanDetailItemCard } from "./CarePlanDetailItemCard";
import { TranscriptionPanel } from "./TranscriptionPanel";

export interface CarePlanDetailViewerProps {
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
  padding: "1rem",
  marginBottom: "1rem",
};

const patientInfoStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: "0.5rem",
  fontSize: "0.875rem",
  color: "#475569",
};

const patientInfoLabelStyle: CSSProperties = {
  fontWeight: 600,
  color: "#1e293b",
};

const sectionTitleStyle: CSSProperties = {
  fontSize: "1.125rem",
  fontWeight: 600,
  color: "#1e293b",
  marginBottom: "0.75rem",
  marginTop: "1rem",
};

const actionBarStyle: CSSProperties = {
  display: "flex",
  gap: "0.5rem",
  marginBottom: "1rem",
  flexWrap: "wrap",
};

const printButtonStyle: CSSProperties = {
  padding: "0.5rem 1rem",
  backgroundColor: "#f1f5f9",
  color: "#475569",
  border: "1px solid #cbd5e1",
  borderRadius: "0.375rem",
  fontSize: "0.8125rem",
  fontWeight: 500,
  cursor: "pointer",
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

const emptyStyle: CSSProperties = {
  textAlign: "center",
  padding: "3rem 2rem",
  color: "#64748b",
};

const printHiddenClassName = "no-print";

/**
 * ケアプラン詳細ビューワーコンポーネント
 *
 * ケアプラン詳細画面のメインコンポーネント。
 * 患者情報、カテゴリー別のアイテム詳細、印刷・転記機能を提供する。
 */
export function CarePlanDetailViewer({ admissionId }: CarePlanDetailViewerProps) {
  const [detail, setDetail] = useState<CarePlanDetailResponse | null>(null);
  const [histories, setHistories] = useState<TranscriptionHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/care-plan/detail?admissionId=${admissionId}`);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "取得に失敗しました");
      }
      const data = await response.json();
      setDetail(data.detail ?? null);
      setHistories(data.histories ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "ケアプラン詳細の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, [admissionId]);

  useEffect(() => {
    void fetchDetail();
  }, [fetchDetail]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleSaveTranscription = useCallback(
    async (content: string) => {
      if (!detail) return;

      const response = await fetch("/api/care-plan/detail/transcription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ carePlanId: detail.carePlanId, content }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "保存に失敗しました");
      }

      // 転記履歴を再取得
      await fetchDetail();
    },
    [detail, fetchDetail],
  );

  if (loading) {
    return <div style={loadingStyle}>読み込み中...</div>;
  }

  if (error) {
    return (
      <div style={errorStyle}>
        <p>{error}</p>
        <button onClick={() => void fetchDetail()} style={retryButtonStyle}>
          再試行
        </button>
      </div>
    );
  }

  if (!detail) {
    return (
      <div style={emptyStyle}>
        <p>ケアプランが見つかりません。</p>
        <a href={`/admissions/${admissionId}/care-plan`} style={backLinkStyle}>
          ケアプラン一覧に戻る
        </a>
      </div>
    );
  }

  const assessmentItems = detail.items.filter((item) =>
    ASSESSMENT_CATEGORIES.includes(item.category),
  );
  const otherItems = detail.items.filter((item) => OTHER_CATEGORIES.includes(item.category));

  return (
    <div style={containerStyle}>
      <a href={`/admissions/${admissionId}/care-plan`} style={backLinkStyle}>
        &larr; ケアプラン一覧に戻る
      </a>

      {/* 患者情報 */}
      <div style={cardStyle}>
        <div style={patientInfoStyle}>
          <div>
            <span style={patientInfoLabelStyle}>患者名: </span>
            {detail.patientName}
          </div>
          <div>
            <span style={patientInfoLabelStyle}>患者ID: </span>
            {detail.patientId}
          </div>
          <div>
            <span style={patientInfoLabelStyle}>入院日: </span>
            {formatDate(detail.admissionDate)}
          </div>
          {detail.ward && (
            <div>
              <span style={patientInfoLabelStyle}>病棟: </span>
              {detail.ward}
              {detail.room ? ` / ${detail.room}` : ""}
            </div>
          )}
          <div>
            <span style={patientInfoLabelStyle}>作成者: </span>
            {detail.createdBy}
          </div>
          <div>
            <span style={patientInfoLabelStyle}>作成日: </span>
            {formatDate(detail.createdAt)}
          </div>
        </div>
      </div>

      {/* アクションバー */}
      <div style={actionBarStyle} className={printHiddenClassName}>
        <button onClick={handlePrint} style={printButtonStyle}>
          印刷 / PDF保存
        </button>
      </div>

      {/* アセスメント項目 */}
      <div style={sectionTitleStyle}>{CATEGORY_GROUP_LABELS.ASSESSMENT}</div>
      {assessmentItems.map((item) => (
        <CarePlanDetailItemCard key={item.id} item={item} />
      ))}

      {/* その他のケア項目 */}
      <div style={sectionTitleStyle}>{CATEGORY_GROUP_LABELS.OTHERS}</div>
      {otherItems.map((item) => (
        <CarePlanDetailItemCard key={item.id} item={item} />
      ))}

      {/* 看護記録転記 */}
      <div className={printHiddenClassName}>
        <TranscriptionPanel
          detail={detail}
          histories={histories}
          onSaveTranscription={handleSaveTranscription}
        />
      </div>
    </div>
  );
}

function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}/${month}/${day}`;
  } catch {
    return isoString;
  }
}
