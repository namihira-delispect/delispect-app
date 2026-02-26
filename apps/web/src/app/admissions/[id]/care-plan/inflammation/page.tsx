import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { InflammationFlow } from "@/features/care-plan/inflammation/components";
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

interface InflammationPageProps {
  params: Promise<{ id: string }>;
}

/**
 * ケアプラン作成：炎症ページ
 *
 * 認証済みユーザーがアクセス可能。
 * 一問一答形式で炎症に関する確認項目を入力し、対処提案を確認する。
 */
export default async function InflammationPage({ params }: InflammationPageProps) {
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
      <h1 style={titleStyle}>ケアプラン作成：炎症</h1>
      <p style={descriptionStyle}>
        採血結果・バイタルサインの確認と炎症にともなう痛みの確認を行い、対処方法を提案します。
      </p>
      <InflammationFlow admissionId={admissionId} />
    </div>
  );
}
