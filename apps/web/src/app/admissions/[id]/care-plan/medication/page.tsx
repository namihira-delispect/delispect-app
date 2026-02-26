import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { MedicationCarePlanViewer } from "@/features/care-plan-medication/components";
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

interface MedicationCarePlanPageProps {
  params: Promise<{ id: string }>;
}

/**
 * ケアプラン作成：薬剤ページ
 *
 * 認証済みユーザーがアクセス可能。
 * リスク薬剤の確認、オピオイド薬剤の表示、代替薬剤の提案を
 * 一問一答形式で入力する。
 */
export default async function MedicationCarePlanPage({ params }: MedicationCarePlanPageProps) {
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
      <h1 style={titleStyle}>ケアプラン作成：薬剤管理</h1>
      <p style={descriptionStyle}>処方薬剤のリスク評価と代替薬剤の提案を行います。</p>
      <MedicationCarePlanViewer admissionId={admissionId} />
    </div>
  );
}
