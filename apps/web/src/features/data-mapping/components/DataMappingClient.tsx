"use client";

import { useState, useCallback, useTransition, type CSSProperties } from "react";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { ErrorMessage } from "@/shared/components/ErrorMessage";
import type {
  DataMappingItem,
  DataMappingType,
  DataMappingListResponse,
  MappingStatusItem,
  MappingValidationResult,
  MappingTab,
  SystemTargetItem,
} from "../types";
import {
  MAPPING_TABS,
  LAB_ITEM_TARGETS,
  VITAL_SIGN_TARGETS,
  ADMISSION_INFO_TARGETS,
} from "../types";
import { MappingTable } from "./MappingTable";
import { DataMappingForm } from "./DataMappingForm";
import { ValidationPanel } from "./ValidationPanel";
import { getDataMappings } from "../queries/getDataMappings";
import { upsertDataMapping, deleteDataMapping, validateMappings } from "../server-actions";

export interface DataMappingClientProps {
  initialData: DataMappingListResponse;
}

const tabContainerStyle: CSSProperties = {
  display: "flex",
  borderBottom: "2px solid #e2e8f0",
  marginBottom: "1.5rem",
  gap: "0",
};

const tabStyle = (isActive: boolean): CSSProperties => ({
  padding: "0.75rem 1.5rem",
  fontSize: "0.875rem",
  fontWeight: isActive ? 600 : 400,
  color: isActive ? "#3b82f6" : "#64748b",
  backgroundColor: "transparent",
  border: "none",
  borderBottom: isActive ? "2px solid #3b82f6" : "2px solid transparent",
  cursor: "pointer",
  marginBottom: "-2px",
  transition: "color 0.15s, border-color 0.15s",
});

/**
 * マッピング状態付きのシステム項目一覧を構築する
 */
function buildMappingStatusItems(
  targets: SystemTargetItem[],
  mappings: DataMappingItem[],
): MappingStatusItem[] {
  return targets.map((target) => {
    const mapping = mappings.find((m) => m.targetCode === target.code) ?? null;
    return {
      ...target,
      status: mapping ? "mapped" : "unmapped",
      mapping,
    };
  });
}

/**
 * データマッピング管理のクライアント側メインコンポーネント
 *
 * タブで検査値・処方・バイタルサイン・入院情報のマッピングを切り替え、
 * 各マッピングの一覧表示・設定・削除・検証を統合する。
 */
