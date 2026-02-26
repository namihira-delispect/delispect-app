import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { CarePlanListViewer } from "@/features/care-plan/components";
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

interface CarePlanPageProps {
  params: Promise<{ id: string }>;
}

/**
 * ケアプラン一覧ページ
 *
 * 認証済みユーザーがアクセス可能。
 * 入院IDに紐づくケアプランの各項目とステータスを一覧表示する。
 */
export default async function CarePlanPage({ params }: CarePlanPageProps) {
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
      <h1 style={titleStyle}>ケアプラン一覧</h1>
      <p style={descriptionStyle}>
        各ケアプラン項目の実施状況を確認し、ケアプランの作成・編集を行います。
      </p>
      <CarePlanListViewer admissionId={admissionId} />
    </div>
  );
}
