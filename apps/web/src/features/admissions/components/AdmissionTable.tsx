"use client";

import { type CSSProperties } from "react";
import Link from "next/link";
import type { SortDirection } from "@/shared/types";
import type { AdmissionListEntry } from "../types";
import { GENDER_LABELS, RISK_LEVEL_LABELS, CARE_STATUS_LABELS } from "../types";

export interface AdmissionTableProps {
  /** 入院一覧データ */
  admissions: AdmissionListEntry[];
  /** ソートカラム */
  sortColumn: string;
  /** ソート方向 */
  sortDirection: SortDirection;
  /** ソート変更コールバック */
  onSort: (column: string, direction: SortDirection) => void;
  /** 選択中の入院ID */
  selectedIds: Set<number>;
  /** 選択変更コールバック */
  onSelectionChange: (ids: Set<number>) => void;
}

const tableContainerStyle: CSSProperties = {
  overflowX: "auto",
  border: "1px solid #e2e8f0",
  borderRadius: "0.5rem",
};

const tableStyle: CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: "0.8125rem",
};

const thStyle: CSSProperties = {
  padding: "0.5rem 0.75rem",
  backgroundColor: "#f8fafc",
  borderBottom: "2px solid #e2e8f0",
  textAlign: "left",
  fontWeight: 600,
  color: "#475569",
  whiteSpace: "nowrap",
  fontSize: "0.75rem",
};

const thSortableStyle: CSSProperties = {
  ...thStyle,
  cursor: "pointer",
  userSelect: "none",
};

const tdStyle: CSSProperties = {
  padding: "0.5rem 0.75rem",
  borderBottom: "1px solid #e2e8f0",
  color: "#1e293b",
  whiteSpace: "nowrap",
};

const checkboxCellStyle: CSSProperties = {
  ...tdStyle,
  textAlign: "center",
  width: "2.5rem",
};

const checkmarkStyle = (checked: boolean | null): CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "1.25rem",
  height: "1.25rem",
  borderRadius: "0.25rem",
  backgroundColor: checked === true ? "#3b82f6" : "#e2e8f0",
  color: checked === true ? "#ffffff" : "#94a3b8",
  fontSize: "0.625rem",
  fontWeight: 700,
});

const linkStyle: CSSProperties = {
  color: "#3b82f6",
  textDecoration: "none",
  fontWeight: 500,
};

const riskBadgeStyle = (level: string): CSSProperties => {
  const colors: Record<string, { bg: string; text: string }> = {
    HIGH: { bg: "#fef2f2", text: "#dc2626" },
    LOW: { bg: "#f0fdf4", text: "#16a34a" },
    NOT_ASSESSED: { bg: "#f1f5f9", text: "#64748b" },
  };
  const { bg, text } = colors[level] ?? colors.NOT_ASSESSED;
  return {
    display: "inline-block",
    padding: "0.125rem 0.5rem",
    borderRadius: "9999px",
    fontSize: "0.75rem",
    fontWeight: 500,
    backgroundColor: bg,
    color: text,
  };
};

const careStatusBadgeStyle = (status: string): CSSProperties => {
  const colors: Record<string, { bg: string; text: string }> = {
    COMPLETED: { bg: "#f0fdf4", text: "#16a34a" },
    IN_PROGRESS: { bg: "#fffbeb", text: "#d97706" },
    NOT_STARTED: { bg: "#f1f5f9", text: "#64748b" },
  };
  const { bg, text } = colors[status] ?? colors.NOT_STARTED;
  return {
    display: "inline-block",
    padding: "0.125rem 0.5rem",
    borderRadius: "9999px",
    fontSize: "0.75rem",
    fontWeight: 500,
    backgroundColor: bg,
    color: text,
    cursor: "pointer",
  };
};

const highRiskBadgeStyle = (isHighRisk: boolean): CSSProperties => ({
  display: "inline-block",
  padding: "0.125rem 0.5rem",
  borderRadius: "9999px",
  fontSize: "0.75rem",
  fontWeight: 500,
  backgroundColor: isHighRisk ? "#fef2f2" : "#f0fdf4",
  color: isHighRisk ? "#dc2626" : "#16a34a",
});

const emptyStyle: CSSProperties = {
  padding: "2rem",
  textAlign: "center",
  color: "#64748b",
  fontSize: "0.875rem",
};

/**
 * ソートインジケーターを表示する
 */
function SortIndicator({
  column,
  currentColumn,
  currentDirection,
}: {
  column: string;
  currentColumn: string;
  currentDirection: SortDirection;
}) {
  if (column !== currentColumn) {
    return <span style={{ color: "#cbd5e1", marginLeft: "0.25rem" }}>{"\u2195"}</span>;
  }
  return (
    <span style={{ marginLeft: "0.25rem" }}>
      {currentDirection === "asc" ? "\u2191" : "\u2193"}
    </span>
  );
}

/**
 * 患者入院一覧テーブルコンポーネント
 *
 * 患者情報、入院情報、リスク因子、評価状況を表形式で表示する。
 * ソート、行選択、患者詳細・ケアプランへのリンク機能を提供する。
 */
