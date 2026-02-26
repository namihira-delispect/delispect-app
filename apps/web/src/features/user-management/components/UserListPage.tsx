"use client";

import { useState, useCallback, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { SearchForm } from "@/shared/components/SearchForm";
import { Filter } from "@/shared/components/Filter";
import { Pagination } from "@/shared/components/Pagination";
import { SortHeader } from "@/shared/components/SortHeader";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import type { SortDirection, PageSize } from "@/shared/types";
import { deleteUserAction } from "../server-actions/deleteUserAction";
import type { UserListItem, UserListResult } from "../types";

interface UserListPageProps {
  initialData: UserListResult;
  initialFilter: {
    search: string;
    role: string;
    isActive: string;
    sortColumn: string;
    sortDirection: SortDirection;
    page: number;
    pageSize: number;
  };
}

const containerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
};

const headerStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const titleStyle: CSSProperties = {
  fontSize: "1.5rem",
  fontWeight: 700,
  color: "#1e293b",
};

const addButtonStyle: CSSProperties = {
  padding: "0.5rem 1rem",
  fontSize: "0.875rem",
  fontWeight: 500,
  color: "#ffffff",
  backgroundColor: "#2563eb",
  border: "none",
  borderRadius: "0.375rem",
  cursor: "pointer",
  textDecoration: "none",
};

const filterBarStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "1rem",
  flexWrap: "wrap",
};

const tableContainerStyle: CSSProperties = {
  backgroundColor: "#ffffff",
  borderRadius: "0.5rem",
  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
  overflow: "hidden",
};

const tableStyle: CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: "0.875rem",
};

const thStyle: CSSProperties = {
  padding: "0.75rem 1rem",
  textAlign: "left",
  fontWeight: 600,
  color: "#1e293b",
  borderBottom: "2px solid #e2e8f0",
  backgroundColor: "#f8fafc",
};

const tdStyle: CSSProperties = {
  padding: "0.75rem 1rem",
  borderBottom: "1px solid #e2e8f0",
  color: "#334155",
};

const badgeStyle = (isActive: boolean): CSSProperties => ({
  display: "inline-block",
  padding: "0.125rem 0.5rem",
  borderRadius: "9999px",
  fontSize: "0.75rem",
  fontWeight: 500,
  backgroundColor: isActive ? "#dcfce7" : "#fee2e2",
  color: isActive ? "#166534" : "#991b1b",
});

const roleBadgeStyle: CSSProperties = {
  display: "inline-block",
  padding: "0.125rem 0.5rem",
  borderRadius: "0.25rem",
  fontSize: "0.75rem",
  fontWeight: 500,
  backgroundColor: "#e0f2fe",
  color: "#0c4a6e",
  marginRight: "0.25rem",
};

const actionButtonStyle = (variant: "edit" | "delete"): CSSProperties => ({
  padding: "0.25rem 0.75rem",
  fontSize: "0.75rem",
  fontWeight: 500,
  border: "1px solid",
  borderColor: variant === "edit" ? "#3b82f6" : "#ef4444",
  borderRadius: "0.25rem",
  backgroundColor: "transparent",
  color: variant === "edit" ? "#3b82f6" : "#ef4444",
  cursor: "pointer",
  marginRight: variant === "edit" ? "0.5rem" : "0",
});

const emptyStyle: CSSProperties = {
  padding: "2rem",
  textAlign: "center",
  color: "#64748b",
};

const ROLE_LABELS: Record<string, string> = {
  GENERAL: "一般ユーザー",
  SYSTEM_ADMIN: "システム管理者",
  SUPER_ADMIN: "全権管理者",
};

const ROLE_FILTER_OPTIONS = [
  { value: "GENERAL", label: "一般ユーザー" },
  { value: "SYSTEM_ADMIN", label: "システム管理者" },
  { value: "SUPER_ADMIN", label: "全権管理者" },
];

const STATUS_FILTER_OPTIONS = [
  { value: "true", label: "有効" },
  { value: "false", label: "無効" },
];

const SORTABLE_COLUMNS = [
  { key: "username", label: "ユーザー名" },
  { key: "email", label: "メールアドレス" },
  { key: "createdAt", label: "作成日時" },
];

/**
 * ユーザー一覧ページコンポーネント
 *
 * 検索・フィルタ・ソート・ページネーション・削除確認ダイアログを含む。
 */
