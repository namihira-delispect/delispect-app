"use client";

import { useState, type CSSProperties } from "react";
import type { ReferenceValueGroup } from "../types";
import { ReferenceValueEditForm } from "./ReferenceValueEditForm";

interface ReferenceValueTableProps {
  groups: ReferenceValueGroup[];
}

const tableContainerStyle: CSSProperties = {
  backgroundColor: "#ffffff",
  borderRadius: "0.5rem",
  padding: "1.5rem",
  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
  overflowX: "auto",
};

const tableStyle: CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: "0.875rem",
};

const thStyle: CSSProperties = {
  padding: "0.75rem 1rem",
  textAlign: "left",
  fontWeight: 600,
  color: "#374151",
  borderBottom: "2px solid #e5e7eb",
  backgroundColor: "#f9fafb",
  whiteSpace: "nowrap",
};

const tdStyle: CSSProperties = {
  padding: "0.75rem 1rem",
  borderBottom: "1px solid #e5e7eb",
  color: "#1e293b",
};

const editButtonStyle: CSSProperties = {
  padding: "0.25rem 0.75rem",
  fontSize: "0.75rem",
  fontWeight: 500,
  color: "#2563eb",
  backgroundColor: "transparent",
  border: "1px solid #2563eb",
  borderRadius: "0.25rem",
  cursor: "pointer",
};

const emptyStyle: CSSProperties = {
  padding: "2rem",
  textAlign: "center",
  color: "#6b7280",
};

function formatRange(lower: string | null, upper: string | null): string {
  if (lower === null && upper === null) return "-";
  if (lower !== null && upper !== null) return `${lower} - ${upper}`;
  if (lower !== null) return `${lower} -`;
  return `- ${upper}`;
}

/**
 * 基準値マスタ一覧テーブル
 */
export function ReferenceValueTable({ groups }: ReferenceValueTableProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingLabel, setEditingLabel] = useState<string>("");

  const handleEditClick = (id: number, label: string) => {
    setEditingId(id);
    setEditingLabel(label);
  };

  const handleEditClose = () => {
    setEditingId(null);
    setEditingLabel("");
  };

  if (groups.length === 0) {
    return (
      <div style={tableContainerStyle}>
        <p style={emptyStyle}>基準値データが登録されていません。</p>
      </div>
    );
  }

  return (
    <>
      <div style={tableContainerStyle}>
        <table style={tableStyle} data-testid="reference-value-table">
          <thead>
            <tr>
              <th style={thStyle}>項目コード</th>
              <th style={thStyle}>項目名</th>
              <th style={thStyle}>単位</th>
              <th style={thStyle}>共通基準値</th>
              <th style={thStyle}>男性基準値</th>
              <th style={thStyle}>女性基準値</th>
              <th style={thStyle}>操作</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => (
              <tr key={group.itemCode} data-testid={`row-${group.itemCode}`}>
                <td style={tdStyle}>{group.itemCode}</td>
                <td style={tdStyle}>{group.itemName}</td>
                <td style={tdStyle}>{group.unit ?? "-"}</td>
                <td style={tdStyle}>
                  {group.common
                    ? formatRange(
                        group.common.lowerLimit,
                        group.common.upperLimit,
                      )
                    : "-"}
                </td>
                <td style={tdStyle}>
                  {group.male
                    ? formatRange(
                        group.male.lowerLimit,
                        group.male.upperLimit,
                      )
                    : "-"}
                </td>
                <td style={tdStyle}>
                  {group.female
                    ? formatRange(
                        group.female.lowerLimit,
                        group.female.upperLimit,
                      )
                    : "-"}
                </td>
                <td style={tdStyle}>
                  {group.common && (
                    <button
                      type="button"
                      style={editButtonStyle}
                      onClick={() =>
                        handleEditClick(
                          group.common!.id,
                          `${group.itemName}（共通）`,
                        )
                      }
                      data-testid={`edit-common-${group.itemCode}`}
                    >
                      共通
                    </button>
                  )}{" "}
                  {group.male && (
                    <button
                      type="button"
                      style={editButtonStyle}
                      onClick={() =>
                        handleEditClick(
                          group.male!.id,
                          `${group.itemName}（男性）`,
                        )
                      }
                      data-testid={`edit-male-${group.itemCode}`}
                    >
                      男性
                    </button>
                  )}{" "}
                  {group.female && (
                    <button
                      type="button"
                      style={editButtonStyle}
                      onClick={() =>
                        handleEditClick(
                          group.female!.id,
                          `${group.itemName}（女性）`,
                        )
                      }
                      data-testid={`edit-female-${group.itemCode}`}
                    >
                      女性
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingId !== null && (
        <ReferenceValueEditForm
          id={editingId}
          label={editingLabel}
          initialLowerLimit={findLimitById(groups, editingId, "lower")}
          initialUpperLimit={findLimitById(groups, editingId, "upper")}
          onClose={handleEditClose}
        />
      )}
    </>
  );
}

function findLimitById(
  groups: ReferenceValueGroup[],
  id: number,
  type: "lower" | "upper",
): string {
  for (const group of groups) {
    for (const range of [group.common, group.male, group.female]) {
      if (range && range.id === id) {
        const val =
          type === "lower" ? range.lowerLimit : range.upperLimit;
        return val ?? "";
      }
    }
  }
  return "";
}
