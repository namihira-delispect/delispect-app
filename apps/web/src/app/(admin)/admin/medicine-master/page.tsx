import { redirect } from "next/navigation";
import type { CSSProperties } from "react";
import { requireAuth } from "@/lib/auth";
import { getMedicineMasters } from "@/features/medicine-master/queries/getMedicineMasters";
import { MedicineMasterClient } from "@/features/medicine-master/components/MedicineMasterClient";

const pageStyle: CSSProperties = {
  maxWidth: "72rem",
};

const titleStyle: CSSProperties = {
  fontSize: "1.5rem",
  fontWeight: 700,
  color: "#1e293b",
  marginBottom: "1.5rem",
};

/**
 * 薬剤マスタ管理ページ
 *
 * システム管理者・全権管理者のみアクセス可能。
 * 薬剤マスタの一覧表示・検索・CRUD・CSVインポートを提供する。
 */
export default async function MedicineMasterPage() {
  // アクセス制御: システム管理者・全権管理者のみ
  const currentUser = await requireAuth({
    roles: ["SYSTEM_ADMIN", "SUPER_ADMIN"],
  });

  if (!currentUser) {
    redirect("/login");
  }

  // 初期データ取得
  const result = await getMedicineMasters({ page: 1, pageSize: 20 });

  if (!result.success) {
    return (
      <div style={pageStyle}>
        <h1 style={titleStyle}>薬剤マスタ管理</h1>
        <p>データの取得に失敗しました。</p>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <h1 style={titleStyle}>薬剤マスタ管理</h1>
      <MedicineMasterClient initialData={result.value} />
    </div>
  );
}
