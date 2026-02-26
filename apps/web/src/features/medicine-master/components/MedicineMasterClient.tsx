"use client";

import { useState, useCallback, useTransition, type CSSProperties } from "react";
import { SearchForm } from "@/shared/components/SearchForm";
import { Pagination } from "@/shared/components/Pagination";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { ErrorMessage } from "@/shared/components/ErrorMessage";
import type { PageSize } from "@/shared/types";
import type { MedicineMasterItem, MedicineMasterListResponse, CsvImportPreview } from "../types";
import { MedicineMasterTable } from "./MedicineMasterTable";
import { MedicineMasterForm } from "./MedicineMasterForm";
import { CsvImportDialog } from "./CsvImportDialog";
import { getMedicineMasters } from "../queries/getMedicineMasters";
import {
  createMedicineMaster,
  updateMedicineMaster,
  deleteMedicineMaster,
  previewCsvImport,
  executeCsvImport,
} from "../server-actions";

export interface MedicineMasterClientProps {
  initialData: MedicineMasterListResponse;
}

const headerStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "1rem",
};

const actionBarStyle: CSSProperties = {
  display: "flex",
  gap: "0.5rem",
};

const primaryButtonStyle: CSSProperties = {
  padding: "0.5rem 1rem",
  backgroundColor: "#3b82f6",
  color: "#ffffff",
  border: "none",
  borderRadius: "0.375rem",
  fontSize: "0.875rem",
  cursor: "pointer",
};

const secondaryButtonStyle: CSSProperties = {
  padding: "0.5rem 1rem",
  backgroundColor: "#f1f5f9",
  color: "#475569",
  border: "1px solid #cbd5e1",
  borderRadius: "0.375rem",
  fontSize: "0.875rem",
  cursor: "pointer",
};

/**
 * 薬剤マスタ管理のクライアント側メインコンポーネント
 *
 * 一覧表示・検索・ページネーション・CRUD・CSVインポートを統合する。
 */
