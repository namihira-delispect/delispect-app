import { redirect } from "next/navigation";
import type { CSSProperties } from "react";
import { getDashboardAction } from "@/features/research-logs/server-actions/getDashboardAction";
import {
  UsageSummaryCard,
  ClinicalSummaryCard,
  ExportForm,
  DashboardFilter,
} from "@/features/research-logs/components";

const pageStyle: CSSProperties = {
  maxWidth: "60rem",
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

const periodInfoStyle: CSSProperties = {
  fontSize: "0.875rem",
  color: "#64748b",
  marginBottom: "0.5rem",
};

interface PageProps {
  searchParams: Promise<{
    startDate?: string;
    endDate?: string;
  }>;
}

export default async function ResearchLogsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  // デフォルト: 過去30日間
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const startDate =
    params.startDate ?? thirtyDaysAgo.toISOString().split("T")[0];
  const endDate = params.endDate ?? today.toISOString().split("T")[0];

  const result = await getDashboardAction(startDate, endDate);

  if (!result.success) {
    if (result.value.code === "UNAUTHORIZED") {
      redirect("/login");
    }
    if (result.value.code === "FORBIDDEN") {
      redirect("/forbidden");
    }
    return (
      <div style={pageStyle}>
        <h1 style={titleStyle}>解析用操作ログ</h1>
        <p>データの取得に失敗しました。</p>
      </div>
    );
  }

  const { usage, clinical, period } = result.value;

  return (
    <div style={pageStyle}>
      <h1 style={titleStyle}>解析用操作ログ</h1>

      <DashboardFilter
        defaultStartDate={startDate}
        defaultEndDate={endDate}
      />

      <p style={periodInfoStyle}>
        表示期間: {period.startDate} 〜 {period.endDate}
      </p>

      <div style={sectionGapStyle}>
        <UsageSummaryCard summary={usage} />
        <ClinicalSummaryCard summary={clinical} />
        <ExportForm
          defaultStartDate={startDate}
          defaultEndDate={endDate}
        />
      </div>
    </div>
  );
}
