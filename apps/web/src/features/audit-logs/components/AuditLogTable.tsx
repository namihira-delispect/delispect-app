"use client";

import { useState, useCallback, type CSSProperties } from "react";
import { SortHeader } from "@/shared/components";
import type { SortDirection } from "@/shared/types";
import type { MaskedAuditLogEntry } from "../types";
import { ACTION_LABELS, TARGET_TYPE_LABELS } from "../types";

export interface AuditLogTableProps {
  /** 監査ログ一覧 */
  logs: MaskedAuditLogEntry[];
  /** 現在のソートカラム */
  sortColumn: string;
  /** 現在のソート方向 */
  sortDirection: SortDirection;
  /** ソート変更時のコールバック */
  onSort: (column: string, direction: SortDirection) => void;
  /** マスキング解除リクエスト時のコールバック */
  onUnmask?: (logId: string) => void;
  /** マスキング解除可能か（SUPER_ADMIN判定） */
  canUnmask?: boolean;
  /** マスキング解除済みのログIDセット */
  unmaskedLogIds?: Set<string>;
  /** マスキング解除済みのユーザー名マップ */
  unmaskedUsernames?: Map<string, string>;
}

const tableStyle: CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: "0.875rem",
};

const thStyle: CSSProperties = {
  padding: "0.75rem 0.5rem",
  textAlign: "left",
  borderBottom: "2px solid #e2e8f0",
  backgroundColor: "#f8fafc",
  fontWeight: 600,
  color: "#1e293b",
  whiteSpace: "nowrap",
};

const tdStyle: CSSProperties = {
  padding: "0.625rem 0.5rem",
  borderBottom: "1px solid #e2e8f0",
  color: "#334155",
  verticalAlign: "top",
};

const emptyStyle: CSSProperties = {
  padding: "2rem",
  textAlign: "center",
  color: "#94a3b8",
};

const unmaskButtonStyle: CSSProperties = {
  padding: "0.125rem 0.5rem",
  backgroundColor: "#fef3c7",
  color: "#92400e",
  border: "1px solid #fbbf24",
  borderRadius: "0.25rem",
  fontSize: "0.75rem",
  cursor: "pointer",
  whiteSpace: "nowrap",
};

const actionBadgeStyle = (action: string): CSSProperties => {
  const colorMap: Record<string, { bg: string; text: string }> = {
    LOGIN: { bg: "#dbeafe", text: "#1e40af" },
    LOGOUT: { bg: "#e0e7ff", text: "#3730a3" },
    LOGIN_FAILED: { bg: "#fee2e2", text: "#991b1b" },
    VIEW: { bg: "#f0fdf4", text: "#166534" },
    CREATE: { bg: "#ecfdf5", text: "#065f46" },
    UPDATE: { bg: "#fffbeb", text: "#92400e" },
    DELETE: { bg: "#fef2f2", text: "#991b1b" },
    SETTINGS_CHANGE: { bg: "#f5f3ff", text: "#5b21b6" },
    EMR_SYNC: { bg: "#f0f9ff", text: "#075985" },
  };
  const colors = colorMap[action] ?? { bg: "#f1f5f9", text: "#475569" };

  return {
    display: "inline-block",
    padding: "0.125rem 0.5rem",
    borderRadius: "9999px",
    fontSize: "0.75rem",
    fontWeight: 500,
    backgroundColor: colors.bg,
    color: colors.text,
  };
};

/**
 * 日時をフォーマットする
 */
function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * 監査ログテーブルコンポーネント
 *
 * ログ一覧をテーブル形式で表示する。
 * 個人情報はマスキング表示され、管理者はマスキング解除できる。
 */
