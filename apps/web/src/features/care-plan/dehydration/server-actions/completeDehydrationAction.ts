"use server";

import { prisma } from "@delispect/db";
import { authorizeServerAction } from "@/lib/auth";
import type { Result } from "@/shared/types";
import type { DehydrationResponse } from "../types";
import { completeDehydrationSchema } from "../schemata";
import { assessDehydration } from "../assessDehydration";
import { getDehydrationData } from "../queries/getDehydrationData";

/**
 * 脱水アセスメントを完了するServer Action
 *
 * 認証済みユーザーのみ実行可能。
 * アセスメント結果を評価し、対処提案を生成して保存する。
 * ステータスをCOMPLETEDに更新する。
 */
export async function completeDehydrationAction(input: {
  itemId: number;
  details: Record<string, unknown>;
}): Promise<Result<DehydrationResponse>> {
  // 認証チェック
  const authResult = await authorizeServerAction();
  if (!authResult.success) {
    return authResult;
  }

  // バリデーション
  const parsed = completeDehydrationSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      value: { code: "INVALID_INPUT", cause: parsed.error.flatten() },
    };
  }

  const { itemId, details } = parsed.data;

  try {
    // アイテムの存在確認
    const item = await prisma.carePlanItem.findUnique({
      where: { id: itemId },
      select: { id: true, category: true },
    });

    if (!item) {
      return {
        success: false,
        value: { code: "NOT_FOUND", cause: "指定されたケアプランアイテムが見つかりません" },
      };
    }

    if (item.category !== "DEHYDRATION") {
      return {
        success: false,
        value: { code: "INVALID_CATEGORY", cause: "このアイテムは脱水カテゴリーではありません" },
      };
    }

    // アセスメント結果を生成
    const assessmentResult = assessDehydration(details);

    // ステータスをCOMPLETEDに更新し、指示内容を保存
    await prisma.carePlanItem.update({
      where: { id: itemId },
      data: {
        status: "COMPLETED",
        currentQuestionId: null,
        details: details as never,
        instructions: assessmentResult.instructions,
      },
    });

    // 最新データを返す
    return getDehydrationData(itemId);
  } catch (error) {
    console.error("[Dehydration] 脱水アセスメントの完了に失敗しました", {
      itemId,
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      success: false,
      value: {
        code: "DEHYDRATION_COMPLETE_ERROR",
        cause: "脱水アセスメントの完了に失敗しました",
      },
    };
  }
}
