"use client";

import { useState, type CSSProperties, type FormEvent } from "react";
import type { DataMappingItem, DataMappingType } from "../types";

export interface DataMappingFormProps {
  mappingType: DataMappingType;
  targetCode: string;
  targetLabel: string;
  editTarget: DataMappingItem | null;
  onSave: (data: {
    mappingType: DataMappingType;
    sourceCode: string;
    targetCode: string;
    priority: number;
  }) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
  serverError: string;
}

const overlayStyle: CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const dialogStyle: CSSProperties = {
  backgroundColor: "#ffffff",
  borderRadius: "0.5rem",
  padding: "1.5rem",
  maxWidth: "28rem",
  width: "100%",
  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
};

const titleStyle: CSSProperties = {
  fontSize: "1.125rem",
  fontWeight: 600,
  color: "#1e293b",
  marginBottom: "1rem",
};

const fieldStyle: CSSProperties = {
  marginBottom: "1rem",
};

const labelStyle: CSSProperties = {
  display: "block",
  fontSize: "0.875rem",
  fontWeight: 500,
  color: "#374151",
  marginBottom: "0.25rem",
};

const inputStyle: CSSProperties = {
  width: "100%",
  padding: "0.5rem 0.75rem",
  border: "1px solid #d1d5db",
  borderRadius: "0.375rem",
  fontSize: "0.875rem",
  boxSizing: "border-box",
};

const readOnlyInputStyle: CSSProperties = {
  ...inputStyle,
  backgroundColor: "#f3f4f6",
  color: "#6b7280",
};

const errorStyle: CSSProperties = {
  backgroundColor: "#fef2f2",
  color: "#dc2626",
  padding: "0.75rem",
  borderRadius: "0.375rem",
  fontSize: "0.875rem",
  marginBottom: "1rem",
};

const actionsStyle: CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "0.5rem",
  marginTop: "1.5rem",
};

const cancelButtonStyle: CSSProperties = {
  padding: "0.5rem 1rem",
  backgroundColor: "#f1f5f9",
  color: "#475569",
  border: "1px solid #cbd5e1",
  borderRadius: "0.375rem",
  fontSize: "0.875rem",
  cursor: "pointer",
};

const saveButtonStyle: CSSProperties = {
  padding: "0.5rem 1rem",
  backgroundColor: "#3b82f6",
  color: "#ffffff",
  border: "none",
  borderRadius: "0.375rem",
  fontSize: "0.875rem",
  cursor: "pointer",
};

const disabledButtonStyle: CSSProperties = {
  ...saveButtonStyle,
  opacity: 0.6,
  cursor: "not-allowed",
};

/**
 * データマッピング登録・編集フォーム
 *
 * 指定されたシステム項目に対し、病院側コードと優先順位を設定する。
 */
export function DataMappingForm({
  mappingType,
  targetCode,
  targetLabel,
  editTarget,
  onSave,
  onCancel,
  isSaving,
  serverError,
}: DataMappingFormProps) {
  const [sourceCode, setSourceCode] = useState(editTarget?.sourceCode ?? "");
  const [priority, setPriority] = useState(editTarget?.priority ?? 0);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // クライアント側バリデーション
    const errors: Record<string, string> = {};
    if (!sourceCode.trim()) {
      errors.sourceCode = "病院側コードを入力してください";
    }
    if (sourceCode.length > 50) {
      errors.sourceCode = "病院側コードは50文字以内で入力してください";
    }
    if (priority < 0 || priority > 999) {
      errors.priority = "優先順位は0~999で入力してください";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    await onSave({
      mappingType,
      sourceCode: sourceCode.trim(),
      targetCode,
      priority,
    });
  };

  return (
    <div style={overlayStyle} onClick={onCancel}>
      <div style={dialogStyle} onClick={(e) => e.stopPropagation()}>
        <h2 style={titleStyle}>
          {editTarget ? "マッピング編集" : "マッピング設定"}
        </h2>

        {serverError && <div style={errorStyle}>{serverError}</div>}

        <form onSubmit={handleSubmit}>
          <div style={fieldStyle}>
            <label style={labelStyle}>システム項目</label>
            <input
              type="text"
              style={readOnlyInputStyle}
              value={`${targetLabel} (${targetCode})`}
              readOnly
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle} htmlFor="sourceCode">
              病院側コード
            </label>
            <input
              id="sourceCode"
              type="text"
              style={inputStyle}
              value={sourceCode}
              onChange={(e) => setSourceCode(e.target.value)}
              placeholder="病院DBのコードを入力"
              maxLength={50}
            />
            {fieldErrors.sourceCode && (
              <p style={{ color: "#dc2626", fontSize: "0.75rem", marginTop: "0.25rem" }}>
                {fieldErrors.sourceCode}
              </p>
            )}
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle} htmlFor="priority">
              優先順位
            </label>
            <input
              id="priority"
              type="number"
              style={inputStyle}
              value={priority}
              onChange={(e) => setPriority(Number(e.target.value))}
              min={0}
              max={999}
            />
            {fieldErrors.priority && (
              <p style={{ color: "#dc2626", fontSize: "0.75rem", marginTop: "0.25rem" }}>
                {fieldErrors.priority}
              </p>
            )}
            <p style={{ color: "#6b7280", fontSize: "0.75rem", marginTop: "0.25rem" }}>
              数値が小さいほど優先度が高くなります（0が最優先）
            </p>
          </div>

          <div style={actionsStyle}>
            <button type="button" style={cancelButtonStyle} onClick={onCancel}>
              キャンセル
            </button>
            <button
              type="submit"
              style={isSaving ? disabledButtonStyle : saveButtonStyle}
              disabled={isSaving}
            >
              {isSaving ? "保存中..." : "保存"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
