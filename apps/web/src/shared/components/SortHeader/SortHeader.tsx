"use client";

import type { CSSProperties } from "react";
import type { SortDirection } from "@/shared/types";

export interface SortHeaderProps {
  /** カラム表示名 */
  label: string;
  /** カラムキー */
  columnKey: string;
  /** 現在のソートカラム */
  currentSortColumn: string | null;
  /** 現在のソート方向 */
  currentSortDirection: SortDirection;
  /** ソート変更時のコールバック */
  onSort: (column: string, direction: SortDirection) => void;
}

const headerStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.25rem",
  cursor: "pointer",
  userSelect: "none",
  fontSize: "0.875rem",
  fontWeight: 600,
  color: "#1e293b",
};

const arrowStyle = (active: boolean): CSSProperties => ({
  fontSize: "0.625rem",
  color: active ? "#3b82f6" : "#94a3b8",
  lineHeight: 1,
});

/**
 * ソートヘッダーコンポーネント
 *
 * テーブルヘッダーに配置し、クリックでソート方向を切り替える。
 */
export function SortHeader({
  label,
  columnKey,
  currentSortColumn,
  currentSortDirection,
  onSort,
}: SortHeaderProps) {
  const isActive = currentSortColumn === columnKey;

  const handleClick = () => {
    if (isActive) {
      onSort(columnKey, currentSortDirection === "asc" ? "desc" : "asc");
    } else {
      onSort(columnKey, "asc");
    }
  };

  const sortStatus = isActive
    ? currentSortDirection === "asc"
      ? "ascending"
      : "descending"
    : "none";

  return (
    <button
      type="button"
      style={headerStyle}
      onClick={handleClick}
      aria-label={`${label}でソート`}
      data-sort={sortStatus}
    >
      <span>{label}</span>
      <span
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0",
        }}
      >
        <span style={arrowStyle(isActive && currentSortDirection === "asc")}>
          &#9650;
        </span>
        <span style={arrowStyle(isActive && currentSortDirection === "desc")}>
          &#9660;
        </span>
      </span>
    </button>
  );
}
