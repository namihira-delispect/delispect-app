import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { PainCarePlanWizard } from "@/features/care-plan/pain/components";
import type { CSSProperties } from "react";

const pageStyle: CSSProperties = {
  maxWidth: "100%",
  padding: "1.5rem",
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

interface PainCarePlanPageProps {
  params: Promise<{ id: string }>;
}

/**
 * 疼痛ケアプラン作成ページ
 *
 * 認証済みユーザーがアクセス可能。
 * 一問一答形式で疼痛に関する情報を入力する。
 */
export default async function PainCarePlanPage({ params }: PainCarePlanPageProps) {
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
      <h1 style={titleStyle}>疼痛管理</h1>
      <p style={descriptionStyle}>
        痛みの確認項目、部位選択、生活への影響を一問一答形式で入力します。
      </p>
      <PainCarePlanWizard admissionId={admissionId} />
    </div>
  );
}
