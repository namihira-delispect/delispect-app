"use client";

type PaginationProps = {
  /** 現在のページ番号（1始まり） */
  currentPage: number;
  /** 総ページ数 */
  totalPages: number;
  /** ページ変更時のコールバック */
  onPageChange: (page: number) => void;
  /** 無効化フラグ */
  disabled?: boolean;
};

/**
 * 共通ページネーションコンポーネント
 *
 * ページ番号の表示と遷移機能を提供する。
 * 前へ・次へボタンとページ番号表示を含む。
 */
export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  disabled = false,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = getVisiblePages(currentPage, totalPages);

  return (
    <nav
      aria-label="ページネーション"
      style={styles.nav}
      data-testid="pagination"
    >
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={disabled || currentPage <= 1}
        style={{
          ...styles.button,
          ...(currentPage <= 1 ? styles.buttonDisabled : {}),
        }}
        data-testid="pagination-prev"
        aria-label="前のページ"
      >
        &laquo; 前へ
      </button>

      <div style={styles.pages}>
        {pages.map((page, index) =>
          page === "..." ? (
            <span key={`ellipsis-${index}`} style={styles.ellipsis}>
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page as number)}
              disabled={disabled || page === currentPage}
              style={{
                ...styles.pageButton,
                ...(page === currentPage ? styles.pageButtonActive : {}),
              }}
              data-testid={`pagination-page-${page}`}
              aria-current={page === currentPage ? "page" : undefined}
              aria-label={`ページ ${page}`}
            >
              {page}
            </button>
          )
        )}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={disabled || currentPage >= totalPages}
        style={{
          ...styles.button,
          ...(currentPage >= totalPages ? styles.buttonDisabled : {}),
        }}
        data-testid="pagination-next"
        aria-label="次のページ"
      >
        次へ &raquo;
      </button>
    </nav>
  );
}

/**
 * 表示するページ番号のリストを計算する
 *
 * 現在のページ周辺と先頭・末尾のページ番号を表示し、
 * 省略部分は "..." で表す。
 */
export function getVisiblePages(
  currentPage: number,
  totalPages: number
): (number | "...")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | "...")[] = [];

  // 先頭のページ
  pages.push(1);

  if (currentPage > 3) {
    pages.push("...");
  }

  // 現在のページ周辺
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (currentPage < totalPages - 2) {
    pages.push("...");
  }

  // 末尾のページ
  pages.push(totalPages);

  return pages;
}

const styles: Record<string, React.CSSProperties> = {
  nav: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    padding: "1rem 0",
  },
  button: {
    padding: "0.375rem 0.75rem",
    border: "1px solid #d1d5db",
    borderRadius: "4px",
    backgroundColor: "#ffffff",
    color: "#374151",
    fontSize: "0.8125rem",
    cursor: "pointer",
    transition: "background-color 0.15s",
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  pages: {
    display: "flex",
    alignItems: "center",
    gap: "0.25rem",
  },
  pageButton: {
    minWidth: "2rem",
    height: "2rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid #d1d5db",
    borderRadius: "4px",
    backgroundColor: "#ffffff",
    color: "#374151",
    fontSize: "0.8125rem",
    cursor: "pointer",
    transition: "background-color 0.15s",
  },
  pageButtonActive: {
    backgroundColor: "#1a1a2e",
    color: "#ffffff",
    borderColor: "#1a1a2e",
    fontWeight: "600",
  },
  ellipsis: {
    padding: "0 0.25rem",
    color: "#9ca3af",
  },
};
