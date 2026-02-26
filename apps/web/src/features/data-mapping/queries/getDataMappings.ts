"use server";

import { prisma } from "@delispect/db";
import type { PrismaDataMappingType } from "@delispect/db";
import type { Result } from "@/shared/types";
import type {
  DataMappingListResponse,
  DataMappingItem,
  DataMappingType,
} from "../types";

/**
 * データマッピング一覧を取得する
 *
 * マッピング種別でフィルタリングし、優先順位順で結果を返す。
 */
export async function getDataMappings(
  mappingType?: DataMappingType,
): Promise<Result<DataMappingListResponse>> {
  try {
    const whereClause = mappingType
      ? { mappingType: mappingType as PrismaDataMappingType }
      : {};

    const items = await prisma.dataMapping.findMany({
      where: whereClause,
      orderBy: [{ mappingType: "asc" }, { targetCode: "asc" }, { priority: "asc" }],
    });

    const totalCount = items.length;

    const mappedItems: DataMappingItem[] = items.map((item) => ({
      id: item.id,
      mappingType: item.mappingType as DataMappingType,
      sourceCode: item.sourceCode,
      targetCode: item.targetCode,
      priority: item.priority,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    }));

    return {
      success: true,
      value: {
        items: mappedItems,
        totalCount,
      },
    };
  } catch {
    return {
      success: false,
      value: { code: "DB_ERROR", cause: "データマッピングの取得に失敗しました" },
    };
  }
}
