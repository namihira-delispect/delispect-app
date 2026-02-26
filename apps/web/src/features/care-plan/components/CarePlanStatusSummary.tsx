import type { CSSProperties } from "react";
import type { CarePlanOverallStatus, CarePlanItemStatusType } from "../types";
import { CARE_PLAN_OVERALL_STATUS_LABELS } from "../types";

export interface CarePlanStatusSummaryProps {
  overallStatus: CarePlanOverallStatus;
  itemStatuses: CarePlanItemStatusType[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

const containerStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "1rem",
  backgroundColor: "#f8fafc",
  borderRadius: "0.5rem",
  marginBottom: "1rem",
};

const statusGroupStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "1rem",
};

const overallLabelStyle: CSSProperties = {
  fontSize: "0.875rem",
  color: "#475569",
  fontWeight: 500,
};

function getOverallStatusBadgeStyle(status: CarePlanOverallStatus): CSSProperties {
  const colorMap: Record<CarePlanOverallStatus, { bg: string; text: string }> = {
    NOT_STARTED: { bg: "#f1f5f9", text: "#64748b" },
    IN_PROGRESS: { bg: "#fffbeb", text: "#d97706" },
    COMPLETED: { bg: "#f0fdf4", text: "#16a34a" },
  };

  const colors = colorMap[status];
  return {
    display: "inline-block",
    padding: "0.25rem 0.75rem",
    borderRadius: "9999px",
    fontSize: "0.8125rem",
    fontWeight: 600,
    backgroundColor: colors.bg,
    color: colors.text,
  };
}

const progressStyle: CSSProperties = {
  display: "flex",
  gap: "0.75rem",
  fontSize: "0.75rem",
  color: "#64748b",
};

const metaStyle: CSSProperties = {
  display: "flex",
  gap: "1rem",
  fontSize: "0.75rem",
  color: "#94a3b8",
};

/**
 * 日時をフォーマットする
 */
function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${y}/${m}/${d} ${h}:${min}`;
}

/**
 * ケアプランステータスサマリーコンポーネント
 *
 * ケアプラン全体のステータスと進捗、作成者情報を表示する。
 */
export function CarePlanStatusSummary({
  overallStatus,
  itemStatuses,
  createdBy,
  createdAt,
  updatedAt,
}: CarePlanStatusSummaryProps) {
  const completedCount = itemStatuses.filter(
    (s) => s === "COMPLETED" || s === "NOT_APPLICABLE",
  ).length;
  const inProgressCount = itemStatuses.filter((s) => s === "IN_PROGRESS").length;
  const notStartedCount = itemStatuses.filter((s) => s === "NOT_STARTED").length;
  const totalCount = itemStatuses.length;

  return (
    <div style={containerStyle}>
      <div style={statusGroupStyle}>
        <span style={overallLabelStyle}>全体ステータス:</span>
        <span style={getOverallStatusBadgeStyle(overallStatus)}>
          {CARE_PLAN_OVERALL_STATUS_LABELS[overallStatus]}
        </span>
        <div style={progressStyle}>
          <span>
            完了: {completedCount}/{totalCount}
          </span>
          <span>実施中: {inProgressCount}</span>
          <span>未実施: {notStartedCount}</span>
        </div>
      </div>
      <div style={metaStyle}>
        <span>作成者: {createdBy}</span>
        <span>作成: {formatDateTime(createdAt)}</span>
        <span>更新: {formatDateTime(updatedAt)}</span>
      </div>
    </div>
  );
}
