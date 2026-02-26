import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { getReferenceValuesAction } from "@/features/reference-values/server-actions/getReferenceValuesAction";
import { ReferenceValueTable } from "@/features/reference-values/components/ReferenceValueTable";
import type { CSSProperties } from "react";

const pageStyle: CSSProperties = {
  maxWidth: "72rem",
};

const titleStyle: CSSProperties = {
  fontSize: "1.5rem",
  fontWeight: 700,
  color: "#1e293b",
  marginBottom: "0.5rem",
};

const descriptionStyle: CSSProperties = {
  fontSize: "0.875rem",
  color: "#6b7280",
  marginBottom: "1.5rem",
};

const errorStyle: CSSProperties = {
  padding: "1rem",
  backgroundColor: "#fef2f2",
  color: "#991b1b",
  borderRadius: "0.5rem",
  border: "1px solid #fecaca",
};

export default async function ReferenceValuesPage() {
  // 認証・認可チェック（システム管理者・全権管理者のみ）
  await requireAuth({ roles: ["SYSTEM_ADMIN", "SUPER_ADMIN"] });

  const result = await getReferenceValuesAction();

  if (!result.success) {
    if (result.value.code === "UNAUTHORIZED") {
      redirect("/login");
    }
    if (result.value.code === "FORBIDDEN") {
      redirect("/forbidden");
    }
    return (
      <div style={pageStyle}>
        <h1 style={titleStyle}>基準値マスタ管理</h1>
        <div style={errorStyle}>
          <p>基準値データの取得に失敗しました。</p>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <h1 style={titleStyle}>基準値マスタ管理</h1>
      <p style={descriptionStyle}>
        バイタルサイン・採血結果の基準値（正常範囲）を管理します。編集ボタンから上限値・下限値を変更できます。
      </p>
      <ReferenceValueTable groups={result.value} />
    </div>
  );
}
