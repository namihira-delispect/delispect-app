"use server";

import { prisma } from "@delispect/db";
import { authorizeServerAction } from "@/lib/auth";
import type { Result } from "@/shared/types";
import type { SaveOthersCarePlanResponse, OthersCategoryType } from "../types";
import { generateInstructions } from "../types";
import { saveOthersCarePlanSchema } from "../schemata";

/**
 * その他カテゴリのケアプランを保存するServer Action
 *
 * 認証済みユーザーのみ実行可能。
 * チェックリストの選択内容を保存し、指示内容を自動生成する。
 * 選択がある場合はステータスをCOMPLETEDに、選択がない場合はNOT_STARTEDに更新する。
 */
export async function saveOthersCarePlanAction(input: {
  itemId: number;
  checklist: {
    selectedOptionIds: string[];
    notes?: string;
  };
}): Promise<Result<SaveOthersCarePlanResponse>> {
  // 認証チェック
  const authResult = await authorizeServerAction();
  if (!authResult.success) {
    return authResult;
  }

  // バリデーション
  const parsed = saveOthersCarePlanSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      value: { code: "INVALID_INPUT", cause: parsed.error.flatten() },
    };
  }

  const { itemId, checklist } = parsed.data;

  try {
    // アイテムの存在確認
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

    const category = item.category as OthersCategoryType;

    // ステータスの決定: 選択肢がある場合はCOMPLETED、ない場合はNOT_STARTED
    const newStatus = checklist.selectedOptionIds.length > 0 ? "COMPLETED" : "NOT_STARTED";

    // 指示内容の自動生成
    const instructions = generateInstructions(category, checklist.selectedOptionIds);

    // 保存
    const updated = await prisma.carePlanItem.update({
      where: { id: itemId },
      data: {
        details: checklist,
        instructions: instructions || null,
        status: newStatus,
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
    console.error("[CarePlanOthers] ケアプランの保存に失敗しました", {
      itemId,
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      success: false,
      value: {
        code: "CARE_PLAN_OTHERS_SAVE_ERROR",
        cause: "ケアプランの保存に失敗しました",
      },
    };
  }
}
