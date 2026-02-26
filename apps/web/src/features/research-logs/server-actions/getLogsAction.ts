"use server";

import { authorizeServerAction } from "@/lib/auth/authorization";
import { getResearchLogs } from "@/lib/research-log";
import type { ResearchLogAction } from "@/lib/research-log";
import type { Result } from "@/shared/types";
import type { SerializedResearchLogItem } from "../types";

interface GetLogsResult {
  items: SerializedResearchLogItem[];
  totalCount: number;
  page: number;
  pageSize: number;
}

/**
 * 操作ログ一覧を取得する（管理者権限必須）
 */
export async function getLogsAction(
  startDate?: string,
  endDate?: string,
  actionType?: string,
  page?: number,
  pageSize?: number,
): Promise<Result<GetLogsResult>> {
  const authResult = await authorizeServerAction(["SYSTEM_ADMIN", "SUPER_ADMIN"]);
  if (!authResult.success) {
    return authResult;
  }

  try {
    const filter = {
      startDate: startDate ? new Date(startDate + "T00:00:00.000Z") : undefined,
      endDate: endDate ? new Date(endDate + "T23:59:59.999Z") : undefined,
      actionType: actionType as ResearchLogAction | undefined,
      page: page ?? 1,
      pageSize: pageSize ?? 20,
    };

    const result = await getResearchLogs(filter);

    // bigintをstringに変換してシリアライズ
    const serializedItems: SerializedResearchLogItem[] = result.items.map((item) => ({
      id: item.id.toString(),
      anonymizedId: item.anonymizedId,
      actionType: item.actionType,
      details: item.details,
      occurredAt: item.occurredAt.toISOString(),
    }));

    return {
      success: true,
      value: {
        items: serializedItems,
        totalCount: result.totalCount,
        page: result.page,
        pageSize: result.pageSize,
      },
    };
  } catch {
    return {
      success: false,
      value: { code: "INTERNAL_ERROR", cause: "ログ一覧の取得に失敗しました" },
    };
  }
}
