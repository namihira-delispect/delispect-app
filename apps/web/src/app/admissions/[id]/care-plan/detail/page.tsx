import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { CarePlanDetailViewer } from "@/features/care-plan/detail/components";
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

interface CarePlanDetailPageProps {
  params: Promise<{ id: string }>;
}

/**
 * ケアプラン詳細ページ
 *
 * 認証済みユーザーがアクセス可能。
 * 入院IDに紐づくケアプランの詳細情報を表示する。
 * ブラウザ印刷機能、看護記録転記機能を提供する。
 */
export default async function CarePlanDetailPage({ params }: CarePlanDetailPageProps) {
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
      <h1 style={titleStyle}>ケアプラン詳細</h1>
      <p style={descriptionStyle}>
        各ケアプラン項目の入力内容・提案内容を確認し、印刷や看護記録への転記を行います。
      </p>
      <CarePlanDetailViewer admissionId={admissionId} />
    </div>
  );
}
