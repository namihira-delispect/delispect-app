/**
 * 解析用操作ログ機能の型定義
 */

export type { DashboardFilterInput, CsvExportInput, LogListFilterInput } from "../schemata";

/** ダッシュボードページのprops */
export interface DashboardPageProps {
  searchParams?: Promise<{
    startDate?: string;
    endDate?: string;
  }>;
}

/** ログ一覧のシリアライズ済みアイテム（bigintをstringに変換） */
export interface SerializedResearchLogItem {
  id: string;
  anonymizedId: string;
  actionType: string;
  details: Record<string, unknown> | null;
  occurredAt: string;
}
