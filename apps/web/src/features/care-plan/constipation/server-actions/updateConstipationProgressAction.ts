"use server";

import { prisma } from "@delispect/db";
import { authorizeServerAction } from "@/lib/auth";
import type { Result } from "@/shared/types";

/**
 * 便秘ケアプランの進捗（現在の質問ID）を更新するServer Action
 *
 * 一問一答形式で入力途中の状態を保持するために、
 * currentQuestionIdとステータスをIN_PROGRESSに更新する。
 */
export async function updateConstipationProgressAction(input: {
  admissionId: number;
  currentQuestionId: string;
}): Promise<Result<{ itemId: number }>> {
  // 認証チェック
  const authResult = await authorizeServerAction();
  if (!authResult.success) {
    return authResult;
  }

  const { admissionId, currentQuestionId } = input;

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
        success: false,
        value: {
          code: "NOT_FOUND",
          cause: "ケアプランまたは便秘のケアプランアイテムが見つかりません",
        },
      };
    }

    const item = carePlan.items[0];

    await prisma.carePlanItem.update({
      where: { id: item.id },
      data: {
        currentQuestionId,
        status: item.status === "NOT_STARTED" ? "IN_PROGRESS" : item.status,
      },
    });

    return {
      success: true,
      value: { itemId: item.id },
    };
  } catch (error) {
    console.error("[Constipation] 便秘ケアプランの進捗更新に失敗しました", {
      admissionId,
      currentQuestionId,
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      success: false,
      value: {
        code: "CONSTIPATION_PROGRESS_ERROR",
        cause: "便秘ケアプランの進捗更新に失敗しました",
      },
    };
  }
}
