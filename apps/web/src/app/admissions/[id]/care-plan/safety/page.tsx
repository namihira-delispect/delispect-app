import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { OthersCarePlanEditor } from "@/features/care-plan-others/components";
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

interface SafetyCarePlanPageProps {
  params: Promise<{ id: string }>;
}

/**
 * ケアプラン作成：安全管理ページ
 *
 * 認証済みユーザーがアクセス可能。
 * 安全管理の取り組みをチェックリスト形式で選択する。
 */
export default async function SafetyCarePlanPage({ params }: SafetyCarePlanPageProps) {
  const currentUser = await requireAuth();

  if (!currentUser) {
    redirect("/login");
  }

  const { id } = await params;
  const admissionId = parseInt(id, 10);

  if (isNaN(admissionId) || admissionId <= 0) {
    redirect("/admissions");
  }

  return (
    <div style={pageStyle}>
      <h1 style={titleStyle}>ケアプラン作成：安全管理</h1>
      <p style={descriptionStyle}>
        安全管理の取り組みを選択し、安全管理に関するケアプランを作成します。
      </p>
      <OthersCarePlanEditor admissionId={admissionId} category="SAFETY" />
    </div>
  );
}
