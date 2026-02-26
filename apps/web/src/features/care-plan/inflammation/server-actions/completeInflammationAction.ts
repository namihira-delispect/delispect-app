"use server";

import { prisma } from "@delispect/db";
import { authorizeServerAction } from "@/lib/auth";
import type { Result } from "@/shared/types";
import type { InflammationDetails, InflammationSuggestionResponse } from "../types";
import { generateInflammationSuggestions } from "../types";
import { completeInflammationSchema } from "../schemata";

/**
 * 炎症ケアプランを完了するServer Action
 *
 * 認証済みユーザーのみ実行可能。
 * 入力データから対処提案を生成し、ケアプランアイテムを完了状態にする。
 */
export async function completeInflammationAction(input: {
  itemId: number;
  admissionId: number;
}): Promise<Result<InflammationSuggestionResponse>> {
  // 認証チェック
  const authResult = await authorizeServerAction();
  if (!authResult.success) {
    return authResult;
  }

  // バリデーション
  const parsed = completeInflammationSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      value: { code: "INVALID_INPUT", cause: parsed.error.flatten() },
    };
  }

  const { itemId, admissionId } = parsed.data;

  try {
    // アイテムの存在確認
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

    if (item.carePlan.admissionId !== admissionId) {
      return {
        success: false,
        value: { code: "INVALID_INPUT", cause: "入院IDが一致しません" },
      };
    }

    const details = item.details as InflammationDetails | null;

    if (!details) {
      return {
        success: false,
        value: {
          code: "INFLAMMATION_INCOMPLETE",
          cause: "炎症データが入力されていません。各ステップを完了してから提案を確認してください。",
        },
      };
    }

    // 対処提案を生成
    const suggestionResponse = generateInflammationSuggestions(details);

    // 提案をinstructionsとして保存し、ステータスを完了にする
    const instructionText = suggestionResponse.suggestions
      .map((s) => `[${s.category}] ${s.message}`)
      .join("\n");

    await prisma.carePlanItem.update({
      where: { id: itemId },
      data: {
        status: "COMPLETED",
        currentQuestionId: "suggestion",
        instructions: instructionText,
      },
    });

    return {
      success: true,
      value: suggestionResponse,
    };
  } catch (error) {
    console.error("[Inflammation] 炎症ケアプランの完了に失敗しました", {
      itemId,
      admissionId,
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      success: false,
      value: {
        code: "INFLAMMATION_COMPLETE_ERROR",
        cause: "炎症ケアプランの完了に失敗しました",
      },
    };
  }
}