export function AuditLogTable({
  logs,
  sortColumn,
  sortDirection,
  onSort,
  onUnmask,
  canUnmask = false,
  unmaskedLogIds = new Set(),
  unmaskedUsernames = new Map(),
}: AuditLogTableProps) {
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  const handleRowClick = useCallback((logId: string) => {
    setExpandedRowId((prev) => (prev === logId ? null : logId));
  }, []);

  if (logs.length === 0) {
    return (
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>日時</th>
            <th style={thStyle}>ユーザー</th>
            <th style={thStyle}>操作</th>
            <th style={thStyle}>対象</th>
            <th style={thStyle}>対象ID</th>
            <th style={thStyle}>IPアドレス</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={emptyStyle} colSpan={6}>
              該当する監査ログはありません
            </td>
          </tr>
        </tbody>
      </table>
    );
  }

  return (
    <table style={tableStyle} aria-label="監査ログ一覧">
      <thead>
        <tr>
          <th style={thStyle}>
            <SortHeader
              label="日時"
              columnKey="occurredAt"
              currentSortColumn={sortColumn}
              currentSortDirection={sortDirection}
              onSort={onSort}
            />
          </th>
          <th style={thStyle}>
            <SortHeader
              label="ユーザー"
              columnKey="actorUsername"
              currentSortColumn={sortColumn}
              currentSortDirection={sortDirection}
              onSort={onSort}
            />
          </th>
          <th style={thStyle}>
            <SortHeader
              label="操作"
              columnKey="action"
              currentSortColumn={sortColumn}
              currentSortDirection={sortDirection}
              onSort={onSort}
            />
          </th>
          <th style={thStyle}>対象</th>
          <th style={thStyle}>対象ID</th>
          <th style={thStyle}>IPアドレス</th>
          {canUnmask && <th style={thStyle}>マスキング</th>}
        </tr>
      </thead>
      <tbody>
        {logs.map((log) => {
          const isUnmasked = unmaskedLogIds.has(log.id);
          const displayUsername = isUnmasked
            ? (unmaskedUsernames.get(log.id) ?? log.actorUsername)
            : log.maskedActorUsername;
          const isExpanded = expandedRowId === log.id;

          return (
            <tr key={log.id}>
              <td style={tdStyle}>{formatDateTime(log.occurredAt)}</td>
              <td style={tdStyle}>{displayUsername}</td>
              <td style={tdStyle}>
                <span style={actionBadgeStyle(log.action)}>
                  {ACTION_LABELS[log.action] ?? log.action}
                </span>
              </td>
              <td style={tdStyle}>
                {TARGET_TYPE_LABELS[log.targetType] ?? log.targetType}
                {log.maskedPatientName && !isUnmasked && (
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "#64748b",
                      marginTop: "0.125rem",
                    }}
                  >
                    {log.maskedPatientName}
                  </div>
                )}
              </td>
              <td style={tdStyle}>
                <button
                  type="button"
                  onClick={() => handleRowClick(log.id)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#3b82f6",
                    textDecoration: "underline",
                    fontSize: "0.875rem",
                    padding: 0,
                  }}
                  aria-expanded={isExpanded}
                  aria-label={`詳細を${isExpanded ? "閉じる" : "開く"}: ${log.targetId}`}
                >
                  {log.targetId}
                </button>
                {isExpanded && (
                  <div
                    style={{
                      marginTop: "0.5rem",
                      padding: "0.5rem",
                      backgroundColor: "#f1f5f9",
                      borderRadius: "0.25rem",
                      fontSize: "0.75rem",
                      maxWidth: "20rem",
                      overflow: "auto",
                    }}
                  >
                    {log.beforeData && (
                      <div>
                        <strong>変更前:</strong>
                        <pre
                          style={{
                            margin: "0.25rem 0",
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-all",
                          }}
                        >
                          {JSON.stringify(log.beforeData, null, 2)}
                        </pre>
                      </div>
                    )}
                    {log.afterData && (
                      <div>
                        <strong>変更後:</strong>
                        <pre
                          style={{
                            margin: "0.25rem 0",
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-all",
                          }}
                        >
                          {JSON.stringify(log.afterData, null, 2)}
                        </pre>
                      </div>
                    )}
                    {!log.beforeData && !log.afterData && (
                      <span style={{ color: "#94a3b8" }}>
                        詳細データなし
                      </span>
                    )}
                  </div>
                )}
              </td>
              <td style={tdStyle}>{log.ipAddress ?? "-"}</td>
              {canUnmask && (
                <td style={tdStyle}>
                  {isUnmasked ? (
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "#059669",
                      }}
                    >
                      解除済み
                    </span>
                  ) : (
                    <button
                      type="button"
                      style={unmaskButtonStyle}
                      onClick={() => onUnmask?.(log.id)}
                      aria-label={`ログ ${log.id} のマスキングを解除`}
                    >
                      解除
                    </button>
                  )}
                </td>
              )}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
