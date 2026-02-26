"use client";

import { useState, useCallback, type CSSProperties, type FormEvent } from "react";

export interface SearchFormProps {
  /** 検索プレースホルダー */
  placeholder?: string;
  /** 初期値 */
  defaultValue?: string;
  /** 検索実行時のコールバック */
  onSearch: (query: string) => void;
  /** クリア時のコールバック */
  onClear?: () => void;
}

const formStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
};

const inputStyle: CSSProperties = {
  padding: "0.5rem 0.75rem",
  border: "1px solid #cbd5e1",
  borderRadius: "0.375rem",
  fontSize: "0.875rem",
  minWidth: "16rem",
  outline: "none",
};

const searchButtonStyle: CSSProperties = {
  padding: "0.5rem 1rem",
  backgroundColor: "#3b82f6",
  color: "#ffffff",
  border: "none",
  borderRadius: "0.375rem",
  fontSize: "0.875rem",
  cursor: "pointer",
};

const clearButtonStyle: CSSProperties = {
  padding: "0.5rem 0.75rem",
  backgroundColor: "#f1f5f9",
  color: "#475569",
  border: "1px solid #cbd5e1",
  borderRadius: "0.375rem",
  fontSize: "0.875rem",
  cursor: "pointer",
};

/**
 * 検索フォームコンポーネント
 *
 * テキスト入力 + 検索ボタン + クリアボタンを提供する。
 */
export function SearchForm({
  placeholder = "検索...",
  defaultValue = "",
  onSearch,
  onClear,
}: SearchFormProps) {
  const [query, setQuery] = useState(defaultValue);

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      onSearch(query.trim());
    },
    [query, onSearch],
  );

  const handleClear = useCallback(() => {
    setQuery("");
    onClear?.();
    onSearch("");
  }, [onClear, onSearch]);

  return (
    <form style={formStyle} onSubmit={handleSubmit} role="search">
      <input
        type="text"
        style={inputStyle}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        aria-label="検索キーワード"
      />
      <button type="submit" style={searchButtonStyle}>
        検索
      </button>
      {query && (
        <button type="button" style={clearButtonStyle} onClick={handleClear}>
          クリア
        </button>
      )}
    </form>
  );
}
