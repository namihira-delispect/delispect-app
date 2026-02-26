"use server";

import { prisma } from "@delispect/db";
import type { Result } from "@/shared/types";
import type {
  InflammationDataResponse,
  LabResultEntry,
  VitalSignEntry,
  InflammationDetails,
  InflammationQuestionId,
} from "../types";
import { judgeDeviation } from "../types";

/**
 * 炎症ケアプランのデータを取得する
 *
 * 入院IDに基づき、以下のデータを取得して返す:
 * - ケアプランアイテム（INFLAMMATIONカテゴリ）
 * - 採血結果（CRP/WBC）と基準値
 * - 最新のバイタルサイン
 */
export async function getInflammationData(
  admissionId: number,
): Promise<Result<InflammationDataResponse>> {
  try {
    // ケアプランアイテム取得
    const carePlan = await prisma.carePlan.findUnique({
      where: { admissionId },
      include: {
        items: {
          where: { category: "INFLAMMATION" },
          take: 1,
        },
      },
    });

    if (!carePlan || carePlan.items.length === 0) {
      return {
        success: false,
        value: {
          code: "NOT_FOUND",
          cause: "炎症のケアプランアイテムが見つかりません",
        },
      };
    }

    const inflammationItem = carePlan.items[0];

    // 採血結果取得（CRP/WBC: 最新のものを1件ずつ）
    const [crpResult, wbcResult] = await Promise.all([
      prisma.labResult.findFirst({
        where: { admissionId, itemCode: "CRP" },
        orderBy: { measuredAt: "desc" },
      }),
      prisma.labResult.findFirst({
        where: { admissionId, itemCode: "WBC" },
        orderBy: { measuredAt: "desc" },
      }),
    ]);

    // 基準値マスタ取得
    const referenceValues = await prisma.referenceValueMaster.findMany({
      where: {
        itemCode: { in: ["CRP", "WBC"] },
      },
    });

    const crpRef = referenceValues.find((r) => r.itemCode === "CRP");
    const wbcRef = referenceValues.find((r) => r.itemCode === "WBC");

    // 採血結果エントリの構築
    const labResults: LabResultEntry[] = [
      {
        itemCode: "CRP",
        itemName: crpRef?.itemName ?? "C反応性蛋白",
        value: crpResult ? Number(crpResult.value) : null,
        unit: crpRef?.unit ?? "mg/dL",
        lowerLimit:
          crpRef?.lowerLimit !== null && crpRef?.lowerLimit !== undefined
            ? Number(crpRef.lowerLimit)
            : null,
        upperLimit:
          crpRef?.upperLimit !== null && crpRef?.upperLimit !== undefined
            ? Number(crpRef.upperLimit)
            : null,
        deviationStatus: crpResult
          ? judgeDeviation(
              Number(crpResult.value),
              crpRef?.lowerLimit !== null && crpRef?.lowerLimit !== undefined
                ? Number(crpRef.lowerLimit)
                : null,
              crpRef?.upperLimit !== null && crpRef?.upperLimit !== undefined
                ? Number(crpRef.upperLimit)
                : null,
            )
          : null,
        measuredAt: crpResult?.measuredAt.toISOString() ?? null,
      },
      {
        itemCode: "WBC",
        itemName: wbcRef?.itemName ?? "白血球数",
        value: wbcResult ? Number(wbcResult.value) : null,
        unit: wbcRef?.unit ?? "/uL",
        lowerLimit:
          wbcRef?.lowerLimit !== null && wbcRef?.lowerLimit !== undefined
            ? Number(wbcRef.lowerLimit)
            : null,
        upperLimit:
          wbcRef?.upperLimit !== null && wbcRef?.upperLimit !== undefined
            ? Number(wbcRef.upperLimit)
            : null,
        deviationStatus: wbcResult
          ? judgeDeviation(
              Number(wbcResult.value),
              wbcRef?.lowerLimit !== null && wbcRef?.lowerLimit !== undefined
                ? Number(wbcRef.lowerLimit)
                : null,
              wbcRef?.upperLimit !== null && wbcRef?.upperLimit !== undefined
                ? Number(wbcRef.upperLimit)
                : null,
            )
          : null,
        measuredAt: wbcResult?.measuredAt.toISOString() ?? null,
      },
    ];

    // 最新バイタルサイン取得
    const latestVital = await prisma.vitalSign.findFirst({
      where: { admissionId },
      orderBy: { measuredAt: "desc" },
    });

    const vitalSigns: VitalSignEntry | null = latestVital
      ? {
          pulse: latestVital.pulse,
          systolicBp: latestVital.systolicBp,
          diastolicBp: latestVital.diastolicBp,
          spo2: latestVital.spo2 !== null ? Number(latestVital.spo2) : null,
          bodyTemperature:
            latestVital.bodyTemperature !== null ? Number(latestVital.bodyTemperature) : null,
          measuredAt: latestVital.measuredAt.toISOString(),
        }
      : null;

    // 既存の詳細データを取得
    const details = inflammationItem.details as InflammationDetails | null;

    return {
      success: true,
      value: {
        itemId: inflammationItem.id,
        currentQuestionId: (inflammationItem.currentQuestionId as InflammationQuestionId) ?? null,
        labResults,
        vitalSigns,
        details,
      },
    };
  } catch (error) {
    console.error("[Inflammation] 炎症データの取得に失敗しました", {
      admissionId,
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      success: false,
      value: {
        code: "INFLAMMATION_FETCH_ERROR",
        cause: "炎症データの取得に失敗しました",
      },
    };
  }
}
