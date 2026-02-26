"use server";

import { prisma } from "@delispect/db";
import { authorizeServerAction } from "@/lib/auth";
import type { Result } from "@/shared/types";
import type { MedicationCarePlanResponse } from "../types";
import { saveMedicationCarePlanSchema } from "../schemata";
import { getMedicationCarePlan } from "../queries/getMedicationCarePlan";

/**
 * 薬剤ケアプランの入力内容を保存するServer Action
 *
 * 認証済みユーザーのみ実行可能。
 * ケアプランアイテムのdetailsフィールドに薬剤評価結果を保存し、
 * ステータスを更新する。
 */
export async function saveMedicationCarePlanAction(input: {
  carePlanItemId: number;
  currentQuestionId: string;
  details: unknown;
  status: string;
}): Promise<Result<MedicationCarePlanResponse>> {
  // 認証チェック
  const authResult = await authorizeServerAction();
  if (!authResult.success) {
    return authResult;
  }

  // バリデーション
  const parsed = saveMedicationCarePlanSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      value: { code: "INVALID_INPUT", cause: parsed.error.flatten() },
    };
  }

  const { carePlanItemId, currentQuestionId, details, status } = parsed.data;

  try {
    // アイテムの存在確認と関連データ取得
    const item = await prisma.carePlanItem.findUnique({
      where: { id: carePlanItemId },
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

    // カテゴリの確認
    if (item.category !== "MEDICATION") {
      return {
        success: false,
        value: {
          code: "INVALID_CATEGORY",
          cause: "指定されたアイテムは薬剤カテゴリではありません",
        },
      };
    }

    // 指示内容の生成
    const instructions = generateInstructions(details);

    // ケアプランアイテムの更新
    await prisma.carePlanItem.update({
      where: { id: carePlanItemId },
      data: {
        status,
        currentQuestionId,
        details: details as object,
        instructions,
      },
    });

    // 最新の薬剤ケアプランデータを返す
    return getMedicationCarePlan(item.carePlan.admissionId);
  } catch (error) {
    console.error("[CarePlan:Medication] 薬剤ケアプランの保存に失敗しました", {
      carePlanItemId,
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      success: false,
      value: {
        code: "MEDICATION_CARE_PLAN_SAVE_ERROR",
        cause: "薬剤ケアプランの保存に失敗しました",
      },
    };
  }
}

/**
 * 薬剤ケアプランの指示内容を自動生成する
 */
function generateInstructions(details: {
  riskDrugMatches: unknown[];
  opioidDrugs: unknown[];
  selectedAlternatives: Array<{
    originalDrugName: string;
    alternativeDrugName: string;
    changeReason: string;
  }>;
  instructions: string;
}): string {
  const parts: string[] = [];

  if (details.riskDrugMatches.length > 0) {
    parts.push(`リスク薬剤 ${details.riskDrugMatches.length}件を確認`);
  }

  if (details.opioidDrugs.length > 0) {
    parts.push(`オピオイド薬剤 ${details.opioidDrugs.length}件を確認`);
  }

  if (details.selectedAlternatives.length > 0) {
    const altSummary = details.selectedAlternatives
      .map((a) => `${a.originalDrugName} → ${a.alternativeDrugName}`)
      .join("、");
    parts.push(`代替薬剤提案: ${altSummary}`);
  }

  if (details.instructions) {
    parts.push(details.instructions);
  }

  return parts.join("。") || "薬剤評価を完了";
}
