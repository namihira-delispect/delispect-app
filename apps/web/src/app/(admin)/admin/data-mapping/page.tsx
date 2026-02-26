import { redirect } from "next/navigation";
import type { CSSProperties } from "react";
import { requireAuth } from "@/lib/auth";
import { getDataMappings } from "@/features/data-mapping/queries/getDataMappings";
import { DataMappingClient } from "@/features/data-mapping/components/DataMappingClient";

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
  color: "#64748b",
  marginBottom: "1.5rem",
};

/**
 * データマッピング管理ページ
 *
 * システム管理者・全権管理者のみアクセス可能。
 * 検査値・処方・バイタルサイン・入院情報のマッピングを管理する。
 */
export default async function DataMappingPage() {
  // アクセス制御: システム管理者・全権管理者のみ
  const currentUser = await requireAuth({
    roles: ["SYSTEM_ADMIN", "SUPER_ADMIN"],
  });

  if (!currentUser) {
    redirect("/login");
  }

  // 初期データ取得（全種別）
  const result = await getDataMappings();

  if (!result.success) {
    return (
      <div style={pageStyle}>
        <h1 style={titleStyle}>データマッピング管理</h1>
        <p>データの取得に失敗しました。</p>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <h1 style={titleStyle}>データマッピング管理</h1>
      <p style={descriptionStyle}>
        電子カルテ同期時に病院DB上のコード体系と本システムの項目を対応付けるマッピングを設定します。
      </p>
      <DataMappingClient initialData={result.value} />
    </div>
  );
}
