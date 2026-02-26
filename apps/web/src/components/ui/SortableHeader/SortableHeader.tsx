"use client";

import type { SortDirection } from "@/shared/constants";

type SortableHeaderProps = {
  /** カラム名 */
  label: string;
  /** ソートキー */
  sortKey: string;
  /** 現在のソートキー */
  currentSortKey?: string;
  /** 現在のソート方向 */
  currentSortDirection?: SortDirection;
  /** ソート変更時のコールバック */
  onSort: (key: string, direction: SortDirection) => void;
};

/**
 * ソート可能なテーブルヘッダーコンポーネント
 *
 * クリックでソート方向を切り替える。
 * 現在のソート状態をアイコンで表示する。
 */
export function SortableHeader({
  label,
  sortKey,
  currentSortKey,
  currentSortDirection,
  onSort,
}: SortableHeaderProps) {
  const isActive = currentSortKey === sortKey;

  const handleClick = () => {
    if (isActive && currentSortDirection === "asc") {
      onSort(sortKey, "desc");
    } else {
      onSort(sortKey, "asc");
    }
  };

  return (
    <button
      onClick={handleClick}
      style={styles.button}
      data-testid={`sort-header-${sortKey}`}
      aria-label={`${label}でソート`}
    >
      <span>{label}</span>
      <span style={styles.indicator} aria-hidden="true">
        {isActive ? (currentSortDirection === "asc" ? " \u25B2" : " \u25BC") : " \u25BD"}
      </span>
    </button>
  );
}

const styles: Record<string, React.CSSProperties> = {
  button: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.25rem",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "0.8125rem",
    fontWeight: "600",
    color: "#374151",
    padding: "0.25rem 0",
    whiteSpace: "nowrap",
  },
  indicator: {
    fontSize: "0.625rem",
    color: "#9ca3af",
  },
};
