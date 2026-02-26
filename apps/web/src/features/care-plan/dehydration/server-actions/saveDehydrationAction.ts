"use server";

import { prisma } from "@delispect/db";
import { authorizeServerAction } from "@/lib/auth";
import type { Result } from "@/shared/types";
import type { DehydrationResponse } from "../types";
import { saveDehydrationSchema } from "../schemata";
import { getDehydrationData } from "../queries/getDehydrationData";

/**
 * 脱水アセスメントの途中保存Server Action
 *
 * 認証済みユーザーのみ実行可能。
 * 一問一答形式の入力途中状態を保存する。
 * ステータスをIN_PROGRESSに更新し、現在の質問IDとdetailsを保存する。
 */
export async function saveDehydrationAction(input: {
  itemId: number;
  currentQuestionId: string;
  details: Record<string, unknown>;
}): Promise<Result<DehydrationResponse>> {
  // 認証チェック
  const authResult = await authorizeServerAction();
  if (!authResult.success) {
    return authResult;
  }

  // バリデーション
  const parsed = saveDehydrationSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      value: { code: "INVALID_INPUT", cause: parsed.error.flatten() },
    };
  }

  const { itemId, currentQuestionId, details } = parsed.data;

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

    // ステータスとdetailsを更新
    await prisma.carePlanItem.update({
      where: { id: itemId },
      data: {
        status: "IN_PROGRESS",
        currentQuestionId,
        details: details as never,
      },
    });

    // 最新データを返す
    return getDehydrationData(itemId);
  } catch (error) {
    console.error("[Dehydration] 脱水アセスメントの保存に失敗しました", {
      itemId,
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      success: false,
      value: {
        code: "DEHYDRATION_SAVE_ERROR",
        cause: "脱水アセスメントの保存に失敗しました",
      },
    };
  }
}
