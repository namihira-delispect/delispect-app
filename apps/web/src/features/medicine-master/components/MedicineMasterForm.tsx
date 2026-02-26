"use client";

import { useState, useCallback, type CSSProperties, type FormEvent } from "react";
import type { MedicineMasterItem } from "../types";
import { medicineMasterSchema } from "../schemata";

export interface MedicineMasterFormProps {
  /** 編集対象（新規の場合はnull） */
  editTarget: MedicineMasterItem | null;
  /** 保存時のコールバック */
  onSave: (data: {
    medicinesCode: string;
    categoryId: number;
    riskFactorFlg: boolean;
    displayName: string;
    hospitalCode: string;
  }) => Promise<void>;
  /** キャンセル時のコールバック */
  onCancel: () => void;
  /** 保存中フラグ */
  isSaving?: boolean;
  /** サーバーエラーメッセージ */
  serverError?: string;
}

const overlayStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const formContainerStyle: CSSProperties = {
  backgroundColor: "#ffffff",
  borderRadius: "0.5rem",
  padding: "1.5rem",
  minWidth: "28rem",
  maxWidth: "36rem",
  boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
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
  color: "#475569",
  marginBottom: "0.25rem",
};

const inputStyle: CSSProperties = {
  width: "100%",
  padding: "0.5rem 0.75rem",
  border: "1px solid #cbd5e1",
  borderRadius: "0.375rem",
  fontSize: "0.875rem",
  boxSizing: "border-box",
};

const checkboxContainerStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
};

const errorTextStyle: CSSProperties = {
  fontSize: "0.75rem",
  color: "#dc2626",
  marginTop: "0.25rem",
};

const buttonGroupStyle: CSSProperties = {
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

const serverErrorStyle: CSSProperties = {
  padding: "0.5rem 0.75rem",
  backgroundColor: "#fef2f2",
  border: "1px solid #fecaca",
  borderRadius: "0.375rem",
  color: "#dc2626",
  fontSize: "0.875rem",
  marginBottom: "1rem",
};

/**
 * 薬剤マスタ登録・編集フォーム（モーダル）
 */
export function MedicineMasterForm({
  editTarget,
  onSave,
  onCancel,
  isSaving = false,
  serverError,
}: MedicineMasterFormProps) {
  const isEdit = editTarget !== null;

  const [medicinesCode, setMedicinesCode] = useState(editTarget?.medicinesCode ?? "");
  const [categoryId, setCategoryId] = useState(editTarget?.categoryId?.toString() ?? "");
  const [riskFactorFlg, setRiskFactorFlg] = useState(editTarget?.riskFactorFlg ?? false);
  const [displayName, setDisplayName] = useState(
    editTarget?.medicineNameSettings?.[0]?.displayName ?? "",
  );
  const [hospitalCode, setHospitalCode] = useState(
    editTarget?.medicineNameSettings?.[0]?.hospitalCode ?? "",
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      const input = {
        medicinesCode,
        categoryId: Number(categoryId),
        riskFactorFlg,
        displayName,
        hospitalCode,
      };

      const parsed = medicineMasterSchema.safeParse(input);
      if (!parsed.success) {
        setFieldErrors(parsed.error.flatten().fieldErrors as Record<string, string[]>);
        return;
      }

      setFieldErrors({});
      await onSave(parsed.data);
    },
    [medicinesCode, categoryId, riskFactorFlg, displayName, hospitalCode, onSave],
  );

  return (
    <div
      style={overlayStyle}
      role="dialog"
      aria-modal="true"
      aria-labelledby="medicine-form-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div style={formContainerStyle}>
        <h2 id="medicine-form-title" style={titleStyle}>
          {isEdit ? "薬剤マスタ編集" : "薬剤マスタ新規登録"}
        </h2>

        {serverError && <div style={serverErrorStyle}>{serverError}</div>}

        <form onSubmit={handleSubmit}>
          <div style={fieldStyle}>
            <label style={labelStyle} htmlFor="medicinesCode">
              薬剤コード
            </label>
            <input
              id="medicinesCode"
              type="text"
              style={inputStyle}
              value={medicinesCode}
              onChange={(e) => setMedicinesCode(e.target.value)}
              placeholder="例: YJ12345"
              disabled={isSaving}
            />
            {fieldErrors.medicinesCode?.map((err) => (
              <div key={err} style={errorTextStyle}>
                {err}
              </div>
            ))}
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle} htmlFor="categoryId">
              カテゴリID
            </label>
            <input
              id="categoryId"
              type="number"
              style={inputStyle}
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              placeholder="例: 1"
              min="1"
              disabled={isSaving}
            />
            {fieldErrors.categoryId?.map((err) => (
              <div key={err} style={errorTextStyle}>
                {err}
              </div>
            ))}
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle} htmlFor="displayName">
              表示名
            </label>
            <input
              id="displayName"
              type="text"
              style={inputStyle}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="例: アセタゾラミド錠"
              disabled={isSaving}
            />
            {fieldErrors.displayName?.map((err) => (
              <div key={err} style={errorTextStyle}>
                {err}
              </div>
            ))}
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle} htmlFor="hospitalCode">
              病院コード
            </label>
            <input
              id="hospitalCode"
              type="text"
              style={inputStyle}
              value={hospitalCode}
              onChange={(e) => setHospitalCode(e.target.value)}
              placeholder="例: H001"
              disabled={isSaving}
            />
            {fieldErrors.hospitalCode?.map((err) => (
              <div key={err} style={errorTextStyle}>
                {err}
              </div>
            ))}
          </div>

          <div style={fieldStyle}>
            <div style={checkboxContainerStyle}>
              <input
                id="riskFactorFlg"
                type="checkbox"
                checked={riskFactorFlg}
                onChange={(e) => setRiskFactorFlg(e.target.checked)}
                disabled={isSaving}
              />
              <label htmlFor="riskFactorFlg" style={{ fontSize: "0.875rem", color: "#475569" }}>
                リスク要因フラグ
              </label>
            </div>
          </div>

          <div style={buttonGroupStyle}>
            <button type="button" style={cancelButtonStyle} onClick={onCancel} disabled={isSaving}>
              キャンセル
            </button>
            <button
              type="submit"
              style={{
                ...saveButtonStyle,
                opacity: isSaving ? 0.6 : 1,
              }}
              disabled={isSaving}
            >
              {isSaving ? "保存中..." : isEdit ? "更新" : "登録"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
