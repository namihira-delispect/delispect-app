"use client";

import type { CSSProperties } from "react";
import type { MedicineMasterItem } from "../types";

export interface MedicineMasterTableProps {
  items: MedicineMasterItem[];
  onEdit: (item: MedicineMasterItem) => void;
  onDelete: (item: MedicineMasterItem) => void;
}

const tableStyle: CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: "0.875rem",
};

const thStyle: CSSProperties = {
  textAlign: "left",
  padding: "0.75rem 1rem",
  backgroundColor: "#f8fafc",
  borderBottom: "2px solid #e2e8f0",
  color: "#475569",
  fontWeight: 600,
  whiteSpace: "nowrap",
};

const tdStyle: CSSProperties = {
  padding: "0.75rem 1rem",
  borderBottom: "1px solid #e2e8f0",
  color: "#1e293b",
};

const actionButtonStyle = (variant: "edit" | "delete"): CSSProperties => ({
  padding: "0.25rem 0.75rem",
  border: "none",
  borderRadius: "0.25rem",
  fontSize: "0.75rem",
  cursor: "pointer",
  color: "#ffffff",
  backgroundColor: variant === "edit" ? "#3b82f6" : "#dc2626",
  marginRight: variant === "edit" ? "0.5rem" : 0,
});

const badgeStyle = (isRisk: boolean): CSSProperties => ({
  display: "inline-block",
  padding: "0.125rem 0.5rem",
  borderRadius: "9999px",
  fontSize: "0.75rem",
  fontWeight: 500,
  backgroundColor: isRisk ? "#fef2f2" : "#f0fdf4",
  color: isRisk ? "#dc2626" : "#16a34a",
  border: `1px solid ${isRisk ? "#fecaca" : "#bbf7d0"}`,
});

const emptyStyle: CSSProperties = {
  textAlign: "center",
  padding: "2rem",
  color: "#94a3b8",
};

/**
 * 薬剤マスタ一覧テーブルコンポーネント
 */
export function MedicineMasterTable({ items, onEdit, onDelete }: MedicineMasterTableProps) {
  if (items.length === 0) {
    return (
      <div style={emptyStyle}>
        <p>薬剤マスタが登録されていません。</p>
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>薬剤コード</th>
            <th style={thStyle}>カテゴリID</th>
            <th style={thStyle}>表示名</th>
            <th style={thStyle}>リスク要因</th>
            <th style={thStyle}>病院コード</th>
            <th style={{ ...thStyle, textAlign: "center" }}>操作</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td style={tdStyle}>{item.medicinesCode}</td>
              <td style={tdStyle}>{item.categoryId}</td>
              <td style={tdStyle}>
                {item.medicineNameSettings.length > 0
                  ? item.medicineNameSettings.map((ns) => ns.displayName).join(", ")
                  : "-"}
              </td>
              <td style={tdStyle}>
                <span style={badgeStyle(item.riskFactorFlg)}>
                  {item.riskFactorFlg ? "あり" : "なし"}
                </span>
              </td>
              <td style={tdStyle}>
                {item.medicineNameSettings.length > 0
                  ? item.medicineNameSettings.map((ns) => ns.hospitalCode).join(", ")
                  : "-"}
              </td>
              <td style={{ ...tdStyle, textAlign: "center", whiteSpace: "nowrap" }}>
                <button
                  type="button"
                  style={actionButtonStyle("edit")}
                  onClick={() => onEdit(item)}
                  aria-label={`${item.medicinesCode}を編集`}
                >
                  編集
                </button>
                <button
                  type="button"
                  style={actionButtonStyle("delete")}
                  onClick={() => onDelete(item)}
                  aria-label={`${item.medicinesCode}を削除`}
                >
                  削除
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
