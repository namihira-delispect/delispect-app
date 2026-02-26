"use server";

import { prisma } from "@delispect/db";
import type { Result } from "@/shared/types";
import type { DehydrationDetails, DehydrationResponse, LabValueAnswer } from "../types";
import { EMPTY_DEHYDRATION_DETAILS } from "../types";
import { assessDehydration } from "../assessDehydration";

/**
 * 採血結果から基準値付きのLabValueAnswerを構築する
 */
async function buildLabValueAnswer(
  admissionId: number,
  itemCode: string,
  gender: string | null,
): Promise<LabValueAnswer> {
  // 最新の採血結果を取得
  const labResult = await prisma.labResult.findFirst({
    where: { admissionId, itemCode: itemCode as never },
    orderBy: { measuredAt: "desc" },
  });

  // 基準値マスタから基準値を取得
  const referenceConditions: { itemCode: string; gender?: string }[] = [
    { itemCode, gender: gender ?? undefined },
  ];
  // 性別不明の場合、性別なしの基準値を使用
  if (!gender) {
    referenceConditions.push({ itemCode });
  }

  const referenceValue = await prisma.referenceValueMaster.findFirst({
    where: {
      OR: referenceConditions.map((c) => ({
        itemCode: c.itemCode,
        gender: c.gender as never,
      })),
    },
  });

  if (!labResult) {
    return {
      value: null,
      lowerLimit: referenceValue ? Number(referenceValue.lowerLimit) : null,
      upperLimit: referenceValue ? Number(referenceValue.upperLimit) : null,
      unit: referenceValue?.unit ?? null,
      deviationStatus: "NO_DATA",
    };
  }

  const value = Number(labResult.value);
  const lowerLimit = referenceValue?.lowerLimit ? Number(referenceValue.lowerLimit) : null;
  const upperLimit = referenceValue?.upperLimit ? Number(referenceValue.upperLimit) : null;

  let deviationStatus: "NORMAL" | "HIGH" | "LOW" | "NO_DATA" = "NORMAL";
  if (upperLimit !== null && value > upperLimit) {
    deviationStatus = "HIGH";
  } else if (lowerLimit !== null && value < lowerLimit) {
    deviationStatus = "LOW";
  }

  return {
    value,
    lowerLimit,
    upperLimit,
    unit: referenceValue?.unit ?? null,
    deviationStatus,
  };
}

/**
 * 最新のバイタルサインを取得する
 */
async function getLatestVitals(admissionId: number): Promise<{
  pulse: number | null;
  systolicBp: number | null;
  diastolicBp: number | null;
}> {
  const vitalSign = await prisma.vitalSign.findFirst({
    where: { admissionId },
    orderBy: { measuredAt: "desc" },
  });

  if (!vitalSign) {
    return { pulse: null, systolicBp: null, diastolicBp: null };
  }

  return {
    pulse: vitalSign.pulse,
    systolicBp: vitalSign.systolicBp,
    diastolicBp: vitalSign.diastolicBp,
  };
}

/**
 * 脱水アセスメントデータを取得する
 *
 * CarePlanItemのdetailsに保存されている既存データと、
 * 採血結果・バイタルサインの最新データを返す。
 */
export async function getDehydrationData(itemId: number): Promise<Result<DehydrationResponse>> {
  try {
    // CarePlanItemを取得
    const item = await prisma.carePlanItem.findUnique({
      where: { id: itemId },
      include: {
        carePlan: {
          include: {
            admission: {
              include: {
                patient: { select: { sex: true } },
              },
            },
          },
        },
      },
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

    const admissionId = item.carePlan.admissionId;
    const gender = item.carePlan.admission.patient.sex;

    // 既存のdetailsデータを取得（なければ初期値）
    let details: DehydrationDetails = EMPTY_DEHYDRATION_DETAILS;
    if (item.details && typeof item.details === "object") {
      details = {
        ...EMPTY_DEHYDRATION_DETAILS,
        ...(item.details as Record<string, unknown>),
      } as DehydrationDetails;
    }

    // 採血結果をDBから取得して設定（最新値で上書き）
    const genderStr = gender === "MALE" ? "MALE" : gender === "FEMALE" ? "FEMALE" : null;
    const [labHt, labHb] = await Promise.all([
      buildLabValueAnswer(admissionId, "HCT", genderStr),
      buildLabValueAnswer(admissionId, "HGB", genderStr),
    ]);
    details = { ...details, labHt, labHb };

    // バイタルサインをDBから取得して設定（ユーザーが未入力の場合のみ）
    if (details.vitalPulse === null || details.vitalSystolicBp === null) {
      const vitals = await getLatestVitals(admissionId);
      if (details.vitalPulse === null && vitals.pulse !== null) {
        details = { ...details, vitalPulse: vitals.pulse };
      }
      if (details.vitalSystolicBp === null && vitals.systolicBp !== null) {
        details = { ...details, vitalSystolicBp: vitals.systolicBp };
      }
      if (details.vitalDiastolicBp === null && vitals.diastolicBp !== null) {
        details = { ...details, vitalDiastolicBp: vitals.diastolicBp };
      }
    }

    // ステータスに応じてレスポンスを構築
    const status = item.status as "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
    const currentQuestionId =
      (item.currentQuestionId as DehydrationResponse["currentQuestionId"]) ?? null;

    // 完了時はアセスメント結果を含める
    const assessmentResult = status === "COMPLETED" ? assessDehydration(details) : null;

    return {
      success: true,
      value: {
        itemId: item.id,
        status,
        currentQuestionId,
        details,
        assessmentResult,
      },
    };
  } catch (error) {
    console.error("[Dehydration] 脱水アセスメントデータの取得に失敗しました", {
      itemId,
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      success: false,
      value: {
        code: "DEHYDRATION_FETCH_ERROR",
        cause: "脱水アセスメントデータの取得に失敗しました",
      },
    };
  }
}