export function AdmissionTable({
  admissions,
  sortColumn,
  sortDirection,
  onSort,
  selectedIds,
  onSelectionChange,
}: AdmissionTableProps) {
  const handleSort = (column: string) => {
    if (column === sortColumn) {
      onSort(column, sortDirection === "asc" ? "desc" : "asc");
    } else {
      onSort(column, "desc");
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.size === admissions.length) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(admissions.map((a) => a.admissionId)));
    }
  };

  const handleSelectRow = (id: number) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    onSelectionChange(newSet);
  };

  if (admissions.length === 0) {
    return <div style={emptyStyle}>該当する入院レコードがありません</div>;
  }

  const isAllSelected = selectedIds.size === admissions.length;

  return (
    <div style={tableContainerStyle}>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={handleSelectAll}
                aria-label="全件選択"
              />
            </th>
            <th style={thSortableStyle} onClick={() => handleSort("patientId")}>
              ID
              <SortIndicator
                column="patientId"
                currentColumn={sortColumn}
                currentDirection={sortDirection}
              />
            </th>
            <th style={thSortableStyle} onClick={() => handleSort("patientName")}>
              患者情報
              <SortIndicator
                column="patientName"
                currentColumn={sortColumn}
                currentDirection={sortDirection}
              />
            </th>
            <th style={thSortableStyle} onClick={() => handleSort("admissionDate")}>
              入院日
              <SortIndicator
                column="admissionDate"
                currentColumn={sortColumn}
                currentDirection={sortDirection}
              />
            </th>
            <th style={thStyle}>70歳以上</th>
            <th style={thStyle}>リスク薬剤</th>
            <th style={thStyle}>認知症</th>
            <th style={thStyle}>脳器質的障害</th>
            <th style={thStyle}>アルコール多飲</th>
            <th style={thStyle}>せん妄既往</th>
            <th style={thStyle}>全身麻酔</th>
            <th style={thStyle}>せん妄ハイリスク</th>
            <th style={thStyle}>AIリスク判定</th>
            <th style={thStyle}>ケア実施状況</th>
          </tr>
        </thead>
        <tbody>
          {admissions.map((admission) => (
            <tr
              key={admission.admissionId}
              style={{
                backgroundColor: selectedIds.has(admission.admissionId) ? "#eff6ff" : undefined,
              }}
            >
              <td style={checkboxCellStyle}>
                <input
                  type="checkbox"
                  checked={selectedIds.has(admission.admissionId)}
                  onChange={() => handleSelectRow(admission.admissionId)}
                  aria-label={`${admission.patientName}を選択`}
                />
              </td>
              <td style={tdStyle}>{admission.patientId}</td>
              <td style={tdStyle}>
                <div>
                  <Link href={`/admissions/${admission.admissionId}`} style={linkStyle}>
                    {admission.patientName}
                  </Link>
                  {admission.patientNameKana && (
                    <div style={{ fontSize: "0.6875rem", color: "#94a3b8" }}>
                      {admission.patientNameKana}
                    </div>
                  )}
                  <div style={{ fontSize: "0.6875rem", color: "#64748b" }}>
                    {admission.age != null ? `${admission.age}歳` : "-"} /{" "}
                    {GENDER_LABELS[admission.gender] ?? admission.gender}
                  </div>
                </div>
              </td>
              <td style={tdStyle}>{admission.admissionDate.replace(/-/g, "/")}</td>
              <td style={checkboxCellStyle}>
                <span style={checkmarkStyle(admission.isOver70)}>
                  {admission.isOver70 ? "\u2713" : ""}
                </span>
              </td>
              <td style={checkboxCellStyle}>
                <span style={checkmarkStyle(admission.hasRiskDrug)}>
                  {admission.hasRiskDrug ? "\u2713" : ""}
                </span>
              </td>
              <td style={checkboxCellStyle}>
                <span style={checkmarkStyle(admission.hasDementia)}>
                  {admission.hasDementia === true ? "\u2713" : ""}
                </span>
              </td>
              <td style={checkboxCellStyle}>
                <span style={checkmarkStyle(admission.hasOrganicBrainDamage)}>
                  {admission.hasOrganicBrainDamage === true ? "\u2713" : ""}
                </span>
              </td>
              <td style={checkboxCellStyle}>
                <span style={checkmarkStyle(admission.isHeavyAlcohol)}>
                  {admission.isHeavyAlcohol === true ? "\u2713" : ""}
                </span>
              </td>
              <td style={checkboxCellStyle}>
                <span style={checkmarkStyle(admission.hasDeliriumHistory)}>
                  {admission.hasDeliriumHistory === true ? "\u2713" : ""}
                </span>
              </td>
              <td style={checkboxCellStyle}>
                <span style={checkmarkStyle(admission.hasGeneralAnesthesia)}>
                  {admission.hasGeneralAnesthesia === true ? "\u2713" : ""}
                </span>
              </td>
              <td style={checkboxCellStyle}>
                <span style={highRiskBadgeStyle(admission.isHighRisk)}>
                  {admission.isHighRisk ? "該当" : "非該当"}
                </span>
              </td>
              <td style={tdStyle}>
                <span style={riskBadgeStyle(admission.aiRiskLevel)}>
                  {RISK_LEVEL_LABELS[admission.aiRiskLevel]}
                </span>
              </td>
              <td style={tdStyle}>
                {admission.carePlanId ? (
                  <Link
                    href={`/admissions/${admission.admissionId}/care-plan`}
                    style={{ textDecoration: "none" }}
                  >
                    <span style={careStatusBadgeStyle(admission.careStatus)}>
                      {CARE_STATUS_LABELS[admission.careStatus]}
                    </span>
                  </Link>
                ) : (
                  <span style={careStatusBadgeStyle(admission.careStatus)}>
                    {CARE_STATUS_LABELS[admission.careStatus]}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
