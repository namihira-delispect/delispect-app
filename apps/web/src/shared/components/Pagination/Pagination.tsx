"use client";

import type { CSSProperties } from "react";
import { PAGE_SIZE_OPTIONS, type PageSize } from "@/shared/types";

export interface PaginationProps {
  /** 現在のページ（1始まり） */
  currentPage: number;
  /** 総ページ数 */
  totalPages: number;
  /** 総件数 */
  totalItems: number;
  /** 1ページあたりの件数 */
  pageSize: PageSize;
  /** ページ変更時のコールバック */
  onPageChange: (page: number) => void;
  /** ページサイズ変更時のコールバック */
  onPageSizeChange: (size: PageSize) => void;
}

const containerStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0.75rem 0",
  fontSize: "0.875rem",
  color: "#475569",
};

const navStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.25rem",
};

const pageButtonStyle = (isActive: boolean, isDisabled: boolean): CSSProperties => ({
  padding: "0.375rem 0.75rem",
  border: "1px solid #cbd5e1",
  borderRadius: "0.25rem",
  backgroundColor: isActive ? "#3b82f6" : "#ffffff",
  color: isActive ? "#ffffff" : isDisabled ? "#94a3b8" : "#475569",
  cursor: isDisabled ? "default" : "pointer",
  fontSize: "0.875rem",
  opacity: isDisabled ? 0.5 : 1,
});

const selectStyle: CSSProperties = {
  padding: "0.375rem 0.5rem",
  border: "1px solid #cbd5e1",
  borderRadius: "0.25rem",
  fontSize: "0.875rem",
  color: "#475569",
};

/**
 * ページネーションコンポーネント
 *
 * 件数選択（自動計算/10/20/50件）とページ遷移を提供する。
 */
export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const effectivePageSize = pageSize === "auto" ? 20 : pageSize;
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * effectivePageSize + 1;
  const endItem = Math.min(currentPage * effectivePageSize, totalItems);

  const getPageNumbers = (): (number | "ellipsis")[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | "ellipsis")[] = [1];

    if (currentPage > 3) {
      pages.push("ellipsis");
    }

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push("ellipsis");
    }

    pages.push(totalPages);

    return pages;
  };

  return (
    <nav style={containerStyle} aria-label="ページネーション">
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <span>
          {totalItems}件中 {startItem}-{endItem}件を表示
        </span>
        <select
          style={selectStyle}
          value={pageSize}
          onChange={(e) => {
            const val = e.target.value;
            onPageSizeChange(val === "auto" ? "auto" : (Number(val) as 10 | 20 | 50));
          }}
          aria-label="表示件数"
        >
          <option value="auto">自動</option>
          {PAGE_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>
              {size}件
            </option>
          ))}
        </select>
      </div>

      <div style={navStyle}>
        <button
          type="button"
          style={pageButtonStyle(false, currentPage <= 1)}
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="前のページ"
        >
          &lt;
        </button>

        {getPageNumbers().map((page, index) =>
          page === "ellipsis" ? (
            <span key={`ellipsis-${index}`} style={{ padding: "0.375rem 0.25rem" }}>
              ...
            </span>
          ) : (
            <button
              key={page}
              type="button"
              style={pageButtonStyle(page === currentPage, false)}
              onClick={() => onPageChange(page)}
              aria-label={`ページ ${page}`}
              aria-current={page === currentPage ? "page" : undefined}
            >
              {page}
            </button>
          ),
        )}

        <button
          type="button"
          style={pageButtonStyle(false, currentPage >= totalPages)}
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="次のページ"
        >
          &gt;
        </button>
      </div>
    </nav>
  );
}
