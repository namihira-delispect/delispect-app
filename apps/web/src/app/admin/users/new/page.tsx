import { requireAuth } from "@/lib/auth";
import { UserCreateForm } from "@/features/user-management/components/UserCreateForm";
import type { CSSProperties } from "react";

const pageStyle: CSSProperties = {
  maxWidth: "40rem",
};

const titleStyle: CSSProperties = {
  fontSize: "1.5rem",
  fontWeight: 700,
  color: "#1e293b",
  marginBottom: "1.5rem",
};

export default async function NewUserPage() {
  // 認証・認可チェック: 全権管理者のみ
  await requireAuth({ roles: ["SUPER_ADMIN"] });

  return (
    <div style={pageStyle}>
      <h1 style={titleStyle}>ユーザー登録</h1>
      <UserCreateForm />
    </div>
  );
}
