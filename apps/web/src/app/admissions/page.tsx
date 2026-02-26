import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { hasAnyRole } from "@/lib/auth";
import { AdmissionListViewer } from "@/features/admissions/components";
import type { CSSProperties } from "react";

const pageStyle: CSSProperties = {
  maxWidth: "100%",
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
 * 患者入院一覧ページ
 *
 * 認証済みユーザーがアクセス可能。
 * 患者入院一覧の表示・検索・リスク評価実行機能を提供する。
 */
export default async function AdmissionsPage() {
  const currentUser = await requireAuth();

  if (!currentUser) {
    redirect("/login");
  }

  // リスク評価実行権限（SYSTEM_ADMIN, SUPER_ADMIN）
  const canExecuteRiskAssessment = hasAnyRole(currentUser.roles, ["SYSTEM_ADMIN", "SUPER_ADMIN"]);

  return (
    <div style={pageStyle}>
      <h1 style={titleStyle}>患者入院一覧</h1>
      <p style={descriptionStyle}>
        入院患者の一覧を表示します。検索条件を指定して絞り込み、リスク評価の実行や電子カルテ同期を行えます。
      </p>
      <AdmissionListViewer canExecuteRiskAssessment={canExecuteRiskAssessment} />
    </div>
  );
}
