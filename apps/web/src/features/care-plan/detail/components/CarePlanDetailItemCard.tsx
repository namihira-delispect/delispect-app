"use client";

import type { CSSProperties } from "react";
import type { CarePlanItemDetail } from "../types";
import { CARE_PLAN_CATEGORY_LABELS, CARE_PLAN_ITEM_STATUS_LABELS } from "../../types";

export interface CarePlanDetailItemCardProps {
  /** ケアプランアイテム詳細 */
  item: CarePlanItemDetail;
}

const cardStyle: CSSProperties = {
  border: "1px solid #e2e8f0",
  borderRadius: "0.5rem",
  backgroundColor: "#ffffff",
  padding: "1rem",
  marginBottom: "0.75rem",
};

const headerStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "0.75rem",
};

const categoryLabelStyle: CSSProperties = {
  fontSize: "1rem",
  fontWeight: 600,
  color: "#1e293b",
};

const statusBadgeBase: CSSProperties = {
  display: "inline-block",
  padding: "0.125rem 0.5rem",
  borderRadius: "0.25rem",
  fontSize: "0.75rem",
  fontWeight: 500,
};

const STATUS_BADGE_COLORS: Record<string, CSSProperties> = {
  NOT_STARTED: { ...statusBadgeBase, backgroundColor: "#f1f5f9", color: "#64748b" },
  IN_PROGRESS: { ...statusBadgeBase, backgroundColor: "#dbeafe", color: "#2563eb" },
  COMPLETED: { ...statusBadgeBase, backgroundColor: "#dcfce7", color: "#16a34a" },
  NOT_APPLICABLE: { ...statusBadgeBase, backgroundColor: "#f5f5f4", color: "#a8a29e" },
};

const sectionTitleStyle: CSSProperties = {
  fontSize: "0.8125rem",
  fontWeight: 600,
  color: "#475569",
  marginBottom: "0.375rem",
  marginTop: "0.5rem",
};

const instructionsStyle: CSSProperties = {
  fontSize: "0.8125rem",
  color: "#334155",
  whiteSpace: "pre-wrap",
  backgroundColor: "#f8fafc",
  padding: "0.5rem 0.75rem",
  borderRadius: "0.25rem",
  lineHeight: 1.6,
};

const noDataStyle: CSSProperties = {
  fontSize: "0.8125rem",
  color: "#94a3b8",
  fontStyle: "italic",
};

const timestampStyle: CSSProperties = {
  fontSize: "0.75rem",
  color: "#94a3b8",
  marginTop: "0.5rem",
};

/**
 * ケアプラン詳細のアイテムカードコンポーネント
 *
 * 各カテゴリーのアセスメント入力内容と指示内容を表示する。
 */
export function CarePlanDetailItemCard({ item }: CarePlanDetailItemCardProps) {
  const categoryLabel = CARE_PLAN_CATEGORY_LABELS[item.category] ?? item.category;
  const statusLabel = CARE_PLAN_ITEM_STATUS_LABELS[item.status] ?? item.status;
  const badgeStyle = STATUS_BADGE_COLORS[item.status] ?? statusBadgeBase;

  const isActive = item.status === "COMPLETED" || item.status === "IN_PROGRESS";

  return (
    <div style={cardStyle} data-testid={`care-plan-detail-item-${item.category}`}>
      <div style={headerStyle}>
        <span style={categoryLabelStyle}>{categoryLabel}</span>
        <span style={badgeStyle}>{statusLabel}</span>
      </div>

      {isActive ? (
        <>
          {item.instructions && (
            <>
              <div style={sectionTitleStyle}>アセスメント結果</div>
              <div style={instructionsStyle}>{item.instructions}</div>
            </>
          )}

          {!item.instructions && <div style={noDataStyle}>アセスメント結果なし</div>}

          <div style={timestampStyle}>更新日時: {formatDateTime(item.updatedAt)}</div>
        </>
      ) : (
        <div style={noDataStyle}>{item.status === "NOT_APPLICABLE" ? "該当なし" : "未実施"}</div>
      )}
    </div>
  );
}

function formatDateTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}/${month}/${day} ${hours}:${minutes}`;
  } catch {
    return isoString;
  }
}
