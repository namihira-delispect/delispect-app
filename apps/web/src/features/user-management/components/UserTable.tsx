"use client";

import { type CSSProperties } from "react";
import type { UserListItem } from "../types";

interface UserTableProps {
  users: UserListItem[];
  onEdit: (userId: number) => void;
  onDelete: (user: UserListItem) => void;
}

const tableStyle: CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: "0.875rem",
};

const thStyle: CSSProperties = {
  padding: "0.75rem 1rem",
  textAlign: "left",
  fontWeight: 600,
  color: "#1e293b",
  borderBottom: "2px solid #e2e8f0",
  backgroundColor: "#f8fafc",
};

const tdStyle: CSSProperties = {
  padding: "0.75rem 1rem",
  borderBottom: "1px solid #e2e8f0",
  color: "#334155",
};

const badgeStyle = (isActive: boolean): CSSProperties => ({
  display: "inline-block",
  padding: "0.125rem 0.5rem",
  borderRadius: "9999px",
  fontSize: "0.75rem",
  fontWeight: 500,
  backgroundColor: isActive ? "#dcfce7" : "#fee2e2",
  color: isActive ? "#166534" : "#991b1b",
});

const roleBadgeStyle: CSSProperties = {
  display: "inline-block",
  padding: "0.125rem 0.5rem",
  borderRadius: "0.25rem",
  fontSize: "0.75rem",
  fontWeight: 500,
  backgroundColor: "#e0f2fe",
  color: "#0c4a6e",
  marginRight: "0.25rem",
};

const actionButtonStyle = (variant: "edit" | "delete"): CSSProperties => ({
  padding: "0.25rem 0.75rem",
  fontSize: "0.75rem",
  fontWeight: 500,
  border: "1px solid",
  borderColor: variant === "edit" ? "#3b82f6" : "#ef4444",
  borderRadius: "0.25rem",
  backgroundColor: "transparent",
  color: variant === "edit" ? "#3b82f6" : "#ef4444",
  cursor: "pointer",
  marginRight: variant === "edit" ? "0.5rem" : "0",
});

const ROLE_LABELS: Record<string, string> = {
  GENERAL: "一般ユーザー",
  SYSTEM_ADMIN: "システム管理者",
  SUPER_ADMIN: "全権管理者",
};

const emptyStyle: CSSProperties = {
  padding: "2rem",
  textAlign: "center",
  color: "#64748b",
};

/**
 * ユーザー一覧テーブルコンポーネント
 */
export function UserTable({ users, onEdit, onDelete }: UserTableProps) {
  if (users.length === 0) {
    return (
      <div style={emptyStyle} data-testid="user-table-empty">
        ユーザーが見つかりませんでした
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={tableStyle} data-testid="user-table">
        <thead>
          <tr>
            <th style={thStyle}>ユーザー名</th>
            <th style={thStyle}>メールアドレス</th>
            <th style={thStyle}>ロール</th>
            <th style={thStyle}>ステータス</th>
            <th style={thStyle}>作成日時</th>
            <th style={thStyle}>操作</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} data-testid={`user-row-${user.id}`}>
              <td style={tdStyle}>{user.username}</td>
              <td style={tdStyle}>{user.email}</td>
              <td style={tdStyle}>
                {user.roles.map((role) => (
                  <span key={role} style={roleBadgeStyle}>
                    {ROLE_LABELS[role] ?? role}
                  </span>
                ))}
              </td>
              <td style={tdStyle}>
                <span style={badgeStyle(user.isActive)}>
                  {user.isActive ? "有効" : "無効"}
                </span>
              </td>
              <td style={tdStyle}>
                {new Date(user.createdAt).toLocaleDateString("ja-JP")}
              </td>
              <td style={tdStyle}>
                <button
                  type="button"
                  style={actionButtonStyle("edit")}
                  onClick={() => onEdit(user.id)}
                  data-testid={`edit-user-${user.id}`}
                >
                  編集
                </button>
                <button
                  type="button"
                  style={actionButtonStyle("delete")}
                  onClick={() => onDelete(user)}
                  data-testid={`delete-user-${user.id}`}
                >
                  無効化
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
