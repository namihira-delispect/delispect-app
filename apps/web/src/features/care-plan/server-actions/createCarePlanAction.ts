"use server";

import { prisma } from "@delispect/db";
import { authorizeServerAction } from "@/lib/auth";
import type { Result } from "@/shared/types";
import type { CreateCarePlanResponse, CarePlanCategoryType } from "../types";
import { CARE_PLAN_CATEGORIES } from "../types";
import { createCarePlanSchema } from "../schemata";

/**
 * ケアプランを作成するServer Action
 *
 * 認証済みユーザーのみ実行可能。
 * 入院IDに対して新規ケアプランを作成し、10カテゴリーのCarePlanItemを
 * 初期ステータス（NOT_STARTED）で一括生成する。
 * 既にケアプランが存在する場合はエラーを返す。
 */
export async function createCarePlanAction(input: {
  admissionId: number;
}): Promise<Result<CreateCarePlanResponse>> {
  // 認証チェック
  const authResult = await authorizeServerAction();
  if (!authResult.success) {
    return authResult;
  }

  // バリデーション
  const parsed = createCarePlanSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      value: { code: "INVALID_INPUT", cause: parsed.error.flatten() },
    };
  }

  const { admissionId } = parsed.data;
  const userId = authResult.value.id;

  try {
    // 入院の存在確認
    const admission = await prisma.admission.findUnique({
      where: { id: admissionId },
      select: { id: true },
    });

    if (!admission) {
      return {
        success: false,
        value: { code: "NOT_FOUND", cause: "指定された入院情報が見つかりません" },
      };
    }

    // 既存ケアプランの重複チェック
    const existingCarePlan = await prisma.carePlan.findUnique({
      where: { admissionId },
      select: { id: true },
    });

    if (existingCarePlan) {
      return {
        success: false,
        value: {
          code: "CARE_PLAN_ALREADY_EXISTS",
          cause: "この入院に対してケアプランは既に作成されています",
        },
      };
    }

    // トランザクションでケアプラン+全アイテムを作成
    const carePlan = await prisma.$transaction(async (tx) => {
      const newCarePlan = await tx.carePlan.create({
        data: {
          admissionId,
          createdById: userId,
        },
      });

      // 10カテゴリーのCarePlanItemを作成
      const itemData = CARE_PLAN_CATEGORIES.map((category: CarePlanCategoryType) => ({
        carePlanId: newCarePlan.id,
        category,
        status: "NOT_STARTED" as const,
      }));

      await tx.carePlanItem.createMany({
        data: itemData,
      });

      return newCarePlan;
    });

    return {
      success: true,
      value: {
        carePlanId: carePlan.id,
        itemCount: CARE_PLAN_CATEGORIES.length,
      },
    };
  } catch (error) {
    console.error("[CarePlan] ケアプランの作成に失敗しました", {
      admissionId,
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      success: false,
      value: {
        code: "CARE_PLAN_CREATE_ERROR",
        cause: "ケアプランの作成に失敗しました",
      },
    };
  }
}
