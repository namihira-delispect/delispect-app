"use client";

import type { CSSProperties } from "react";
import type {
  DataMappingItem,
  MappingStatusItem,
  MappingStatus,
} from "../types";

export interface MappingTableProps {
  items: MappingStatusItem[];
  onEdit: (targetCode: string, targetLabel: string, mapping: DataMappingItem | null) => void;
  onDelete: (mapping: DataMappingItem) => void;
}

const tableStyle: CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: "0.875rem",
};

const thStyle: CSSProperties = {
  padding: "0.75rem 1rem",
  borderBottom: "2px solid #e2e8f0",
  textAlign: "left",
  fontWeight: 600,
  color: "#475569",
  backgroundColor: "#f8fafc",
};

const tdStyle: CSSProperties = {
  padding: "0.75rem 1rem",
  borderBottom: "1px solid #e2e8f0",
  color: "#334155",
};

const statusBadgeStyle = (status: MappingStatus): CSSProperties => ({
  display: "inline-block",
  padding: "0.125rem 0.5rem",
  borderRadius: "9999px",
  fontSize: "0.75rem",
  fontWeight: 500,
  backgroundColor: status === "mapped" ? "#dcfce7" : "#fef3c7",
  color: status === "mapped" ? "#166534" : "#92400e",
});

const actionButtonStyle: CSSProperties = {
  padding: "0.25rem 0.75rem",
  fontSize: "0.75rem",
  borderRadius: "0.25rem",
  cursor: "pointer",
  border: "1px solid #cbd5e1",
  backgroundColor: "#ffffff",
  color: "#475569",
  marginRight: "0.25rem",
};

const deleteButtonStyle: CSSProperties = {
  ...actionButtonStyle,
  color: "#dc2626",
  borderColor: "#fca5a5",
};

const categoryRowStyle: CSSProperties = {
  ...tdStyle,
  fontWeight: 600,
  backgroundColor: "#f1f5f9",
  color: "#1e293b",
};

/**
 * マッピング一覧テーブル
 *
 * システム項目ごとにマッピング状態を表示し、設定・編集・削除操作を提供する。
 */
export function MappingTable({ items, onEdit, onDelete }: MappingTableProps) {
  // カテゴリ別にグループ化
  const categories = new Map<string, MappingStatusItem[]>();
  for (const item of items) {
    const group = categories.get(item.category) ?? [];
    group.push(item);
    categories.set(item.category, group);
  }

  return (
    <table style={tableStyle}>
      <thead>
        <tr>
          <th style={thStyle}>システム項目</th>
          <th style={thStyle}>病院側コード</th>
          <th style={thStyle}>優先順位</th>
          <th style={thStyle}>ステータス</th>
          <th style={{ ...thStyle, textAlign: "right" }}>操作</th>
        </tr>
      </thead>
      <tbody>
        {Array.from(categories.entries()).map(([category, groupItems]) => (
          <>
            <tr key={`cat-${category}`}>
              <td style={categoryRowStyle} colSpan={5}>
                {category}
              </td>
            </tr>
            {groupItems.map((item) => (
              <tr key={`item-${item.code}`}>
                <td style={tdStyle}>{item.label}</td>
                <td style={tdStyle}>
                  {item.mapping ? item.mapping.sourceCode : "-"}
                </td>
                <td style={tdStyle}>
                  {item.mapping != null ? item.mapping.priority : "-"}
                </td>
                <td style={tdStyle}>
                  <span style={statusBadgeStyle(item.status)}>
                    {item.status === "mapped" ? "設定済" : "未設定"}
                  </span>
                </td>
                <td style={{ ...tdStyle, textAlign: "right" }}>
                  <button
                    type="button"
                    style={actionButtonStyle}
                    onClick={() => onEdit(item.code, item.label, item.mapping)}
                  >
                    {item.mapping ? "編集" : "設定"}
                  </button>
                  {item.mapping && (
                    <button
                      type="button"
                      style={deleteButtonStyle}
                      onClick={() => onDelete(item.mapping!)}
                    >
                      解除
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </>
        ))}
        {items.length === 0 && (
          <tr>
            <td style={{ ...tdStyle, textAlign: "center" }} colSpan={5}>
              項目がありません
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
