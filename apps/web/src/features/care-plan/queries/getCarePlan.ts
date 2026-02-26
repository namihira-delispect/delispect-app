"use server";

import { prisma } from "@delispect/db";
import type { Result } from "@/shared/types";
import type {
  CarePlanListResponse,
  CarePlanItemEntry,
  CarePlanItemStatusType,
  CarePlanCategoryType,
} from "../types";
import { deriveOverallStatus } from "../types";

/**
 * ケアプラン一覧情報を取得する
 *
 * 入院IDに基づき、ケアプランとその全アイテムを取得し、
 * 全体ステータスを導出して返す。
 */
export async function getCarePlan(
  admissionId: number,
): Promise<Result<CarePlanListResponse | null>> {
  try {
    const carePlan = await prisma.carePlan.findUnique({
      where: { admissionId },
      include: {
        items: {
          orderBy: { id: "asc" },
        },
        createdBy: {
          select: { username: true },
        },
      },
    });

    if (!carePlan) {
      return {
        success: true,
        value: null,
      };
    }

    const items: CarePlanItemEntry[] = carePlan.items.map((item) => ({
      id: item.id,
      category: item.category as CarePlanCategoryType,
      status: item.status as CarePlanItemStatusType,
      instructions: item.instructions,
      updatedAt: item.updatedAt.toISOString(),
    }));

    const itemStatuses = items.map((item) => item.status);
    const overallStatus = deriveOverallStatus(itemStatuses);

    const response: CarePlanListResponse = {
      carePlanId: carePlan.id,
      admissionId: carePlan.admissionId,
      overallStatus,
      items,
      createdBy: carePlan.createdBy.username,
      createdAt: carePlan.createdAt.toISOString(),
      updatedAt: carePlan.updatedAt.toISOString(),
    };

    return {
      success: true,
      value: response,
    };
  } catch (error) {
    console.error("[CarePlan] ケアプラン情報の取得に失敗しました", {
      admissionId,
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      success: false,
      value: {
        code: "CARE_PLAN_FETCH_ERROR",
        cause: "ケアプラン情報の取得に失敗しました",
      },
    };
  }
}
