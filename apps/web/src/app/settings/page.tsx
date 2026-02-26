import { redirect } from "next/navigation";
import { getProfileAction } from "@/features/settings/server-actions/getProfileAction";
import { ProfileForm } from "@/features/settings/components/ProfileForm";
import { PasswordForm } from "@/features/settings/components/PasswordForm";
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

export default async function SettingsPage() {
  const result = await getProfileAction();

  if (!result.success) {
    if (result.value.code === "UNAUTHORIZED") {
      redirect("/login");
    }
    return (
      <div style={pageStyle}>
        <h1 style={titleStyle}>個人設定</h1>
        <p>プロフィール情報の取得に失敗しました。</p>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <h1 style={titleStyle}>個人設定</h1>
      <div style={sectionGapStyle}>
        <ProfileForm initialProfile={result.value} />
        <PasswordForm />
      </div>
    </div>
  );
}
