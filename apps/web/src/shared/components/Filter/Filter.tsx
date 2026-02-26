"use client";

import { type CSSProperties } from "react";

export interface FilterOption {
  /** 値 */
  value: string;
  /** 表示ラベル */
  label: string;
}

export interface FilterProps {
  /** フィルター名 */
  label: string;
  /** 選択肢 */
  options: FilterOption[];
  /** 現在の選択値 */
  value: string;
  /** 変更時のコールバック */
  onChange: (value: string) => void;
  /** 「全て」の選択肢を含めるか（デフォルト: true） */
  showAll?: boolean;
}

const containerStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  fontSize: "0.875rem",
};

const labelStyle: CSSProperties = {
  color: "#475569",
  fontWeight: 500,
  whiteSpace: "nowrap",
};

const selectStyle: CSSProperties = {
  padding: "0.375rem 0.5rem",
  border: "1px solid #cbd5e1",
  borderRadius: "0.375rem",
  fontSize: "0.875rem",
  color: "#1e293b",
  backgroundColor: "#ffffff",
};

/**
 * フィルターコンポーネント
 *
 * セレクトボックスでフィルタリング条件を選択する。
 */
export function Filter({
  label,
  options,
  value,
  onChange,
  showAll = true,
}: FilterProps) {
  return (
    <div style={containerStyle}>
      <label style={labelStyle} htmlFor={`filter-${label}`}>
        {label}:
      </label>
      <select
        id={`filter-${label}`}
        style={selectStyle}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={`${label}フィルター`}
      >
        {showAll && <option value="">すべて</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
