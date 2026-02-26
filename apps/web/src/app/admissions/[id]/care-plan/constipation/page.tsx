import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { ConstipationPageClient } from "@/features/care-plan/constipation/components";
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

interface ConstipationPageProps {
  params: Promise<{ id: string }>;
}

/**
 * ケアプラン作成：便秘ページ
 *
 * 認証済みユーザーがアクセス可能。
 * 一問一答形式で便秘の確認項目を入力し、対処提案を生成する。
 */
export default async function ConstipationPage({ params }: ConstipationPageProps) {
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
      <h1 style={titleStyle}>ケアプラン作成：便秘</h1>
      <p style={descriptionStyle}>
        便の性状、体調面、食事、腸の状態を一問一答形式で確認し、便秘の対処方法を提案します。
      </p>
      <ConstipationPageClient admissionId={admissionId} />
    </div>
  );
}
