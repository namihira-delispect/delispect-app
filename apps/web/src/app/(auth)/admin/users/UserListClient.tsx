"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { deactivateUser } from "./actions";

type UserListItem = {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  roles: { id: number; name: string }[];
  createdAt: string;
};

type UserListClientProps = {
  users: UserListItem[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  query: string;
  sortKey: string;
  sortDirection: "asc" | "desc";
  isActiveFilter?: string;
};

const ROLE_DISPLAY_NAMES: Record<string, string> = {
  SUPER_ADMIN: "全権管理者",
  SYSTEM_ADMIN: "システム管理者",
  GENERAL_USER: "一般ユーザー",
};

export function UserListClient({
  users,
  totalCount,
  totalPages,
  currentPage,
  query: initialQuery,
  sortKey,
  sortDirection,
  isActiveFilter,
}: UserListClientProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [deactivatingId, setDeactivatingId] = useState<number | null>(null);

  const buildUrl = (params: Record<string, string | number | undefined>) => {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== "") {
        searchParams.set(key, String(value));
      }
    }
    return `/admin/users?${searchParams.toString()}`;
  };

  const currentParams = {
    query: initialQuery || undefined,
    page: currentPage > 1 ? currentPage : undefined,
    sortKey: sortKey !== "createdAt" ? sortKey : undefined,
    sortDirection: sortDirection !== "desc" ? sortDirection : undefined,
    isActive: isActiveFilter,
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(buildUrl({ ...currentParams, query: query || undefined, page: undefined }));
  };

  const handleClearSearch = () => {
    setQuery("");
    router.push(buildUrl({ ...currentParams, query: undefined, page: undefined }));
  };

  const handleSort = (key: string) => {
    const newDirection =
      sortKey === key && sortDirection === "asc" ? "desc" : "asc";
    router.push(
      buildUrl({
        ...currentParams,
        sortKey: key,
        sortDirection: newDirection,
        page: undefined,
      })
    );
  };

  const handlePageChange = (page: number) => {
    router.push(buildUrl({ ...currentParams, page }));
  };

  const handleFilterChange = (value: string) => {
    router.push(
      buildUrl({
        ...currentParams,
        isActive: value || undefined,
        page: undefined,
      })
    );
  };

  const handleDeactivate = async (userId: number, username: string) => {
    if (!confirm(`ユーザー「${username}」を無効化しますか？`)) {
      return;
    }

    setDeactivatingId(userId);
    try {
      const result = await deactivateUser(userId);
      if (!result.success) {
        alert(result.error ?? "ユーザーの無効化に失敗しました");
      } else {
        router.refresh();
      }
    } finally {
      setDeactivatingId(null);
    }
  };

  const getSortIndicator = (key: string) => {
    if (sortKey !== key) return " \u25BD";
    return sortDirection === "asc" ? " \u25B2" : " \u25BC";
  };

  return (
    <div data-testid="user-list-page">
      <div style={styles.header}>
        <h1 style={styles.title}>ユーザー管理</h1>
        <Link href="/admin/users/new" style={styles.createButton}>
          新規登録
        </Link>
      </div>

      <div style={styles.toolbar}>
        <form
          onSubmit={handleSearch}
          style={styles.searchForm}
          role="search"
          data-testid="user-search-form"
        >
          <div style={styles.searchInputWrapper}>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ユーザーID、名前、メールアドレスで検索..."
              style={styles.searchInput}
              data-testid="user-search-input"
              aria-label="ユーザー検索"
            />
            {query && (
              <button
                type="button"
                onClick={handleClearSearch}
                style={styles.clearButton}
                data-testid="user-search-clear"
                aria-label="検索条件をクリア"
              >
                &times;
              </button>
            )}
          </div>
          <button
            type="submit"
            style={styles.searchButton}
            data-testid="user-search-submit"
          >
            検索
          </button>
        </form>

        <div style={styles.filterContainer}>
          <label htmlFor="status-filter" style={styles.filterLabel}>
            状態:
          </label>
          <select
            id="status-filter"
            value={isActiveFilter ?? ""}
            onChange={(e) => handleFilterChange(e.target.value)}
            style={styles.filterSelect}
            data-testid="user-status-filter"
          >
            <option value="">すべて</option>
            <option value="true">有効</option>
            <option value="false">無効</option>
          </select>
        </div>
      </div>

      <div style={styles.countText} data-testid="user-total-count">
        {totalCount}件のユーザー
      </div>

      <div style={styles.tableContainer}>
        <table style={styles.table} data-testid="user-table">
          <thead>
            <tr>
              <th style={styles.th}>
                <button
                  onClick={() => handleSort("username")}
                  style={styles.sortButton}
                  data-testid="sort-username"
                >
                  ユーザーID{getSortIndicator("username")}
                </button>
              </th>
              <th style={styles.th}>
                <button
                  onClick={() => handleSort("lastName")}
                  style={styles.sortButton}
                  data-testid="sort-lastName"
                >
                  名前{getSortIndicator("lastName")}
                </button>
              </th>
              <th style={styles.th}>
                <button
                  onClick={() => handleSort("email")}
                  style={styles.sortButton}
                  data-testid="sort-email"
                >
                  メールアドレス{getSortIndicator("email")}
                </button>
              </th>
              <th style={styles.th}>ロール</th>
              <th style={styles.th}>
                <button
                  onClick={() => handleSort("isActive")}
                  style={styles.sortButton}
                  data-testid="sort-isActive"
                >
                  状態{getSortIndicator("isActive")}
                </button>
              </th>
              <th style={styles.th}>操作</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} style={styles.emptyCell} data-testid="user-empty-message">
                  ユーザーが見つかりません
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} data-testid={`user-row-${user.id}`}>
                  <td style={styles.td}>{user.username}</td>
                  <td style={styles.td}>
                    {user.lastName} {user.firstName}
                  </td>
                  <td style={styles.td}>{user.email}</td>
                  <td style={styles.td}>
                    {user.roles
                      .map(
                        (role) =>
                          ROLE_DISPLAY_NAMES[role.name] ?? role.name
                      )
                      .join(", ")}
                  </td>
                  <td style={styles.td}>
                    <span
                      style={
                        user.isActive
                          ? styles.statusActive
                          : styles.statusInactive
                      }
                    >
                      {user.isActive ? "有効" : "無効"}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actions}>
                      <Link
                        href={`/admin/users/${user.id}`}
                        style={styles.editLink}
                        data-testid={`user-edit-${user.id}`}
                      >
                        編集
                      </Link>
                      {user.isActive && (
                        <button
                          onClick={() =>
                            handleDeactivate(user.id, user.username)
                          }
                          disabled={deactivatingId === user.id}
                          style={styles.deactivateButton}
                          data-testid={`user-deactivate-${user.id}`}
                        >
                          {deactivatingId === user.id
                            ? "処理中..."
                            : "無効化"}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <nav
          aria-label="ページネーション"
          style={styles.pagination}
          data-testid="user-pagination"
        >
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            style={{
              ...styles.pageButton,
              ...(currentPage <= 1 ? styles.pageButtonDisabled : {}),
            }}
            data-testid="pagination-prev"
            aria-label="前のページ"
          >
            &laquo; 前へ
          </button>

          <span style={styles.pageInfo}>
            {currentPage} / {totalPages}
          </span>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            style={{
              ...styles.pageButton,
              ...(currentPage >= totalPages ? styles.pageButtonDisabled : {}),
            }}
            data-testid="pagination-next"
            aria-label="次のページ"
          >
            次へ &raquo;
          </button>
        </nav>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: "#1a1a2e",
    margin: 0,
  },
  createButton: {
    display: "inline-flex",
    alignItems: "center",
    padding: "0.5rem 1rem",
    backgroundColor: "#1a1a2e",
    color: "#ffffff",
    borderRadius: "4px",
    fontSize: "0.875rem",
    fontWeight: "500",
    textDecoration: "none",
    cursor: "pointer",
  },
  toolbar: {
    display: "flex",
    gap: "1rem",
    alignItems: "center",
    marginBottom: "1rem",
    flexWrap: "wrap" as const,
  },
  searchForm: {
    display: "flex",
    gap: "0.5rem",
    alignItems: "center",
    flex: 1,
    minWidth: "300px",
  },
  searchInputWrapper: {
    position: "relative" as const,
    flex: 1,
  },
  searchInput: {
    width: "100%",
    padding: "0.5rem 2rem 0.5rem 0.75rem",
    border: "1px solid #d1d5db",
    borderRadius: "4px",
    fontSize: "0.875rem",
    outline: "none",
    boxSizing: "border-box" as const,
  },
  clearButton: {
    position: "absolute" as const,
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
    whiteSpace: "nowrap" as const,
    flexShrink: 0,
  },
  filterContainer: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  filterLabel: {
    fontSize: "0.875rem",
    color: "#374151",
    whiteSpace: "nowrap" as const,
  },
  filterSelect: {
    padding: "0.5rem",
    border: "1px solid #d1d5db",
    borderRadius: "4px",
    fontSize: "0.875rem",
    color: "#374151",
    backgroundColor: "#ffffff",
  },
  countText: {
    fontSize: "0.875rem",
    color: "#6b7280",
    marginBottom: "0.75rem",
  },
  tableContainer: {
    overflowX: "auto" as const,
    border: "1px solid #e5e7eb",
    borderRadius: "4px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
    fontSize: "0.875rem",
  },
  th: {
    textAlign: "left" as const,
    padding: "0.75rem",
    backgroundColor: "#f9fafb",
    borderBottom: "1px solid #e5e7eb",
    fontWeight: "600",
    color: "#374151",
    whiteSpace: "nowrap" as const,
  },
  td: {
    padding: "0.75rem",
    borderBottom: "1px solid #e5e7eb",
    color: "#374151",
  },
  emptyCell: {
    padding: "2rem",
    textAlign: "center" as const,
    color: "#9ca3af",
  },
  sortButton: {
    display: "inline-flex",
    alignItems: "center",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "0.875rem",
    fontWeight: "600",
    color: "#374151",
    padding: 0,
  },
  statusActive: {
    display: "inline-block",
    padding: "0.125rem 0.5rem",
    backgroundColor: "#f0fdf4",
    color: "#16a34a",
    borderRadius: "9999px",
    fontSize: "0.8125rem",
    fontWeight: "500",
  },
  statusInactive: {
    display: "inline-block",
    padding: "0.125rem 0.5rem",
    backgroundColor: "#fef2f2",
    color: "#dc2626",
    borderRadius: "9999px",
    fontSize: "0.8125rem",
    fontWeight: "500",
  },
  actions: {
    display: "flex",
    gap: "0.5rem",
    alignItems: "center",
  },
  editLink: {
    padding: "0.25rem 0.5rem",
    backgroundColor: "#eff6ff",
    color: "#2563eb",
    borderRadius: "4px",
    fontSize: "0.8125rem",
    textDecoration: "none",
    cursor: "pointer",
  },
  deactivateButton: {
    padding: "0.25rem 0.5rem",
    backgroundColor: "#fef2f2",
    color: "#dc2626",
    border: "1px solid #fecaca",
    borderRadius: "4px",
    fontSize: "0.8125rem",
    cursor: "pointer",
  },
  pagination: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "1rem",
    padding: "1rem 0",
  },
  pageButton: {
    padding: "0.375rem 0.75rem",
    border: "1px solid #d1d5db",
    borderRadius: "4px",
    backgroundColor: "#ffffff",
    color: "#374151",
    fontSize: "0.8125rem",
    cursor: "pointer",
  },
  pageButtonDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  pageInfo: {
    fontSize: "0.875rem",
    color: "#374151",
  },
};
