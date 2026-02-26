"use client";

import { useState, useCallback, useEffect, type CSSProperties } from "react";
import { Pagination } from "@/shared/components";
import type { SortDirection, PageSize } from "@/shared/types";
import type {
  AuditLogSearchParams,
  MaskedAuditLogEntry,
  SavedSearchCondition,
} from "../types";
import { searchAuditLogsAction } from "../server-actions/searchAuditLogsAction";
import { unmaskAuditLogAction } from "../server-actions/unmaskAuditLogAction";
import { exportAuditLogsAction } from "../server-actions/exportAuditLogsAction";
import { AuditLogSearchForm } from "./AuditLogSearchForm";
import { AuditLogTable } from "./AuditLogTable";

export interface AuditLogViewerProps {
  /** SUPER_ADMINかどうか（マスキング解除の可否） */
  isSuperAdmin: boolean;
}

const containerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
};

const toolbarStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "0.5rem",
};

const exportButtonStyle: CSSProperties = {
  padding: "0.5rem 1rem",
  backgroundColor: "#059669",
  color: "#ffffff",
  border: "none",
  borderRadius: "0.375rem",
  fontSize: "0.875rem",
  fontWeight: 500,
  cursor: "pointer",
};

const savedConditionsStyle: CSSProperties = {
  display: "flex",
  gap: "0.5rem",
  alignItems: "center",
  flexWrap: "wrap",
};

const savedBadgeStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.25rem",
  padding: "0.25rem 0.5rem",
  backgroundColor: "#e0e7ff",
  color: "#3730a3",
  borderRadius: "9999px",
  fontSize: "0.75rem",
  cursor: "pointer",
  border: "none",
};

const saveButtonStyle: CSSProperties = {
  padding: "0.375rem 0.75rem",
  backgroundColor: "#f1f5f9",
  color: "#475569",
  border: "1px solid #cbd5e1",
  borderRadius: "0.375rem",
  fontSize: "0.8125rem",
  cursor: "pointer",
};

const errorStyle: CSSProperties = {
  padding: "0.75rem",
  backgroundColor: "#fef2f2",
  color: "#991b1b",
  borderRadius: "0.375rem",
  fontSize: "0.875rem",
};

const loadingStyle: CSSProperties = {
  padding: "2rem",
  textAlign: "center",
  color: "#64748b",
};

const SAVED_CONDITIONS_KEY = "delispect_audit_log_saved_conditions";

/**
 * 監査ログビューアーコンポーネント
 *
 * 検索フォーム・テーブル・ページネーション・エクスポート・
 * 検索条件の保存機能を統合するメインコンポーネント。
 */
