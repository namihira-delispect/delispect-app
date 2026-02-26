import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { DehydrationWizard } from "@/features/care-plan/dehydration/components";
import type { CSSProperties } from "react";
import { prisma } from "@delispect/db";

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

interface DehydrationPageProps {
  params: Promise<{ id: string }>;
}

/**
 * 脱水ケアプラン作成ページ
 *
 * 認証済みユーザーがアクセス可能。
 * 一問一答形式で脱水アセスメントを入力する。
 */
export default async function DehydrationPage({ params }: DehydrationPageProps) {
  const currentUser = await requireAuth();

  if (!currentUser) {
    redirect("/login");
  }

  const { id } = await params;
  const admissionId = parseInt(id, 10);

  if (isNaN(admissionId) || admissionId <= 0) {
    redirect("/admissions");
  }

  // ケアプランアイテムIDを取得
  const carePlanItem = await prisma.carePlanItem.findFirst({
    where: {
      category: "DEHYDRATION",
      carePlan: { admissionId },
    },
    select: { id: true },
  });

  if (!carePlanItem) {
    redirect(`/admissions/${admissionId}/care-plan`);
  }

  return (
    <div style={pageStyle}>
      <h1 style={titleStyle}>脱水アセスメント</h1>
      <p style={descriptionStyle}>
        採血結果・バイタル確認、目視確認、水分摂取確認を行い、脱水への対処を提案します。
      </p>
      <DehydrationWizard itemId={carePlanItem.id} admissionId={admissionId} />
    </div>
  );
}