export function DataMappingClient({ initialData }: DataMappingClientProps) {
  const [data, setData] = useState<DataMappingListResponse>(initialData);
  const [activeTab, setActiveTab] = useState<MappingTab>("lab");
  const [isPending, startTransition] = useTransition();

  // フォーム関連
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMappingType, setFormMappingType] = useState<DataMappingType>("LAB_ITEM");
  const [formTargetCode, setFormTargetCode] = useState("");
  const [formTargetLabel, setFormTargetLabel] = useState("");
  const [formEditTarget, setFormEditTarget] = useState<DataMappingItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [serverError, setServerError] = useState("");

  // 削除確認関連
  const [deleteTarget, setDeleteTarget] = useState<DataMappingItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 検証関連
  const [validationResult, setValidationResult] = useState<MappingValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  // エラー表示
  const [listError, setListError] = useState("");

  const fetchData = useCallback(() => {
    startTransition(async () => {
      const result = await getDataMappings();
      if (result.success) {
        setData(result.value);
        setListError("");
      } else {
        setListError("データマッピングの取得に失敗しました");
      }
    });
  }, []);

  /** 現在のタブに応じたマッピング種別を取得 */
  const getMappingTypesForTab = useCallback(
    (tab: MappingTab): DataMappingType[] => {
      switch (tab) {
        case "lab":
          return ["LAB_ITEM"];
        case "prescription":
          return ["PRESCRIPTION_TYPE"];
        case "vital":
          return ["VITAL_SIGN"];
        case "admission":
          return ["WARD", "ROOM"];
        default:
          return [];
      }
    },
    [],
  );

  /** 現在のタブに応じたシステム項目一覧を取得 */
  const getTargetsForTab = useCallback((tab: MappingTab): SystemTargetItem[] => {
    switch (tab) {
      case "lab":
        return LAB_ITEM_TARGETS;
      case "vital":
        return VITAL_SIGN_TARGETS;
      case "admission":
        return ADMISSION_INFO_TARGETS;
      default:
        return [];
    }
  }, []);

  /** 現在のタブに応じたマッピング状態付き項目一覧 */
  const getMappingStatusItems = useCallback((): MappingStatusItem[] => {
    if (activeTab === "prescription") {
      // 処方マッピングは薬剤マスタベースなので、既存マッピングを表示
      const prescriptionMappings = data.items.filter(
        (m) => m.mappingType === "PRESCRIPTION_TYPE",
      );
      return prescriptionMappings.map((m) => ({
        code: m.targetCode,
        label: m.targetCode,
        category: "処方",
        status: "mapped" as const,
        mapping: m,
      }));
    }

    const types = getMappingTypesForTab(activeTab);
    const targets = getTargetsForTab(activeTab);
    const relevantMappings = data.items.filter((m) => types.includes(m.mappingType));

    if (activeTab === "admission") {
      // 入院情報は種別ごとに分けてマッピング
      return targets.map((target) => {
        const mappingType = target.code === "WARD" ? "WARD" : "ROOM";
        const mapping =
          relevantMappings.find(
            (m) => m.mappingType === mappingType && m.targetCode === target.code,
          ) ?? null;
        return {
          ...target,
          status: mapping ? ("mapped" as const) : ("unmapped" as const),
          mapping,
        };
      });
    }

    return buildMappingStatusItems(targets, relevantMappings);
  }, [activeTab, data.items, getMappingTypesForTab, getTargetsForTab]);

  /** マッピング編集開始 */
  const handleEdit = useCallback(
    (targetCode: string, targetLabel: string, mapping: DataMappingItem | null) => {
      let mappingType: DataMappingType;
      switch (activeTab) {
        case "lab":
          mappingType = "LAB_ITEM";
          break;
        case "prescription":
          mappingType = "PRESCRIPTION_TYPE";
          break;
        case "vital":
          mappingType = "VITAL_SIGN";
          break;
        case "admission":
          mappingType = targetCode === "WARD" ? "WARD" : "ROOM";
          break;
        default:
          mappingType = "LAB_ITEM";
      }

      setFormMappingType(mappingType);
      setFormTargetCode(targetCode);
      setFormTargetLabel(targetLabel);
      setFormEditTarget(mapping);
      setServerError("");
      setIsFormOpen(true);
    },
    [activeTab],
  );

  /** マッピング保存 */
  const handleSave = useCallback(
    async (formData: {
      mappingType: DataMappingType;
      sourceCode: string;
      targetCode: string;
      priority: number;
    }) => {
      setIsSaving(true);
      setServerError("");

      try {
        const result = await upsertDataMapping(formData);
        if (!result.success) {
          setServerError(result.value.cause as string);
          return;
        }

        setIsFormOpen(false);
        setFormEditTarget(null);
        fetchData();
      } finally {
        setIsSaving(false);
      }
    },
    [fetchData],
  );

  /** マッピング削除確認 */
  const handleDeleteClick = useCallback((mapping: DataMappingItem) => {
    setDeleteTarget(mapping);
  }, []);

  /** マッピング削除実行 */
  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      const result = await deleteDataMapping(deleteTarget.id);
      if (result.success) {
        setDeleteTarget(null);
        fetchData();
      } else {
        setListError(result.value.cause as string);
        setDeleteTarget(null);
      }
    } finally {
      setIsDeleting(false);
    }
  }, [deleteTarget, fetchData]);

  /** 検証実行 */
  const handleValidate = useCallback(async () => {
    setIsValidating(true);
    try {
      const result = await validateMappings();
      if (result.success) {
        setValidationResult(result.value);
      } else {
        setListError("マッピング検証に失敗しました");
      }
    } finally {
      setIsValidating(false);
    }
  }, []);

  /** 処方マッピングの手動追加 */
  const handleAddPrescriptionMapping = useCallback(() => {
    setFormMappingType("PRESCRIPTION_TYPE");
    setFormTargetCode("");
    setFormTargetLabel("処方コード");
    setFormEditTarget(null);
    setServerError("");
    setIsFormOpen(true);
  }, []);

  const mappingStatusItems = getMappingStatusItems();

  return (
    <div>
      {/* 検証パネル */}
      <ValidationPanel
        result={validationResult}
        isLoading={isValidating}
        onValidate={handleValidate}
      />

      {/* タブ */}
      <div style={tabContainerStyle}>
        {MAPPING_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            style={tabStyle(activeTab === tab.key)}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* エラー表示 */}
      {listError && (
        <div style={{ marginBottom: "1rem" }}>
          <ErrorMessage message={listError} onRetry={fetchData} />
        </div>
      )}

      {/* 処方マッピングの場合は追加ボタン */}
      {activeTab === "prescription" && (
        <div style={{ marginBottom: "1rem" }}>
          <button
            type="button"
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#3b82f6",
              color: "#ffffff",
              border: "none",
              borderRadius: "0.375rem",
              fontSize: "0.875rem",
              cursor: "pointer",
            }}
            onClick={handleAddPrescriptionMapping}
          >
            処方マッピング追加
          </button>
        </div>
      )}

      {/* マッピングテーブル */}
      <div style={{ opacity: isPending ? 0.6 : 1, transition: "opacity 0.2s" }}>
        <MappingTable
          items={mappingStatusItems}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
        />
      </div>

      {/* フォームダイアログ */}
      {isFormOpen && (
        <DataMappingForm
          mappingType={formMappingType}
          targetCode={formTargetCode}
          targetLabel={formTargetLabel}
          editTarget={formEditTarget}
          onSave={handleSave}
          onCancel={() => {
            setIsFormOpen(false);
            setFormEditTarget(null);
            setServerError("");
          }}
          isSaving={isSaving}
          serverError={serverError}
        />
      )}

      {/* 削除確認ダイアログ */}
      {deleteTarget && (
        <ConfirmDialog
          isOpen={true}
          title="マッピングの解除"
          message={`マッピング（病院側コード: ${deleteTarget.sourceCode}）を解除しますか？`}
          confirmLabel={isDeleting ? "解除中..." : "解除"}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
          variant="danger"
        />
      )}
    </div>
  );
}
