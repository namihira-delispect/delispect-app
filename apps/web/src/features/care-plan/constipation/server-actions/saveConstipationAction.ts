"use server";

import { prisma } from "@delispect/db";
import { authorizeServerAction } from "@/lib/auth";
import type { Result } from "@/shared/types";
import { saveConstipationSchema } from "../schemata";
import type { ConstipationDetails, ConstipationAssessmentData } from "../types";
import { determineConstipationSeverity, generateConstipationSuggestions } from "../types";

/** 便秘ケアプラン保存レスポンス */
export interface SaveConstipationResponse {
  /** ケアプランアイテムID */
  itemId: number;
  /** 保存された詳細データ */
  details: ConstipationDetails;
}

/**
 * 便秘ケアプランのアセスメントデータを保存するServer Action
 *
 * 認証済みユーザーのみ実行可能。
 * 入力データを検証し、重症度判定と対処提案を生成してCarePlanItem.detailsに保存する。
 * ステータスをCOMPLETEDに更新する。
 */
export async function saveConstipationAction(input: {
  admissionId: number;
  assessment: ConstipationAssessmentData;
}): Promise<Result<SaveConstipationResponse>> {
  // 認証チェック
  const authResult = await authorizeServerAction();
  if (!authResult.success) {
    return authResult;
  }

  // バリデーション
  const parsed = saveConstipationSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      value: { code: "INVALID_INPUT", cause: parsed.error.flatten() },
    };
  }

  const { admissionId, assessment } = parsed.data;

  try {
    // ケアプランの存在確認と便秘アイテム取得
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

    // 重症度判定と対処提案生成
    const assessmentData = assessment as ConstipationAssessmentData;
    const severity = determineConstipationSeverity(assessmentData);
    const suggestion = generateConstipationSuggestions(severity, assessmentData);

    const details: ConstipationDetails = {
      assessment: assessmentData,
      suggestion,
    };

    // CarePlanItemの更新（details保存 + ステータスをCOMPLETEDに）
    const updatedItem = await prisma.carePlanItem.update({
      where: { id: item.id },
      data: {
        details: details as unknown as Record<string, unknown>,
        status: "COMPLETED",
        currentQuestionId: null,
      },
    });

    return {
      success: true,
      value: {
        itemId: updatedItem.id,
        details,
      },
    };
  } catch (error) {
    console.error("[Constipation] 便秘ケアプランの保存に失敗しました", {
      admissionId,
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      success: false,
      value: {
        code: "CONSTIPATION_SAVE_ERROR",
        cause: "便秘ケアプランの保存に失敗しました",
      },
    };
  }
}
