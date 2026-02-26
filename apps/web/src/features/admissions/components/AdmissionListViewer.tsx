"use client";

import { useState, useCallback, useEffect, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { Pagination, ConfirmDialog } from "@/shared/components";
import type { SortDirection, PageSize } from "@/shared/types";
import type { AdmissionSearchParams, AdmissionListEntry } from "../types";
import { searchAdmissionsAction } from "../server-actions/searchAdmissionsAction";
import { batchRiskAssessmentAction } from "../server-actions/batchRiskAssessmentAction";
import { AdmissionSearchForm } from "./AdmissionSearchForm";
import { AdmissionTable } from "./AdmissionTable";

export interface AdmissionListViewerProps {
  /** リスク評価実行権限があるか */
  canExecuteRiskAssessment: boolean;
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

const buttonGroupStyle: CSSProperties = {
  display: "flex",
  gap: "0.5rem",
};

const emrSyncButtonStyle: CSSProperties = {
  padding: "0.5rem 1rem",
  backgroundColor: "#059669",
  color: "#ffffff",
  border: "none",
  borderRadius: "0.375rem",
  fontSize: "0.875rem",
  fontWeight: 500,
  cursor: "pointer",
};

const riskAssessButtonStyle = (disabled: boolean): CSSProperties => ({
  padding: "0.5rem 1rem",
  backgroundColor: disabled ? "#94a3b8" : "#7c3aed",
  color: "#ffffff",
  border: "none",
  borderRadius: "0.375rem",
  fontSize: "0.875rem",
  fontWeight: 500,
  cursor: disabled ? "default" : "pointer",
  opacity: disabled ? 0.6 : 1,
});

const errorStyle: CSSProperties = {
  padding: "0.75rem",
  backgroundColor: "#fef2f2",
  color: "#991b1b",
  borderRadius: "0.375rem",
  fontSize: "0.875rem",
};

const successStyle: CSSProperties = {
  padding: "0.75rem",
  backgroundColor: "#f0fdf4",
  color: "#166534",
  borderRadius: "0.375rem",
  fontSize: "0.875rem",
};

const loadingStyle: CSSProperties = {
  padding: "2rem",
  textAlign: "center",
  color: "#64748b",
};

const MAX_BATCH_ASSESSMENT = 50;

/**
 * 患者入院一覧ビューアーコンポーネント
 *
 * 検索フォーム・テーブル・ページネーション・操作ボタンを統合するメインコンポーネント。
 * 電子カルテ同期・リスク評価一括実行のトリガーボタンを配置する。
 */
export function AdmissionListViewer({ canExecuteRiskAssessment }: AdmissionListViewerProps) {
  const router = useRouter();
  const [admissions, setAdmissions] = useState<AdmissionListEntry[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(20);
  const [sortColumn, setSortColumn] = useState("admissionDate");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [searchParams, setSearchParams] = useState<AdmissionSearchParams>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isAssessing, setIsAssessing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // 検索実行
  const performSearch = useCallback(
    async (params: AdmissionSearchParams, page: number, size: PageSize) => {
      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);
      try {
        const effectivePageSize = size === "auto" ? 20 : size;
        const result = await searchAdmissionsAction({
          ...params,
          sortColumn,
          sortDirection,
          page,
          pageSize: effectivePageSize,
        });

        if (result.success) {
          setAdmissions(result.value.admissions);
          setTotalCount(result.value.totalCount);
          setTotalPages(result.value.totalPages);
          setCurrentPage(result.value.page);
        } else {
          setError(
            typeof result.value.cause === "string" ? result.value.cause : "検索に失敗しました",
          );
          setAdmissions([]);
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
    (params: AdmissionSearchParams) => {
      setSearchParams(params);
      setCurrentPage(1);
      setSelectedIds(new Set());
      performSearch(params, 1, pageSize);
    },
    [performSearch, pageSize],
  );

  // 検索条件クリア
  const handleClear = useCallback(() => {
    const emptyParams: AdmissionSearchParams = {};
    setSearchParams(emptyParams);
    setCurrentPage(1);
    setSelectedIds(new Set());
    performSearch(emptyParams, 1, pageSize);
  }, [performSearch, pageSize]);

  // ページ変更
  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);
      setSelectedIds(new Set());
      performSearch(searchParams, page, pageSize);
    },
    [performSearch, searchParams, pageSize],
  );

  // ページサイズ変更
  const handlePageSizeChange = useCallback(
    (size: PageSize) => {
      setPageSize(size);
      setCurrentPage(1);
      setSelectedIds(new Set());
      performSearch(searchParams, 1, size);
    },
    [performSearch, searchParams],
  );

  // ソート変更
  const handleSort = useCallback((column: string, direction: SortDirection) => {
    setSortColumn(column);
    setSortDirection(direction);
    setCurrentPage(1);
    setSelectedIds(new Set());
  }, []);

  // ソートが変更されたら再検索
  useEffect(() => {
    performSearch(searchParams, 1, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortColumn, sortDirection]);

  // 電子カルテ同期ボタン
  const handleEmrSync = useCallback(() => {
    router.push("/admin/emr-sync");
  }, [router]);

  // リスク評価実行（確認ダイアログ表示）
  const handleRiskAssessmentClick = useCallback(() => {
    if (selectedIds.size === 0) {
      setError("評価対象を1件以上選択してください");
      return;
    }
    if (selectedIds.size > MAX_BATCH_ASSESSMENT) {
      setError(`一括評価は${MAX_BATCH_ASSESSMENT}件までです`);
      return;
    }
    setShowConfirmDialog(true);
  }, [selectedIds]);

  // リスク評価実行（確認後）
  const handleRiskAssessmentConfirm = useCallback(async () => {
    setShowConfirmDialog(false);
    setIsAssessing(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const result = await batchRiskAssessmentAction({
        admissionIds: Array.from(selectedIds),
      });

      if (result.success) {
        const { successCount, failureCount } = result.value;
        setSuccessMessage(
          `リスク評価が完了しました。成功: ${successCount}件` +
            (failureCount > 0 ? `、失敗: ${failureCount}件` : ""),
        );
        setSelectedIds(new Set());
        // 結果を反映するために再検索
        performSearch(searchParams, currentPage, pageSize);
      } else {
        setError(
          typeof result.value.cause === "string"
            ? result.value.cause
            : "リスク評価の実行に失敗しました",
        );
      }
    } catch {
      setError("リスク評価の実行中にエラーが発生しました");
    } finally {
      setIsAssessing(false);
    }
  }, [selectedIds, performSearch, searchParams, currentPage, pageSize]);

  return (
    <div style={containerStyle}>
      <AdmissionSearchForm
        initialParams={searchParams}
        onSearch={handleSearch}
        onClear={handleClear}
      />

      <div style={toolbarStyle}>
        <div style={buttonGroupStyle}>
          <button type="button" style={emrSyncButtonStyle} onClick={handleEmrSync}>
            電子カルテ同期
          </button>
          {canExecuteRiskAssessment && (
            <button
              type="button"
              style={riskAssessButtonStyle(selectedIds.size === 0 || isAssessing)}
              onClick={handleRiskAssessmentClick}
              disabled={selectedIds.size === 0 || isAssessing}
            >
              {isAssessing
                ? "評価実行中..."
                : `リスク評価実行${selectedIds.size > 0 ? ` (${selectedIds.size}件)` : ""}`}
            </button>
          )}
        </div>
        <span style={{ fontSize: "0.875rem", color: "#64748b" }}>{totalCount}件</span>
      </div>

      {error && <div style={errorStyle}>{error}</div>}
      {successMessage && <div style={successStyle}>{successMessage}</div>}

      {isLoading ? (
        <div style={loadingStyle}>読み込み中...</div>
      ) : (
        <>
          <AdmissionTable
            admissions={admissions}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSort={handleSort}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
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

      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="リスク評価実行"
        message={`選択された${selectedIds.size}件のレコードに対してリスク評価を実行します。よろしいですか？`}
        confirmLabel="実行"
        cancelLabel="キャンセル"
        onConfirm={handleRiskAssessmentConfirm}
        onCancel={() => setShowConfirmDialog(false)}
        variant="primary"
      />
    </div>
  );
}
