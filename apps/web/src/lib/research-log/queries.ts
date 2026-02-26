/**
 * 解析用操作ログのクエリ関数
 *
 * ログ一覧の取得、フィルタリング、検索を行う。
 */

import { prisma } from "@delispect/db";
import type {
  ResearchLogFilter,
  ResearchLogListResponse,
  ResearchLogItem,
} from "./types";

/** デフォルトページサイズ */
const DEFAULT_PAGE_SIZE = 20;

/**
 * 操作ログ一覧を取得する
 *
 * @param filter - 検索フィルター
 * @returns ログ一覧（ページネーション付き）
 */
export async function getResearchLogs(
  filter: ResearchLogFilter,
): Promise<ResearchLogListResponse> {
  const page = filter.page ?? 1;
  const pageSize = filter.pageSize ?? DEFAULT_PAGE_SIZE;
  const skip = (page - 1) * pageSize;

  const where = buildWhereClause(filter);

  const [items, totalCount] = await Promise.all([
    prisma.researchLog.findMany({
      where,
      orderBy: { occurredAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.researchLog.count({ where }),
  ]);

  return {
    items: items.map(mapToResearchLogItem),
    totalCount,
    page,
    pageSize,
  };
}

/**
 * エクスポート用にすべてのログを取得する（期間指定必須）
 *
 * @param startDate - 開始日
 * @param endDate - 終了日
 * @param actionType - アクション種別フィルター（任意）
 * @returns ログアイテムの配列
 */
export async function getResearchLogsForExport(
  startDate: Date,
  endDate: Date,
  actionType?: string,
): Promise<ResearchLogItem[]> {
  const where: Record<string, unknown> = {
    occurredAt: {
      gte: startDate,
      lte: endDate,
    },
  };

  if (actionType) {
    where.actionType = actionType;
  }

  const items = await prisma.researchLog.findMany({
    where,
    orderBy: { occurredAt: "asc" },
  });

  return items.map(mapToResearchLogItem);
}

/**
 * WHERE句の構築
 */
function buildWhereClause(filter: ResearchLogFilter): Record<string, unknown> {
  const where: Record<string, unknown> = {};

  if (filter.startDate || filter.endDate) {
    const occurredAt: Record<string, Date> = {};
    if (filter.startDate) {
      occurredAt.gte = filter.startDate;
    }
    if (filter.endDate) {
      occurredAt.lte = filter.endDate;
    }
    where.occurredAt = occurredAt;
  }

  if (filter.actionType) {
    where.actionType = filter.actionType;
  }

  return where;
}

/**
 * Prismaレコードを ResearchLogItem に変換する
 */
function mapToResearchLogItem(record: {
  id: bigint;
  anonymizedId: string;
  actionType: string;
  details: unknown;
  occurredAt: Date;
}): ResearchLogItem {
  return {
    id: record.id,
    anonymizedId: record.anonymizedId,
    actionType: record.actionType,
    details: record.details as Record<string, unknown> | null,
    occurredAt: record.occurredAt,
  };
}
