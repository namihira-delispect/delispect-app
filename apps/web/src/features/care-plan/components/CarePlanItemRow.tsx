"use client";

import type { CSSProperties } from "react";
import type { CarePlanItemEntry, CarePlanItemStatusType, CarePlanCategoryType } from "../types";
import {
  CARE_PLAN_CATEGORY_LABELS,
  CARE_PLAN_CATEGORY_DESCRIPTIONS,
  CARE_PLAN_ITEM_STATUS_LABELS,
} from "../types";

export interface CarePlanItemRowProps {
  item: CarePlanItemEntry;
  admissionId: number;
}

const rowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "0.75rem 1rem",
  borderBottom: "1px solid #e2e8f0",
  backgroundColor: "#ffffff",
};

const categoryInfoStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.25rem",
  flex: 1,
};

const categoryNameStyle: CSSProperties = {
  fontSize: "0.875rem",
  fontWeight: 600,
  color: "#1e293b",
};

const categoryDescStyle: CSSProperties = {
  fontSize: "0.75rem",
  color: "#64748b",
};

const statusActionsStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
};

function getStatusBadgeStyle(status: CarePlanItemStatusType): CSSProperties {
  const colorMap: Record<CarePlanItemStatusType, { bg: string; text: string }> = {
    NOT_STARTED: { bg: "#f1f5f9", text: "#64748b" },
    IN_PROGRESS: { bg: "#fffbeb", text: "#d97706" },
    COMPLETED: { bg: "#f0fdf4", text: "#16a34a" },
    NOT_APPLICABLE: { bg: "#f1f5f9", text: "#94a3b8" },
  };

  const colors = colorMap[status];
  return {
    display: "inline-block",
    padding: "0.25rem 0.75rem",
    borderRadius: "9999px",
    fontSize: "0.75rem",
    fontWeight: 500,
    backgroundColor: colors.bg,
    color: colors.text,
    minWidth: "60px",
    textAlign: "center",
  };
}

const linkStyle: CSSProperties = {
  fontSize: "0.8125rem",
  color: "#3b82f6",
  textDecoration: "none",
  fontWeight: 500,
  padding: "0.375rem 0.75rem",
  borderRadius: "0.375rem",
  border: "1px solid #3b82f6",
  backgroundColor: "transparent",
  cursor: "pointer",
  whiteSpace: "nowrap",
};

/**
 * ケアプランアイテム行コンポーネント
 *
 * 各ケアプランカテゴリーのステータスと作成画面への遷移ボタンを表示する。
 */
export function CarePlanItemRow({ item, admissionId }: CarePlanItemRowProps) {
  const label = CARE_PLAN_CATEGORY_LABELS[item.category as CarePlanCategoryType] ?? item.category;
  const description = CARE_PLAN_CATEGORY_DESCRIPTIONS[item.category as CarePlanCategoryType] ?? "";
  const statusLabel = CARE_PLAN_ITEM_STATUS_LABELS[item.status] ?? item.status;

  const buttonLabel =
    item.status === "NOT_STARTED"
      ? "ケアプラン作成"
      : item.status === "IN_PROGRESS"
        ? "続きを入力"
        : "詳細を確認";

  return (
    <div style={rowStyle}>
      <div style={categoryInfoStyle}>
        <span style={categoryNameStyle}>{label}</span>
        <span style={categoryDescStyle}>{description}</span>
      </div>
      <div style={statusActionsStyle}>
        <span style={getStatusBadgeStyle(item.status)}>{statusLabel}</span>
        <a
          href={`/admissions/${admissionId}/care-plan/${item.category.toLowerCase()}`}
          style={linkStyle}
        >
          {buttonLabel}
        </a>
      </div>
    </div>
  );
}