export function AuditLogViewer({ isSuperAdmin }: AuditLogViewerProps) {
  const [logs, setLogs] = useState<MaskedAuditLogEntry[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(20);
  const [sortColumn, setSortColumn] = useState("occurredAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [searchParams, setSearchParams] = useState<AuditLogSearchParams>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unmaskedLogIds, setUnmaskedLogIds] = useState<Set<string>>(
    new Set(),
  );
  const [unmaskedUsernames, setUnmaskedUsernames] = useState<
    Map<string, string>
  >(new Map());
  const [savedConditions, setSavedConditions] = useState<
    SavedSearchCondition[]
  >([]);
  const [isExporting, setIsExporting] = useState(false);

  // 保存済み検索条件の読み込み
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SAVED_CONDITIONS_KEY);
      if (stored) {
        setSavedConditions(JSON.parse(stored) as SavedSearchCondition[]);
      }
    } catch {
      // localStorageアクセスエラーは無視
    }
  }, []);

  // 検索実行
  const performSearch = useCallback(
    async (params: AuditLogSearchParams, page: number, size: PageSize) => {
      setIsLoading(true);
      setError(null);
      try {
        const effectivePageSize = size === "auto" ? 20 : size;
        const result = await searchAuditLogsAction({
          ...params,
          sortColumn,
          sortDirection,
          page,
          pageSize: effectivePageSize,
        });

        if (result.success) {
          setLogs(result.value.logs);
          setTotalCount(result.value.totalCount);
          setTotalPages(result.value.totalPages);
          setCurrentPage(result.value.page);
        } else {
          setError(
            typeof result.value.cause === "string"
              ? result.value.cause
              : "検索に失敗しました",
          );
          setLogs([]);
          setTotalCount(0);
          setTotalPages(0);
        }
      } catch {
        setError("検索中にエラーが発生しました");
      } finally {
        setIsLoading(false);
      }
    },
    [sortColumn, sortDirection],
  );

  // 初回ロード
  useEffect(() => {
    performSearch(searchParams, currentPage, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 検索ボタン押下
  const handleSearch = useCallback(
    (params: AuditLogSearchParams) => {
      setSearchParams(params);
      setCurrentPage(1);
      performSearch(params, 1, pageSize);
    },
    [performSearch, pageSize],
  );

  // 検索条件クリア
  const handleClear = useCallback(() => {
    const emptyParams: AuditLogSearchParams = {};
    setSearchParams(emptyParams);
    setCurrentPage(1);
    performSearch(emptyParams, 1, pageSize);
  }, [performSearch, pageSize]);

  // ページ変更
  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);
      performSearch(searchParams, page, pageSize);
    },
    [performSearch, searchParams, pageSize],
  );

  // ページサイズ変更
  const handlePageSizeChange = useCallback(
    (size: PageSize) => {
      setPageSize(size);
      setCurrentPage(1);
      performSearch(searchParams, 1, size);
    },
    [performSearch, searchParams],
  );

  // ソート変更
  const handleSort = useCallback(
    (column: string, direction: SortDirection) => {
      setSortColumn(column);
      setSortDirection(direction);
      // ソート変更時は次のperformSearch呼び出しで反映される
      setCurrentPage(1);
    },
    [],
  );

  // ソートが変更されたら再検索
  useEffect(() => {
    performSearch(searchParams, 1, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortColumn, sortDirection]);

  // マスキング解除
  const handleUnmask = useCallback(async (logId: string) => {
    try {
      const result = await unmaskAuditLogAction(logId);
      if (result.success) {
        setUnmaskedLogIds((prev) => new Set(prev).add(logId));
        setUnmaskedUsernames((prev) => {
          const newMap = new Map(prev);
          newMap.set(logId, result.value.actorUsername);
          return newMap;
        });
      }
    } catch {
      // マスキング解除エラーは静かに失敗
    }
  }, []);

  // CSVエクスポート
  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
      const result = await exportAuditLogsAction(searchParams);
      if (result.success) {
        // ダウンロード処理
        const blob = new Blob([result.value.csv], {
          type: "text/csv;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = result.value.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        setError("エクスポートに失敗しました");
      }
    } catch {
      setError("エクスポート中にエラーが発生しました");
    } finally {
      setIsExporting(false);
    }
  }, [searchParams]);

  // 検索条件の保存
  const handleSaveCondition = useCallback(() => {
    const name = prompt("検索条件名を入力してください");
    if (!name) return;

    const newCondition: SavedSearchCondition = {
      name,
      params: searchParams,
      createdAt: new Date().toISOString(),
    };

    const updated = [...savedConditions, newCondition];
    setSavedConditions(updated);
    try {
      localStorage.setItem(SAVED_CONDITIONS_KEY, JSON.stringify(updated));
    } catch {
      // localStorageアクセスエラーは無視
    }
  }, [searchParams, savedConditions]);

  // 保存済み条件の適用
  const handleApplyCondition = useCallback(
    (condition: SavedSearchCondition) => {
      setSearchParams(condition.params);
      setCurrentPage(1);
      performSearch(condition.params, 1, pageSize);
    },
    [performSearch, pageSize],
  );

  // 保存済み条件の削除
  const handleDeleteCondition = useCallback(
    (index: number) => {
      const updated = savedConditions.filter((_, i) => i !== index);
      setSavedConditions(updated);
      try {
        localStorage.setItem(SAVED_CONDITIONS_KEY, JSON.stringify(updated));
      } catch {
        // localStorageアクセスエラーは無視
      }
    },
    [savedConditions],
  );

  return (
    <div style={containerStyle}>
      <AuditLogSearchForm
        initialParams={searchParams}
        onSearch={handleSearch}
        onClear={handleClear}
      />

      {savedConditions.length > 0 && (
        <div style={savedConditionsStyle}>
          <span
            style={{ fontSize: "0.8125rem", color: "#475569", fontWeight: 500 }}
          >
            保存済み条件:
          </span>
          {savedConditions.map((condition, index) => (
            <span key={condition.createdAt} style={{ display: "inline-flex", gap: "0.125rem" }}>
              <button
                type="button"
                style={savedBadgeStyle}
                onClick={() => handleApplyCondition(condition)}
                aria-label={`保存済み条件「${condition.name}」を適用`}
              >
                {condition.name}
              </button>
              <button
                type="button"
                style={{
                  ...savedBadgeStyle,
                  backgroundColor: "#fee2e2",
                  color: "#991b1b",
                  padding: "0.125rem 0.375rem",
                }}
                onClick={() => handleDeleteCondition(index)}
                aria-label={`保存済み条件「${condition.name}」を削除`}
              >
                x
              </button>
            </span>
          ))}
        </div>
      )}

      <div style={toolbarStyle}>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            type="button"
            style={saveButtonStyle}
            onClick={handleSaveCondition}
          >
            検索条件を保存
          </button>
          <button
            type="button"
            style={exportButtonStyle}
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? "エクスポート中..." : "CSVエクスポート"}
          </button>
        </div>
        <span style={{ fontSize: "0.875rem", color: "#64748b" }}>
          {totalCount}件
        </span>
      </div>

      {error && <div style={errorStyle}>{error}</div>}

      {isLoading ? (
        <div style={loadingStyle}>読み込み中...</div>
      ) : (
        <>
          <AuditLogTable
            logs={logs}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSort={handleSort}
            onUnmask={handleUnmask}
            canUnmask={isSuperAdmin}
            unmaskedLogIds={unmaskedLogIds}
            unmaskedUsernames={unmaskedUsernames}
          />
          {totalPages > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalCount}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          )}
        </>
      )}
    </div>
  );
}
