"use client";

import { useState, type CSSProperties, type FormEvent } from "react";
import type { HighRiskKasanAssessmentDisplay, AssessmentItemDisplay } from "../types";
import { ASSESSMENT_CATEGORY_LABELS } from "../types";
import type { AssessmentCategory } from "../types";

export interface HighRiskKasanAssessmentFormProps {
  /** アセスメント情報 */
  assessment: HighRiskKasanAssessmentDisplay;
  /** 保存時のコールバック */
  onSave: (medicalHistoryItems: {
    hasDementia: boolean;
    hasOrganicBrainDamage: boolean;
    isHeavyAlcohol: boolean;
    hasDeliriumHistory: boolean;
    hasGeneralAnesthesia: boolean;
  }) => Promise<void>;
  /** 保存中フラグ */
  isSaving: boolean;
}

const cardStyle: CSSProperties = {
  border: "1px solid #e2e8f0",
  borderRadius: "0.5rem",
  padding: "1rem",
  backgroundColor: "#ffffff",
};

const titleStyle: CSSProperties = {
  fontSize: "1rem",
  fontWeight: 600,
  color: "#1e293b",
  marginBottom: "0.75rem",
  paddingBottom: "0.5rem",
  borderBottom: "1px solid #e2e8f0",
};

const categoryHeaderStyle: CSSProperties = {
  fontSize: "0.875rem",
  fontWeight: 600,
  color: "#475569",
  marginTop: "0.75rem",
  marginBottom: "0.5rem",
  padding: "0.375rem 0.5rem",
  backgroundColor: "#f8fafc",
  borderRadius: "0.25rem",
};

const itemRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0.5rem",
  borderBottom: "1px solid #f1f5f9",
};

const checkboxContainerStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
};

const labelStyle: CSSProperties = {
  fontSize: "0.8125rem",
  color: "#1e293b",
  fontWeight: 500,
  cursor: "pointer",
};

const criteriaStyle: CSSProperties = {
  fontSize: "0.75rem",
  color: "#94a3b8",
  marginTop: "0.125rem",
};

const sourceBadgeStyle = (source: "MANUAL" | "AUTO"): CSSProperties => ({
  display: "inline-block",
  padding: "0.125rem 0.5rem",
  borderRadius: "9999px",
  fontSize: "0.6875rem",
  fontWeight: 500,
  backgroundColor: source === "AUTO" ? "#eff6ff" : "#f0fdf4",
  color: source === "AUTO" ? "#2563eb" : "#16a34a",
});