export function UserListPage({
  initialData,
  initialFilter,
}: UserListPageProps) {
  const router = useRouter();

  const [data] = useState(initialData);
  const [search, setSearch] = useState(initialFilter.search);
  const [role, setRole] = useState(initialFilter.role);
  const [isActive, setIsActive] = useState(initialFilter.isActive);
  const [sortColumn, setSortColumn] = useState(initialFilter.sortColumn);
  const [sortDirection, setSortDirection] = useState<SortDirection>(
    initialFilter.sortDirection,
  );
  const [page, setPage] = useState(initialFilter.page);
  const [pageSize, setPageSize] = useState<PageSize>(
    initialFilter.pageSize as 10 | 20 | 50,
  );

  const [deleteTarget, setDeleteTarget] = useState<UserListItem | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // URL更新によるサーバーサイドでのデータ再取得
  const updateUrl = useCallback(
    (params: Record<string, string | number>) => {
      const searchParams = new URLSearchParams();
      const newState = {
        search,
        role,
        isActive,
        sortColumn,
        sortDirection,
        page,
        pageSize,
        ...params,
      };

      if (newState.search) searchParams.set("search", String(newState.search));
      if (newState.role) searchParams.set("role", String(newState.role));
      if (newState.isActive)
        searchParams.set("isActive", String(newState.isActive));
      if (newState.sortColumn !== "createdAt")
        searchParams.set("sortColumn", String(newState.sortColumn));
      if (newState.sortDirection !== "desc")
        searchParams.set("sortDirection", String(newState.sortDirection));
      if (newState.page !== 1)
        searchParams.set("page", String(newState.page));
      if (newState.pageSize !== 20)
        searchParams.set("pageSize", String(newState.pageSize));

      const qs = searchParams.toString();
      router.push(`/admin/users${qs ? `?${qs}` : ""}`);
    },
    [search, role, isActive, sortColumn, sortDirection, page, pageSize, router],
  );

  const handleSearch = useCallback(
    (query: string) => {
      setSearch(query);
      setPage(1);
      updateUrl({ search: query, page: 1 });
    },
    [updateUrl],
  );

  const handleRoleChange = useCallback(
    (value: string) => {
      setRole(value);
      setPage(1);
      updateUrl({ role: value, page: 1 });
    },
    [updateUrl],
  );

  const handleIsActiveChange = useCallback(
    (value: string) => {
      setIsActive(value);
      setPage(1);
      updateUrl({ isActive: value, page: 1 });
    },
    [updateUrl],
  );

  const handleSort = useCallback(
    (column: string, direction: SortDirection) => {
      setSortColumn(column);
      setSortDirection(direction);
      updateUrl({ sortColumn: column, sortDirection: direction });
    },
    [updateUrl],
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      setPage(newPage);
      updateUrl({ page: newPage });
    },
    [updateUrl],
  );

  const handlePageSizeChange = useCallback(
    (newSize: PageSize) => {
      const numSize = newSize === "auto" ? 20 : newSize;
      setPageSize(numSize as 10 | 20 | 50);
      setPage(1);
      updateUrl({ pageSize: numSize, page: 1 });
    },
    [updateUrl],
  );

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;

    const result = await deleteUserAction(deleteTarget.id);
    if (result.success) {
      setDeleteTarget(null);
      setDeleteError(null);
      router.refresh();
    } else {
      setDeleteError(
        typeof result.value.cause === "string"
          ? result.value.cause
          : "削除に失敗しました",
      );
    }
  }, [deleteTarget, router]);

  const effectivePageSize = pageSize === "auto" ? 20 : pageSize;
  const totalPages = Math.max(
    1,
    Math.ceil(data.totalCount / effectivePageSize),
  );

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>ユーザー管理</h1>
        <a href="/admin/users/new" style={addButtonStyle}>
          新規登録
        </a>
      </div>

      <div style={filterBarStyle}>
        <SearchForm
          placeholder="ユーザー名・メールアドレスで検索"
          defaultValue={search}
          onSearch={handleSearch}
        />
        <Filter
          label="ロール"
          options={ROLE_FILTER_OPTIONS}
          value={role}
          onChange={handleRoleChange}
        />
        <Filter
          label="ステータス"
          options={STATUS_FILTER_OPTIONS}
          value={isActive}
          onChange={handleIsActiveChange}
        />
      </div>

      <div style={tableContainerStyle}>
        {data.users.length === 0 ? (
          <div style={emptyStyle} data-testid="user-table-empty">
            ユーザーが見つかりませんでした
          </div>
        ) : (
          <table style={tableStyle} data-testid="user-table">
            <thead>
              <tr>
                {SORTABLE_COLUMNS.map((col) => (
                  <th key={col.key} style={thStyle}>
                    <SortHeader
                      label={col.label}
                      columnKey={col.key}
                      currentSortColumn={sortColumn}
                      currentSortDirection={sortDirection}
                      onSort={handleSort}
                    />
                  </th>
                ))}
                <th style={thStyle}>ロール</th>
                <th style={thStyle}>ステータス</th>
                <th style={thStyle}>操作</th>
              </tr>
            </thead>
            <tbody>
              {data.users.map((user) => (
                <tr key={user.id} data-testid={`user-row-${user.id}`}>
                  <td style={tdStyle}>{user.username}</td>
                  <td style={tdStyle}>{user.email}</td>
                  <td style={tdStyle}>
                    {new Date(user.createdAt).toLocaleDateString("ja-JP")}
                  </td>
                  <td style={tdStyle}>
                    {user.roles.map((r) => (
                      <span key={r} style={roleBadgeStyle}>
                        {ROLE_LABELS[r] ?? r}
                      </span>
                    ))}
                  </td>
                  <td style={tdStyle}>
                    <span style={badgeStyle(user.isActive)}>
                      {user.isActive ? "有効" : "無効"}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <button
                      type="button"
                      style={actionButtonStyle("edit")}
                      onClick={() =>
                        router.push(`/admin/users/${user.id}/edit`)
                      }
                      data-testid={`edit-user-${user.id}`}
                    >
                      編集
                    </button>
                    <button
                      type="button"
                      style={actionButtonStyle("delete")}
                      onClick={() => setDeleteTarget(user)}
                      data-testid={`delete-user-${user.id}`}
                    >
                      無効化
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        totalItems={data.totalCount}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title="ユーザーの無効化"
        message={
          deleteError
            ? deleteError
            : `ユーザー「${deleteTarget?.username ?? ""}」を無効化しますか？`
        }
        confirmLabel="無効化する"
        cancelLabel="キャンセル"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => {
          setDeleteTarget(null);
          setDeleteError(null);
        }}
      />
    </div>
  );
}
