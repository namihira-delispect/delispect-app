import { redirect, notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { getUserDetail } from "@/features/user-management/queries/getUserDetail";
import { UserEditForm } from "@/features/user-management/components/UserEditForm";
import type { CSSProperties } from "react";

interface EditUserPageProps {
  params: Promise<{ id: string }>;
}

const pageStyle: CSSProperties = {
  maxWidth: "40rem",
};

const titleStyle: CSSProperties = {
  fontSize: "1.5rem",
  fontWeight: 700,
  color: "#1e293b",
  marginBottom: "1.5rem",
};

export default async function EditUserPage({ params }: EditUserPageProps) {
  // 認証・認可チェック: 全権管理者のみ
  await requireAuth({ roles: ["SUPER_ADMIN"] });

  const { id } = await params;
  const userId = parseInt(id, 10);

  if (isNaN(userId)) {
    notFound();
  }

  const result = await getUserDetail(userId);

  if (!result.success) {
    if (result.value.code === "UNAUTHORIZED") {
      redirect("/login");
    }
    if (result.value.code === "FORBIDDEN") {
      redirect("/forbidden");
    }
    if (result.value.code === "NOT_FOUND") {
      notFound();
    }
    return (
      <div style={pageStyle}>
        <h1 style={titleStyle}>ユーザー編集</h1>
        <p>ユーザー情報の取得に失敗しました。</p>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <h1 style={titleStyle}>ユーザー編集</h1>
      <UserEditForm user={result.value} />
    </div>
  );
}
