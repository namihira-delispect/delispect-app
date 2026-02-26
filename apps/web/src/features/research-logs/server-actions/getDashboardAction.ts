"use server";

import { authorizeServerAction } from "@/lib/auth/authorization";
import { getDashboardSummary } from "@/lib/research-log";
import type { DashboardSummary } from "@/lib/research-log";
import type { Result } from "@/shared/types";

/**
 * ダッシュボードサマリーを取得する（管理者権限必須）
 *
 * @param startDate - 集計期間開始日（YYYY-MM-DD）
 * @param endDate - 集計期間終了日（YYYY-MM-DD）
 * @returns ダッシュボードサマリー
 */
export async function getDashboardAction(
  startDate: string,
  endDate: string,
): Promise<Result<DashboardSummary>> {
  const authResult = await authorizeServerAction(["SYSTEM_ADMIN", "SUPER_ADMIN"]);
  if (!authResult.success) {
    return authResult;
  }

  try {
    const start = new Date(startDate + "T00:00:00.000Z");
    const end = new Date(endDate + "T23:59:59.999Z");

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return {
        success: false,
        value: { code: "INVALID_INPUT", cause: "無効な日付形式です" },
      };
    }

    if (start > end) {
      return {
        success: false,
        value: { code: "INVALID_INPUT", cause: "開始日は終了日以前である必要があります" },
      };
    }

    const summary = await getDashboardSummary(start, end);
    return { success: true, value: summary };
  } catch {
    return {
      success: false,
      value: { code: "INTERNAL_ERROR", cause: "ダッシュボードデータの取得に失敗しました" },
    };
  }
}
