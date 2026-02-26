"use client";

import type { CSSProperties } from "react";
import type { MappingValidationResult } from "../types";

export interface ValidationPanelProps {
  result: MappingValidationResult | null;
  isLoading: boolean;
  onValidate: () => void;
}

const panelStyle: CSSProperties = {
  padding: "1rem",
  borderRadius: "0.5rem",
  border: "1px solid #e2e8f0",
  marginBottom: "1.5rem",
};

const headerStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "0.75rem",
};

const titleStyle: CSSProperties = {
  fontSize: "1rem",
  fontWeight: 600,
  color: "#1e293b",
};

const validateButtonStyle: CSSProperties = {
  padding: "0.375rem 0.75rem",
  backgroundColor: "#3b82f6",
  color: "#ffffff",
  border: "none",
  borderRadius: "0.375rem",
  fontSize: "0.8125rem",
  cursor: "pointer",
};

const disabledButtonStyle: CSSProperties = {
  ...validateButtonStyle,
  opacity: 0.6,
  cursor: "not-allowed",
};

const successStyle: CSSProperties = {
  backgroundColor: "#f0fdf4",
  border: "1px solid #bbf7d0",
  padding: "0.75rem",
  borderRadius: "0.375rem",
  color: "#166534",
  fontSize: "0.875rem",
};

const warningStyle: CSSProperties = {
  backgroundColor: "#fffbeb",
  border: "1px solid #fde68a",
  padding: "0.75rem",
  borderRadius: "0.375rem",
  fontSize: "0.875rem",
};

const warningTitleStyle: CSSProperties = {
  fontWeight: 600,
  color: "#92400e",
  marginBottom: "0.5rem",
};

const warningListStyle: CSSProperties = {
  margin: 0,
  paddingLeft: "1.25rem",
  color: "#78350f",
};

const progressStyle: CSSProperties = {
  fontSize: "0.875rem",
  color: "#64748b",
};

/**
 * マッピング検証パネル
 *
 * 電子カルテ同期に必要な項目がすべてマッピング済みかを検証し、
 * 結果を表示する。未設定項目がある場合は警告を表示する。
 */
export function ValidationPanel({ result, isLoading, onValidate }: ValidationPanelProps) {
  return (
    <div style={panelStyle}>
      <div style={headerStyle}>
        <h3 style={titleStyle}>マッピング検証</h3>
        <button
          type="button"
          style={isLoading ? disabledButtonStyle : validateButtonStyle}
          disabled={isLoading}
          onClick={onValidate}
        >
          {isLoading ? "検証中..." : "検証実行"}
        </button>
      </div>

      {result && (
        <div>
          <p style={progressStyle}>
            設定済: {result.mappedCount} / {result.totalRequired} 項目
          </p>

          {result.isValid ? (
            <div style={successStyle}>
              すべての必須項目がマッピング済みです。電子カルテ同期を実行できます。
            </div>
          ) : (
            <div style={warningStyle}>
              <div style={warningTitleStyle}>
                未設定の項目があります（{result.unmappedItems.length}件）
              </div>
              <ul style={warningListStyle}>
                {result.unmappedItems.map((item) => (
                  <li key={`${item.category}-${item.code}`}>
                    [{item.category}] {item.label}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {!result && !isLoading && (
        <p style={{ ...progressStyle, fontStyle: "italic" }}>
          「検証実行」をクリックしてマッピングの完全性を確認してください。
        </p>
      )}
    </div>
  );
}
