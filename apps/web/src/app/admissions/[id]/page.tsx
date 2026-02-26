import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { AdmissionDetailViewer } from "@/features/admissions/components";
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

interface AdmissionDetailPageProps {
  params: Promise<{ id: string }>;
}

/**
 * 患者入院詳細ページ
 *
 * 認証済みユーザーがアクセス可能。
 * 患者の入院情報を詳細に表示する。
 */
export default async function AdmissionDetailPage({ params }: AdmissionDetailPageProps) {
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
      <h1 style={titleStyle}>患者入院詳細</h1>
      <p style={descriptionStyle}>
        患者の入院情報（基本情報・バイタルサイン・採血結果・ケア関連情報・リスク評価・ケアプラン）を表示します。
      </p>
      <AdmissionDetailViewer admissionId={admissionId} />
    </div>
  );
}
