"use client";

import { useState } from "react";

/** フィルターオプションの型 */
export type FilterOption = {
  /** オプションの値 */
  value: string;
  /** 表示ラベル */
  label: string;
};

/** フィルター定義の型 */
export type FilterDefinition = {
  /** フィルターキー */
  key: string;
  /** フィルター表示名 */
  label: string;
  /** 選択肢 */
  options: FilterOption[];
};

type FilterPanelProps = {
  /** フィルター定義の配列 */
  filters: FilterDefinition[];
  /** 現在のフィルター値 */
  values: Record<string, string>;
  /** フィルター変更時のコールバック */
  onFilterChange: (key: string, value: string) => void;
  /** フィルタークリア時のコールバック */
  onClear: () => void;
};

/**
 * 共通フィルターパネルコンポーネント
 *
 * 複数のフィルター条件を表示し、選択によるフィルタリングを提供する。
 */
export function FilterPanel({
  filters,
  values,
  onFilterChange,
  onClear,
}: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasActiveFilters = Object.values(values).some((v) => v !== "");

  return (
    <div style={styles.container} data-testid="filter-panel">
      <div style={styles.header}>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          style={styles.toggleButton}
          data-testid="filter-toggle"
          aria-expanded={isExpanded}
        >
          フィルター
          {hasActiveFilters && (
            <span style={styles.activeBadge} data-testid="filter-active-badge">
              {Object.values(values).filter((v) => v !== "").length}
            </span>
          )}
          <span
            style={{
              ...styles.chevron,
              ...(isExpanded ? styles.chevronOpen : {}),
            }}
            aria-hidden="true"
          >
            &#9662;
          </span>
        </button>
        {hasActiveFilters && (
          <button
            onClick={onClear}
            style={styles.clearButton}
            data-testid="filter-clear-button"
          >
            クリア
          </button>
        )}
      </div>

      {isExpanded && (
        <div style={styles.filtersContainer} data-testid="filter-options">
          {filters.map((filter) => (
            <div key={filter.key} style={styles.filterGroup}>
              <label
                htmlFor={`filter-${filter.key}`}
                style={styles.filterLabel}
              >
                {filter.label}
              </label>
              <select
                id={`filter-${filter.key}`}
                value={values[filter.key] ?? ""}
                onChange={(e) => onFilterChange(filter.key, e.target.value)}
                style={styles.filterSelect}
                data-testid={`filter-select-${filter.key}`}
              >
                <option value="">すべて</option>
                {filter.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    border: "1px solid #e5e7eb",
    borderRadius: "4px",
    backgroundColor: "#ffffff",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0.5rem 0.75rem",
  },
  toggleButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "0.875rem",
    fontWeight: "500",
    color: "#374151",
    padding: 0,
  },
  activeBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "1.25rem",
    height: "1.25rem",
    borderRadius: "9999px",
    backgroundColor: "#1a1a2e",
    color: "#ffffff",
    fontSize: "0.6875rem",
    fontWeight: "600",
  },
  chevron: {
    fontSize: "0.625rem",
    transition: "transform 0.2s",
    transform: "rotate(-90deg)",
  },
  chevronOpen: {
    transform: "rotate(0deg)",
  },
  clearButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "0.8125rem",
    color: "#6b7280",
    textDecoration: "underline",
    padding: 0,
  },
  filtersContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "1rem",
    padding: "0.75rem",
    borderTop: "1px solid #e5e7eb",
  },
  filterGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
    minWidth: "160px",
  },
  filterLabel: {
    fontSize: "0.75rem",
    fontWeight: "500",
    color: "#6b7280",
  },
  filterSelect: {
    padding: "0.375rem 0.5rem",
    border: "1px solid #d1d5db",
    borderRadius: "4px",
    fontSize: "0.8125rem",
    color: "#374151",
    backgroundColor: "#ffffff",
  },
};
