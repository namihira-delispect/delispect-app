"use server";

import { prisma } from "@delispect/db";
import { authorizeServerAction } from "@/lib/auth";
import type { Result } from "@/shared/types";
import type { SavePainCarePlanResponse, PainCarePlanDetails } from "../types";
import { generatePainInstructions } from "../types";
import { savePainCarePlanSchema } from "../schemata";

/**
 * 疼痛ケアプランを保存するServer Action
 *
 * 認証済みユーザーのみ実行可能。
 * PAINカテゴリーのCarePlanItemのdetails JSONBフィールドに
 * 疼痛データを保存し、ステータスを更新する。
 */
export async function savePainCarePlanAction(input: {
  admissionId: number;
  currentQuestionId?: string | null;
  details: PainCarePlanDetails;
  isCompleted?: boolean;
}): Promise<Result<SavePainCarePlanResponse>> {
  // 認証チェック
  const authResult = await authorizeServerAction();
  if (!authResult.success) {
    return authResult;
  }

  // バリデーション
  const parsed = savePainCarePlanSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      value: { code: "INVALID_INPUT", cause: parsed.error.flatten() },
    };
  }

  const { admissionId, currentQuestionId, details, isCompleted } = parsed.data;

  try {
    // ケアプランとPAINアイテムの取得
    const carePlan = await prisma.carePlan.findUnique({
      where: { admissionId },
      include: {
        items: {
          where: { category: "PAIN" },
          take: 1,
        },
      },
    });

    if (!carePlan || carePlan.items.length === 0) {
      return {
        success: false,
        value: { code: "NOT_FOUND", cause: "疼痛ケアプランアイテムが見つかりません" },
      };
    }

    const painItem = carePlan.items[0];

    // ステータスの決定
    const newStatus = isCompleted ? "COMPLETED" : "IN_PROGRESS";

    // 指示内容の生成（完了時のみ）
    const instructions = isCompleted
      ? generatePainInstructions(details as PainCarePlanDetails)
      : painItem.instructions;

    // CarePlanItem更新
    const updated = await prisma.carePlanItem.update({
      where: { id: painItem.id },
      data: {
        status: newStatus,
        currentQuestionId: currentQuestionId ?? null,
        details: JSON.parse(JSON.stringify(details)),
        instructions,
      },
    });

    return {
      success: true,
      value: {
        itemId: updated.id,
        status: updated.status,
      },
    };
  } catch (error) {
    console.error("[CarePlan:Pain] 疼痛ケアプランの保存に失敗しました", {
      admissionId,
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      success: false,
      value: {
        code: "PAIN_CARE_PLAN_SAVE_ERROR",
        cause: "疼痛ケアプランの保存に失敗しました",
      },
    };
  }
}
