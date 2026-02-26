import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { AuditLogViewer } from "@/features/audit-logs/components";
import type { CSSProperties } from "react";

const pageStyle: CSSProperties = {
  maxWidth: "80rem",
  padding: "1.5rem",
};

const titleStyle: CSSProperties = {
  fontSize: "1.5rem",
  fontWeight: 700,
  color: "#1e293b",
  marginBottom: "1rem",
};

const descriptionStyle: CSSProperties = {
  fontSize: "0.875rem",
  color: "#64748b",
  marginBottom: "1.5rem",
};

/**
 * 監査ログ閲覧ページ
 *
 * システム管理者・全権管理者のみアクセス可能。
 * 監査ログの検索・閲覧・エクスポート機能を提供する。
 */
export default async function AuditLogsPage() {
  const currentUser = await requireAuth({
    roles: ["SYSTEM_ADMIN", "SUPER_ADMIN"],
  });

  if (!currentUser) {
    redirect("/login");
  }

  const isSuperAdmin = currentUser.roles.includes("SUPER_ADMIN");

  return (
    <div style={pageStyle}>
      <h1 style={titleStyle}>監査ログ</h1>
      <p style={descriptionStyle}>
        システムの操作履歴を閲覧・検索できます。個人情報はマスキング表示されます。
      </p>
      <AuditLogViewer isSuperAdmin={isSuperAdmin} />
    </div>
  );
}
