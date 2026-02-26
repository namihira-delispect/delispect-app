"use client";

import { useState, type CSSProperties } from "react";
import type { ChecklistOption, ChecklistSaveData } from "../types";

export interface ChecklistFormProps {
  /** カテゴリー表示ラベル */
  categoryLabel: string;
  /** カテゴリー説明 */
  categoryDescription: string;
  /** チェックリスト選択肢 */
  options: ChecklistOption[];
  /** 初期選択状態 */
  initialData: ChecklistSaveData | null;
  /** 保存中フラグ */
  saving: boolean;
  /** 保存ハンドラ */
  onSave: (data: ChecklistSaveData) => void;
}

const formContainerStyle: CSSProperties = {
  border: "1px solid #e2e8f0",
  borderRadius: "0.5rem",
  backgroundColor: "#ffffff",
  overflow: "hidden",
};

const headerStyle: CSSProperties = {
  padding: "1rem 1.25rem",
  borderBottom: "1px solid #e2e8f0",
  backgroundColor: "#f8fafc",
};

const headerTitleStyle: CSSProperties = {
  fontSize: "1.125rem",
  fontWeight: 600,
  color: "#1e293b",
  marginBottom: "0.25rem",
};

const headerDescStyle: CSSProperties = {
  fontSize: "0.8125rem",
  color: "#64748b",
};

const checklistContainerStyle: CSSProperties = {
  padding: "1rem 1.25rem",
};

const checklistItemStyle: CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: "0.75rem",
  padding: "0.75rem 0",
  borderBottom: "1px solid #f1f5f9",
};

const checkboxStyle: CSSProperties = {
  width: "1.125rem",
  height: "1.125rem",
  marginTop: "0.125rem",
  cursor: "pointer",
  accentColor: "#3b82f6",
};

const checklistLabelStyle: CSSProperties = {
  flex: 1,
};

const labelTextStyle: CSSProperties = {
  fontSize: "0.875rem",
  fontWeight: 500,
  color: "#1e293b",
  cursor: "pointer",
};

const labelDescStyle: CSSProperties = {
  fontSize: "0.75rem",
  color: "#64748b",
  marginTop: "0.125rem",
};

const notesContainerStyle: CSSProperties = {
  padding: "1rem 1.25rem",
  borderTop: "1px solid #e2e8f0",
};

const notesLabelStyle: CSSProperties = {
  display: "block",
  fontSize: "0.875rem",
  fontWeight: 500,
  color: "#475569",
  marginBottom: "0.375rem",
};

const notesTextareaStyle: CSSProperties = {
  width: "100%",
  minHeight: "80px",
  padding: "0.5rem 0.75rem",
  border: "1px solid #d1d5db",
  borderRadius: "0.375rem",
  fontSize: "0.875rem",
  fontFamily: "inherit",
  resize: "vertical",
  boxSizing: "border-box",
};

const footerStyle: CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "0.75rem",
  padding: "1rem 1.25rem",
  borderTop: "1px solid #e2e8f0",
  backgroundColor: "#f8fafc",
};

const saveButtonStyle: CSSProperties = {
  padding: "0.5rem 1.5rem",
  backgroundColor: "#3b82f6",
  color: "#ffffff",
  border: "none",
  borderRadius: "0.375rem",
  fontSize: "0.875rem",
  fontWeight: 500,
  cursor: "pointer",
};

const saveButtonDisabledStyle: CSSProperties = {
  ...saveButtonStyle,
  backgroundColor: "#94a3b8",
  cursor: "not-allowed",
};

const selectAllButtonStyle: CSSProperties = {
  padding: "0.5rem 1rem",
  backgroundColor: "transparent",
  color: "#3b82f6",
  border: "1px solid #3b82f6",
  borderRadius: "0.375rem",
  fontSize: "0.8125rem",
  fontWeight: 500,
  cursor: "pointer",
};

const selectedCountStyle: CSSProperties = {
  fontSize: "0.8125rem",
  color: "#64748b",
  padding: "0.5rem 0",
};

/**
 * チェックリストフォームコンポーネント
 *
 * その他カテゴリのケアプラン作成で使用するチェックリスト形式のフォーム。
 * 各対策方法をチェックボックスで選択し、任意でメモを追記できる。
 */
export function ChecklistForm({
  categoryLabel,
  categoryDescription,
  options,
  initialData,
  saving,
  onSave,
}: ChecklistFormProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(initialData?.selectedOptionIds ?? []),
  );
  const [notes, setNotes] = useState(initialData?.notes ?? "");

  const handleToggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === options.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(options.map((opt) => opt.id)));
    }
  };

  const handleSave = () => {
    const data: ChecklistSaveData = {
      selectedOptionIds: Array.from(selectedIds),
      ...(notes.trim() ? { notes: notes.trim() } : {}),
    };
    onSave(data);
  };

  const allSelected = selectedIds.size === options.length;

  return (
    <div style={formContainerStyle}>
      <div style={headerStyle}>
        <h2 style={headerTitleStyle}>{categoryLabel}</h2>
        <p style={headerDescStyle}>{categoryDescription}</p>
      </div>

      <div style={checklistContainerStyle}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "0.5rem",
          }}
        >
          <span style={selectedCountStyle}>
            {selectedIds.size}/{options.length} 項目選択中
          </span>
          <button type="button" onClick={handleSelectAll} style={selectAllButtonStyle}>
            {allSelected ? "すべて解除" : "すべて選択"}
          </button>
        </div>

        {options.map((option) => (
          <div key={option.id} style={checklistItemStyle}>
            <input
              type="checkbox"
              id={option.id}
              checked={selectedIds.has(option.id)}
              onChange={() => handleToggle(option.id)}
              style={checkboxStyle}
            />
            <label htmlFor={option.id} style={checklistLabelStyle}>
              <span style={labelTextStyle}>{option.label}</span>
              {option.description && <p style={labelDescStyle}>{option.description}</p>}
            </label>
          </div>
        ))}
      </div>

      <div style={notesContainerStyle}>
        <label htmlFor="checklist-notes" style={notesLabelStyle}>
          メモ（任意）
        </label>
        <textarea
          id="checklist-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="追加の指示やメモがあれば入力してください"
          style={notesTextareaStyle}
          maxLength={1000}
        />
      </div>

      <div style={footerStyle}>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          style={saving ? saveButtonDisabledStyle : saveButtonStyle}
        >
          {saving ? "保存中..." : "保存する"}
        </button>
      </div>
    </div>
  );
}
