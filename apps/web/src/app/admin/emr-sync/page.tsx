import { requireAuth } from "@/lib/auth";
import { EmrSyncForm } from "@/features/emr-sync/components/EmrSyncForm";
import type { CSSProperties } from "react";

const pageStyle: CSSProperties = {
  maxWidth: "56rem",
};

const titleStyle: CSSProperties = {
  fontSize: "1.5rem",
  fontWeight: 700,
  color: "#1e293b",
  marginBottom: "0.5rem",
};

const descriptionStyle: CSSProperties = {
  fontSize: "0.875rem",
  color: "#64748b",
  marginBottom: "1.5rem",
};

const sectionGapStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "1.5rem",
};

/**
 * 電子カルテ同期画面
 *
 * 病院側のDWH/DBサーバーとの電子カルテ情報同期を行う。
 * 手動インポート（入院日付範囲指定）をサポート。
 * システム管理者・全権管理者のみアクセス可能。
 */
export default async function EmrSyncPage() {
  // 認証・認可チェック（SYSTEM_ADMIN or SUPER_ADMIN のみ）
  // requireAuthは認証失敗時にredirectをthrowする
  await requireAuth({ roles: ["SYSTEM_ADMIN", "SUPER_ADMIN"] });

  return (
    <div style={pageStyle}>
      <h1 style={titleStyle}>電子カルテ同期</h1>
      <p style={descriptionStyle}>
        病院側の電子カルテシステムから入院患者データをインポートします。
        入院日の範囲を指定して手動でインポートできます。
      </p>
      <div style={sectionGapStyle}>
        <EmrSyncForm />
      </div>
    </div>
  );
}
