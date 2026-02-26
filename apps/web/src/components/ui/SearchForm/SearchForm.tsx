"use client";

import { useState } from "react";

type SearchFormProps = {
  /** 検索実行時のコールバック */
  onSearch: (query: string) => void;
  /** プレースホルダーテキスト */
  placeholder?: string;
  /** 初期値 */
  defaultValue?: string;
  /** 無効化フラグ */
  disabled?: boolean;
};

/**
 * 共通検索フォームコンポーネント
 *
 * テキスト入力による検索機能を提供する。
 * Enter キーまたは検索ボタンで検索を実行する。
 */
export function SearchForm({
  onSearch,
  placeholder = "検索...",
  defaultValue = "",
  disabled = false,
}: SearchFormProps) {
  const [query, setQuery] = useState(defaultValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query.trim());
  };

  const handleClear = () => {
    setQuery("");
    onSearch("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={styles.form}
      role="search"
      data-testid="search-form"
    >
      <div style={styles.inputWrapper}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          style={styles.input}
          data-testid="search-input"
          aria-label="検索"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            style={styles.clearButton}
            data-testid="search-clear-button"
            aria-label="検索条件をクリア"
          >
            &times;
          </button>
        )}
      </div>
      <button
        type="submit"
        disabled={disabled}
        style={styles.searchButton}
        data-testid="search-submit-button"
      >
        検索
      </button>
    </form>
  );
}

const styles: Record<string, React.CSSProperties> = {
  form: {
    display: "flex",
    gap: "0.5rem",
    alignItems: "center",
  },
  inputWrapper: {
    position: "relative",
    flex: 1,
  },
  input: {
    width: "100%",
    padding: "0.5rem 2rem 0.5rem 0.75rem",
    border: "1px solid #d1d5db",
    borderRadius: "4px",
    fontSize: "0.875rem",
    outline: "none",
    boxSizing: "border-box",
  },
  clearButton: {
    position: "absolute",
    right: "0.5rem",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "1.125rem",
    color: "#9ca3af",
    padding: "0 0.25rem",
    lineHeight: 1,
  },
  searchButton: {
    padding: "0.5rem 1rem",
    backgroundColor: "#1a1a2e",
    color: "#ffffff",
    border: "none",
    borderRadius: "4px",
    fontSize: "0.875rem",
    cursor: "pointer",
    whiteSpace: "nowrap",
    flexShrink: 0,
  },
};
