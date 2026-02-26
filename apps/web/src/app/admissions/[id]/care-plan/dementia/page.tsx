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

interface DementiaCarePlanPageProps {
  params: Promise<{ id: string }>;
}

/**
 * ケアプラン作成：認知症ケアページ
 *
 * 認証済みユーザーがアクセス可能。
 * 認知機能低下の対策方法をチェックリスト形式で選択する。
 */
export default async function DementiaCarePlanPage({ params }: DementiaCarePlanPageProps) {
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
      <h1 style={titleStyle}>ケアプラン作成：認知症ケア</h1>
      <p style={descriptionStyle}>
        認知機能低下の対策方法を選択し、認知症に関するケアプランを作成します。
      </p>
      <OthersCarePlanEditor admissionId={admissionId} category="DEMENTIA" />
    </div>
  );
}