export function MedicineMasterClient({ initialData }: MedicineMasterClientProps) {
  const [data, setData] = useState<MedicineMasterListResponse>(initialData);
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState<PageSize>(20);
  const [isPending, startTransition] = useTransition();

  // フォーム関連
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<MedicineMasterItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [serverError, setServerError] = useState("");

  // 削除確認関連
  const [deleteTarget, setDeleteTarget] = useState<MedicineMasterItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // CSVインポート関連
  const [isCsvImportOpen, setIsCsvImportOpen] = useState(false);

  // エラー表示
  const [listError, setListError] = useState("");

  const fetchData = useCallback((query: string, page: number, size: PageSize) => {
    startTransition(async () => {
      const effectiveSize = size === "auto" ? 20 : size;
      const result = await getMedicineMasters({
        query,
        page,
        pageSize: effectiveSize,
      });

      if (result.success) {
        setData(result.value);
        setListError("");
      } else {
        setListError("薬剤マスタの取得に失敗しました");
      }
    });
  }, []);

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      fetchData(query, 1, pageSize);
    },
    [fetchData, pageSize],
  );

  const handlePageChange = useCallback(
    (page: number) => {
      fetchData(searchQuery, page, pageSize);
    },
    [fetchData, searchQuery, pageSize],
  );

  const handlePageSizeChange = useCallback(
    (size: PageSize) => {
      setPageSize(size);
      fetchData(searchQuery, 1, size);
    },
    [fetchData, searchQuery],
  );

  // 新規作成
  const handleCreate = useCallback(() => {
    setEditTarget(null);
    setServerError("");
    setIsFormOpen(true);
  }, []);

  // 編集
  const handleEdit = useCallback((item: MedicineMasterItem) => {
    setEditTarget(item);
    setServerError("");
    setIsFormOpen(true);
  }, []);

  // 保存
  const handleSave = useCallback(
    async (formData: {
      medicinesCode: string;
      categoryId: number;
      riskFactorFlg: boolean;
      displayName: string;
      hospitalCode: string;
    }) => {
      setIsSaving(true);
      setServerError("");

      try {
        if (editTarget) {
          const result = await updateMedicineMaster(editTarget.id, formData);
          if (!result.success) {
            setServerError(result.value.cause as string);
            return;
          }
        } else {
          const result = await createMedicineMaster(formData);
          if (!result.success) {
            setServerError(result.value.cause as string);
            return;
          }
        }

        setIsFormOpen(false);
        setEditTarget(null);
        fetchData(searchQuery, data.currentPage, pageSize);
      } finally {
        setIsSaving(false);
      }
    },
    [editTarget, fetchData, searchQuery, data.currentPage, pageSize],
  );

  // 削除確認
  const handleDeleteClick = useCallback((item: MedicineMasterItem) => {
    setDeleteTarget(item);
  }, []);

  // 削除実行
  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      const result = await deleteMedicineMaster(deleteTarget.id);
      if (result.success) {
        setDeleteTarget(null);
        fetchData(searchQuery, data.currentPage, pageSize);
      } else {
        setListError(result.value.cause as string);
        setDeleteTarget(null);
      }
    } finally {
      setIsDeleting(false);
    }
  }, [deleteTarget, fetchData, searchQuery, data.currentPage, pageSize]);

  // CSVプレビュー
  const handleCsvPreview = useCallback(
    async (csvText: string): Promise<CsvImportPreview | null> => {
      const result = await previewCsvImport(csvText);
      if (result.success) {
        return result.value;
      }
      return null;
    },
    [],
  );

  // CSVインポート実行
  const handleCsvImport = useCallback(
    async (csvText: string): Promise<boolean> => {
      const result = await executeCsvImport(csvText);
      if (result.success) {
        fetchData(searchQuery, 1, pageSize);
        return true;
      }
      return false;
    },
    [fetchData, searchQuery, pageSize],
  );

  return (
    <div>
      <div style={headerStyle}>
        <SearchForm placeholder="薬剤コードまたは表示名で検索..." onSearch={handleSearch} />
        <div style={actionBarStyle}>
          <button
            type="button"
            style={secondaryButtonStyle}
            onClick={() => setIsCsvImportOpen(true)}
          >
            CSVインポート
          </button>
          <button type="button" style={primaryButtonStyle} onClick={handleCreate}>
            新規登録
          </button>
        </div>
      </div>

      {listError && (
        <div style={{ marginBottom: "1rem" }}>
          <ErrorMessage
            message={listError}
            onRetry={() => fetchData(searchQuery, data.currentPage, pageSize)}
          />
        </div>
      )}

      <div style={{ opacity: isPending ? 0.6 : 1, transition: "opacity 0.2s" }}>
        <MedicineMasterTable items={data.items} onEdit={handleEdit} onDelete={handleDeleteClick} />
      </div>

      {data.totalPages > 0 && (
        <Pagination
          currentPage={data.currentPage}
          totalPages={data.totalPages}
          totalItems={data.totalCount}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}

      {isFormOpen && (
        <MedicineMasterForm
          editTarget={editTarget}
          onSave={handleSave}
          onCancel={() => {
            setIsFormOpen(false);
            setEditTarget(null);
            setServerError("");
          }}
          isSaving={isSaving}
          serverError={serverError}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          isOpen={true}
          title="薬剤マスタの削除"
          message={`薬剤コード「${deleteTarget.medicinesCode}」を削除しますか？この操作は取り消せません。`}
          confirmLabel={isDeleting ? "削除中..." : "削除"}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
          variant="danger"
        />
      )}

      <CsvImportDialog
        isOpen={isCsvImportOpen}
        onPreview={handleCsvPreview}
        onImport={handleCsvImport}
        onClose={() => setIsCsvImportOpen(false)}
      />
    </div>
  );
}
