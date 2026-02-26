import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { getSystemSettingsAction } from "@/features/system-settings/server-actions/getSystemSettingsAction";
import { SystemSettingsForm } from "@/features/system-settings/components/SystemSettingsForm";
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

const sectionGapStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "1.5rem",
};

export default async function SystemSettingsPage() {
  // 認証・認可チェック（SYSTEM_ADMIN or SUPER_ADMIN のみ）
  await requireAuth({ roles: ["SYSTEM_ADMIN", "SUPER_ADMIN"] });

  const result = await getSystemSettingsAction();

  if (!result.success) {
    if (result.value.code === "UNAUTHORIZED") {
      redirect("/login");
    }
    if (result.value.code === "FORBIDDEN") {
      redirect("/forbidden");
    }
    return (
      <div style={pageStyle}>
        <h1 style={titleStyle}>システム設定</h1>
        <p>システム設定の取得に失敗しました。</p>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <h1 style={titleStyle}>システム設定</h1>
      <div style={sectionGapStyle}>
        <SystemSettingsForm initialSettings={result.value} />
      </div>
    </div>
  );
}
