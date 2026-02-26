"use server";

import { prisma } from "@delispect/db";
import type { Result } from "@/shared/types";
import type { GetOthersCarePlanResponse, OthersCategoryType, ChecklistSaveData } from "../types";

/**
 * その他カテゴリのケアプランアイテムをアイテムIDで取得する
 */
export async function getOthersCarePlanByItemId(
  itemId: number,
): Promise<Result<GetOthersCarePlanResponse>> {
  try {
    const item = await prisma.carePlanItem.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      return {
        success: false,
        value: { code: "NOT_FOUND", cause: "指定されたケアプランアイテムが見つかりません" },
      };
    }

    // カテゴリーがその他カテゴリーかチェック
    const validCategories: string[] = ["MOBILITY", "DEMENTIA", "SAFETY", "SLEEP"];
    if (!validCategories.includes(item.category)) {
      return {
        success: false,
        value: {
          code: "INVALID_CATEGORY",
          cause: "指定されたアイテムはその他カテゴリーではありません",
        },
      };
    }

    const checklist = item.details as ChecklistSaveData | null;

    return {
      success: true,
      value: {
        itemId: item.id,
        category: item.category as OthersCategoryType,
        status: item.status,
        checklist,
        instructions: item.instructions,
        updatedAt: item.updatedAt.toISOString(),
      },
    };
  } catch (error) {
    console.error("[CarePlanOthers] ケアプランアイテムの取得に失敗しました", {
      itemId,
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      success: false,
      value: {
        code: "CARE_PLAN_OTHERS_FETCH_ERROR",
        cause: "ケアプランアイテムの取得に失敗しました",
      },
    };
  }
}

/**
 * その他カテゴリのケアプランアイテムを入院ID+カテゴリーで取得する
 */
export async function getOthersCarePlanByCategory(
  admissionId: number,
  category: OthersCategoryType,
): Promise<Result<GetOthersCarePlanResponse>> {
  try {
    const carePlan = await prisma.carePlan.findUnique({
      where: { admissionId },
      include: {
        items: {
          where: { category },
        },
      },
    });

    if (!carePlan) {
      return {
        success: false,
        value: { code: "NOT_FOUND", cause: "ケアプランが見つかりません" },
      };
    }

    const item = carePlan.items[0];
    if (!item) {
      return {
        success: false,
        value: {
          code: "NOT_FOUND",
          cause: "指定されたカテゴリーのケアプランアイテムが見つかりません",
        },
      };
    }

    const checklist = item.details as ChecklistSaveData | null;

    return {
      success: true,
      value: {
        itemId: item.id,
        category: item.category as OthersCategoryType,
        status: item.status,
        checklist,
        instructions: item.instructions,
        updatedAt: item.updatedAt.toISOString(),
      },
    };
  } catch (error) {
    console.error("[CarePlanOthers] ケアプランアイテムの取得に失敗しました", {
      admissionId,
      category,
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      success: false,
      value: {
        code: "CARE_PLAN_OTHERS_FETCH_ERROR",
        cause: "ケアプランアイテムの取得に失敗しました",
      },
    };
  }
}
