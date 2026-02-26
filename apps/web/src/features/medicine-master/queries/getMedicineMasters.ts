"use server";

import { prisma } from "@delispect/db";
import type { Result } from "@/shared/types";
import type { MedicineMasterListResponse, MedicineMasterItem } from "../types";
import { medicineMasterSearchSchema } from "../schemata";
import type { MedicineMasterSearchParams } from "../types";

/**
 * 薬剤マスタ一覧を取得する
 *
 * 検索キーワードで薬剤コードまたは表示名を部分一致検索し、
 * ページネーション付きで結果を返す。
 */
export async function getMedicineMasters(
  input: MedicineMasterSearchParams,
): Promise<Result<MedicineMasterListResponse>> {
  const parsed = medicineMasterSearchSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      value: { code: "INVALID_INPUT", cause: parsed.error.flatten() },
    };
  }

  const { query, page, pageSize } = parsed.data;
  const skip = (page - 1) * pageSize;

  try {
    const whereClause = query
      ? {
          OR: [
            { medicinesCode: { contains: query, mode: "insensitive" as const } },
            {
              medicineNameSettings: {
                some: {
                  displayName: { contains: query, mode: "insensitive" as const },
                },
              },
            },
          ],
        }
      : {};

    const [items, totalCount] = await Promise.all([
      prisma.medicineMaster.findMany({
        where: whereClause,
        include: {
          medicineNameSettings: {
            select: {
              id: true,
              hospitalCode: true,
              displayName: true,
            },
          },
        },
        orderBy: { medicinesCode: "asc" },
        skip,
        take: pageSize,
      }),
      prisma.medicineMaster.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(totalCount / pageSize);

    const mappedItems: MedicineMasterItem[] = items.map((item) => ({
      id: item.id,
      categoryId: item.categoryId,
      medicinesCode: item.medicinesCode,
      riskFactorFlg: item.riskFactorFlg,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
      medicineNameSettings: item.medicineNameSettings.map((ns) => ({
        id: ns.id,
        hospitalCode: ns.hospitalCode,
        displayName: ns.displayName,
      })),
    }));

    return {
      success: true,
      value: {
        items: mappedItems,
        totalCount,
        currentPage: page,
        totalPages,
        pageSize,
      },
    };
  } catch {
    return {
      success: false,
      value: { code: "DB_ERROR", cause: "薬剤マスタの取得に失敗しました" },
    };
  }
}
