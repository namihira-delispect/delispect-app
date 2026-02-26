"use server";

import { prisma } from "@delispect/db";
import { authorizeServerAction } from "@/lib/auth";
import type { Result } from "@/shared/types";
import type { InflammationDetails, InflammationDataResponse } from "../types";
import { judgeDeviation, judgeFever, judgeInflammation } from "../types";
import { saveInflammationSchema } from "../schemata";
import { getInflammationData } from "../queries/getInflammationData";

/**
 * 炎症ケアプランの進捗を保存するServer Action
 *
 * 認証済みユーザーのみ実行可能。
 * 一問一答形式の各ステップで入力された情報を保存し、
 * 次のステップへ進む。
 */
export async function saveInflammationAction(input: {
  itemId: number;
  admissionId: number;
  currentQuestionId: string;
  hasPain: boolean | null;
}): Promise<Result<InflammationDataResponse>> {
  // 認証チェック
  const authResult = await authorizeServerAction();
  if (!authResult.success) {
    return authResult;
  }

  // バリデーション
  const parsed = saveInflammationSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      value: { code: "INVALID_INPUT", cause: parsed.error.flatten() },
    };
  }

  const { itemId, admissionId, currentQuestionId, hasPain } = parsed.data;

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

    // 現在のデータを取得して詳細を構築
    const currentData = await getInflammationData(admissionId);
    if (!currentData.success) {
      return currentData;
    }

    const existingDetails = (item.details as InflammationDetails | null) ?? {
      labResults: [],
      vitalSigns: null,
      hasPain: null,
      hasFever: null,
      hasInflammation: null,
    };

    // 採血結果の逸脱判定付きデータを構築
    const labResults = currentData.value.labResults.map((r) => ({
      ...r,
      deviationStatus:
        r.value !== null ? judgeDeviation(r.value, r.lowerLimit, r.upperLimit) : null,
    }));

    // バイタルサインから発熱判定
    const vitalSigns = currentData.value.vitalSigns;
    const hasFever = vitalSigns ? judgeFever(vitalSigns.bodyTemperature) : null;

    // 炎症の有無を判定
    const hasInflammation = judgeInflammation(labResults);

    // 詳細データを更新
    const updatedDetails: InflammationDetails = {
      ...existingDetails,
      labResults,
      vitalSigns,
      hasPain: hasPain ?? existingDetails.hasPain,
      hasFever,
      hasInflammation,
    };

    // ステータスをIN_PROGRESSに更新（まだNOT_STARTEDの場合）
    const newStatus = item.status === "NOT_STARTED" ? "IN_PROGRESS" : item.status;

    await prisma.carePlanItem.update({
      where: { id: itemId },
      data: {
        currentQuestionId,
        details: JSON.parse(JSON.stringify(updatedDetails)),
        status: newStatus,
      },
    });

    // 最新データを返す
    return getInflammationData(admissionId);
  } catch (error) {
    console.error("[Inflammation] 炎症データの保存に失敗しました", {
      itemId,
      admissionId,
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      success: false,
      value: {
        code: "INFLAMMATION_SAVE_ERROR",
        cause: "炎症データの保存に失敗しました",
      },
    };
  }
}