const resultContainerStyle: CSSProperties = {
  marginTop: "1rem",
  padding: "0.75rem",
  borderRadius: "0.375rem",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const buttonStyle: CSSProperties = {
  padding: "0.5rem 1.5rem",
  backgroundColor: "#3b82f6",
  color: "#ffffff",
  border: "none",
  borderRadius: "0.375rem",
  fontSize: "0.875rem",
  fontWeight: 500,
  cursor: "pointer",
  marginTop: "1rem",
};

const disabledButtonStyle: CSSProperties = {
  ...buttonStyle,
  backgroundColor: "#94a3b8",
  cursor: "not-allowed",
};

const assessedInfoStyle: CSSProperties = {
  fontSize: "0.75rem",
  color: "#64748b",
  marginTop: "0.5rem",
};

/** 手動入力項目キーの型 */
type ManualItemKey =
  | "hasDementia"
  | "hasOrganicBrainDamage"
  | "isHeavyAlcohol"
  | "hasDeliriumHistory"
  | "hasGeneralAnesthesia";

/** 手動入力項目キーの配列 */
const MANUAL_ITEM_KEYS: ManualItemKey[] = [
  "hasDementia",
  "hasOrganicBrainDamage",
  "isHeavyAlcohol",
  "hasDeliriumHistory",
  "hasGeneralAnesthesia",
];

/**
 * 日時をフォーマットする（YYYY/MM/DD HH:mm）
 */
function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${y}/${m}/${d} ${h}:${min}`;
}

/**
 * カテゴリー別にアセスメント項目をグループ化する
 */
function groupByCategory(
  items: AssessmentItemDisplay[],
): Record<AssessmentCategory, AssessmentItemDisplay[]> {
  const groups: Record<AssessmentCategory, AssessmentItemDisplay[]> = {
    MEDICAL_HISTORY: [],
    AGE: [],
    RISK_DRUG: [],
  };

  for (const item of items) {
    groups[item.category].push(item);
  }

  return groups;
}

/**
 * せん妄ハイリスクケア加算アセスメントフォーム
 *
 * アセスメント項目の一覧表示、チェックボックスでの該当/非該当選択、
 * 判定結果の表示、保存機能を提供する。
 */
export function HighRiskKasanAssessmentForm({
  assessment,
  onSave,
  isSaving,
}: HighRiskKasanAssessmentFormProps) {
  // 手動入力項目のチェック状態管理
  const [checkedItems, setCheckedItems] = useState<Record<ManualItemKey, boolean>>(() => {
    const initial: Record<ManualItemKey, boolean> = {
      hasDementia: false,
      hasOrganicBrainDamage: false,
      isHeavyAlcohol: false,
      hasDeliriumHistory: false,
      hasGeneralAnesthesia: false,
    };

    // 既存のアセスメントデータから初期値を設定
    for (const item of assessment.items) {
      if (MANUAL_ITEM_KEYS.includes(item.key as ManualItemKey) && item.isApplicable != null) {
        initial[item.key as ManualItemKey] = item.isApplicable;
      }
    }

    return initial;
  });

  const handleCheckboxChange = (key: ManualItemKey, checked: boolean) => {
    setCheckedItems((prev) => ({
      ...prev,
      [key]: checked,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await onSave(checkedItems);
  };

  // カテゴリー別にグループ化
  const groupedItems = groupByCategory(assessment.items);

  // 現在の判定状態を計算（保存前のプレビュー）
  const anyManualChecked = Object.values(checkedItems).some((v) => v === true);
  const anyAutoApplicable = assessment.items.some(
    (item) => item.source === "AUTO" && item.isApplicable === true,
  );
  const currentEligible = anyManualChecked || anyAutoApplicable;

  const categoryOrder: AssessmentCategory[] = ["MEDICAL_HISTORY", "AGE", "RISK_DRUG"];

  return (
    <div style={cardStyle}>
      <h2 style={titleStyle}>せん妄ハイリスクケア加算アセスメント</h2>

      <form onSubmit={handleSubmit}>
        {categoryOrder.map((category) => {
          const categoryItems = groupedItems[category];
          if (categoryItems.length === 0) return null;

          return (
            <div key={category}>
              <div style={categoryHeaderStyle}>{ASSESSMENT_CATEGORY_LABELS[category]}</div>
              {categoryItems.map((item) => {
                const isManual = item.source === "MANUAL";
                const isChecked = isManual
                  ? (checkedItems[item.key as ManualItemKey] ?? false)
                  : item.isApplicable === true;

                return (
                  <div key={item.key} style={itemRowStyle}>
                    <div>
                      <div style={checkboxContainerStyle}>
                        <input
                          type="checkbox"
                          id={`assessment-${item.key}`}
                          checked={isChecked}
                          disabled={!isManual || isSaving}
                          onChange={(e) => {
                            if (isManual) {
                              handleCheckboxChange(item.key as ManualItemKey, e.target.checked);
                            }
                          }}
                          aria-label={item.label}
                        />
                        <label htmlFor={`assessment-${item.key}`} style={labelStyle}>
                          {item.label}
                        </label>
                        <span style={sourceBadgeStyle(item.source)}>
                          {item.source === "AUTO" ? "自動" : "手動"}
                        </span>
                      </div>
                      <div style={criteriaStyle}>{item.criteria}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}

        {/* 判定結果表示 */}
        <div
          style={{
            ...resultContainerStyle,
            backgroundColor: currentEligible ? "#fef2f2" : "#f0fdf4",
          }}
        >
          <div>
            <span
              style={{
                fontSize: "0.875rem",
                fontWeight: 600,
                color: currentEligible ? "#dc2626" : "#16a34a",
              }}
            >
              判定結果: {currentEligible ? "加算対象" : "非対象"}
            </span>
            {assessment.isAssessed && (
              <span
                style={{
                  marginLeft: "0.5rem",
                  fontSize: "0.75rem",
                  color: "#64748b",
                }}
              >
                (確定済み)
              </span>
            )}
          </div>
        </div>

        {/* 評価者・評価日時 */}
        {assessment.isAssessed && assessment.assessedBy && assessment.assessedAt && (
          <div style={assessedInfoStyle}>
            評価者: {assessment.assessedBy} / 評価日時: {formatDateTime(assessment.assessedAt)}
          </div>
        )}

        {/* 保存ボタン */}
        <button
          type="submit"
          style={isSaving ? disabledButtonStyle : buttonStyle}
          disabled={isSaving}
        >
          {isSaving ? "保存中..." : assessment.isAssessed ? "判定結果を更新" : "判定結果を保存"}
        </button>
      </form>
    </div>
  );
}
