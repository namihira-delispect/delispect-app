"use server";

import { prisma } from "@delispect/db";
import type { Result } from "@/shared/types";
import type { ConstipationDetails } from "../types";

/**
 * 便秘アセスメントデータを取得する
 *
 * 入院IDに基づき、ケアプランの便秘カテゴリーアイテムのdetailsを取得する。
 */
export async function getConstipationAssessment(
  admissionId: number,
): Promise<Result<{ itemId: number; details: ConstipationDetails | null; status: string } | null>> {
  try {
    const carePlan = await prisma.carePlan.findUnique({
      where: { admissionId },
      include: {
        items: {
          where: { category: "CONSTIPATION" },
          take: 1,
        },
      },
    });

    if (!carePlan || carePlan.items.length === 0) {
      return {
        success: true,
        value: null,
      };
    }

    const item = carePlan.items[0];

    return {
      success: true,
      value: {
        itemId: item.id,
        details: item.details as ConstipationDetails | null,
        status: item.status,
      },
    };
  } catch (error) {
    console.error("[Constipation] 便秘アセスメントデータの取得に失敗しました", {
      admissionId,
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      success: false,
      value: {
        code: "CONSTIPATION_FETCH_ERROR",
        cause: "便秘アセスメントデータの取得に失敗しました",
      },
    };
  }
}
