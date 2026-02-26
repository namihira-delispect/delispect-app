"use server";

import { prisma } from "@delispect/db";
import { authorizeServerAction } from "@/lib/auth";
import type { Result } from "@/shared/types";
import type { CarePlanListResponse } from "../types";
import { updateCarePlanItemStatusSchema } from "../schemata";
import { getCarePlan } from "../queries/getCarePlan";

/**
 * ケアプランアイテムのステータスを更新するServer Action
 *
 * 認証済みユーザーのみ実行可能。
 * 指定されたアイテムのステータスを更新し、最新のケアプラン一覧を返す。
 */
export async function updateCarePlanItemStatusAction(input: {
  itemId: number;
  status: string;
}): Promise<Result<CarePlanListResponse | null>> {
  // 認証チェック
  const authResult = await authorizeServerAction();
  if (!authResult.success) {
    return authResult;
  }

  // バリデーション
  const parsed = updateCarePlanItemStatusSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      value: { code: "INVALID_INPUT", cause: parsed.error.flatten() },
    };
  }

  const { itemId, status } = parsed.data;

  try {
    // アイテムの存在確認と関連データ取得
    const item = await prisma.carePlanItem.findUnique({
      where: { id: itemId },
      include: {
        carePlan: {
          select: { admissionId: true },
        },
      },
    });

    if (!item) {
      return {
        success: false,
        value: { code: "NOT_FOUND", cause: "指定されたケアプランアイテムが見つかりません" },
      };
    }

    // ステータス更新
    await prisma.carePlanItem.update({
      where: { id: itemId },
      data: { status },
    });

    // 最新のケアプラン一覧を返す
    return getCarePlan(item.carePlan.admissionId);
  } catch (error) {
    console.error("[CarePlan] ケアプランアイテムのステータス更新に失敗しました", {
      itemId,
      status,
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      success: false,
      value: {
        code: "CARE_PLAN_UPDATE_ERROR",
        cause: "ケアプランアイテムのステータス更新に失敗しました",
      },
    };
  }
}
