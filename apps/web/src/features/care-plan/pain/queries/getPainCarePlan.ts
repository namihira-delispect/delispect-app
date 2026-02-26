"use server";

import { prisma } from "@delispect/db";
import type { Result } from "@/shared/types";
import type { PainCarePlanResponse, PainCarePlanDetails, PainMedicationInfo } from "../types";

/**
 * 疼痛ケアプランの情報を取得する
 *
 * 入院IDに基づき、疼痛カテゴリーのCarePlanItemと
 * 痛み止め処方情報を取得して返す。
 */
export async function getPainCarePlan(
  admissionId: number,
): Promise<Result<PainCarePlanResponse | null>> {
  try {
    // ケアプランとPAINカテゴリーのアイテムを取得
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
        success: true,
        value: null,
      };
    }

    const painItem = carePlan.items[0];

    // 痛み止め処方を取得（鎮痛薬関連）
    const prescriptions = await prisma.prescription.findMany({
      where: {
        admissionId,
      },
      orderBy: { prescribedAt: "desc" },
    });

    const painMedications: PainMedicationInfo[] = prescriptions.map((p) => ({
      id: p.id,
      drugName: p.drugName,
      prescriptionType: p.prescriptionType,
      prescribedAt: p.prescribedAt.toISOString(),
    }));

    const details = painItem.details as PainCarePlanDetails | null;

    const response: PainCarePlanResponse = {
      itemId: painItem.id,
      status: painItem.status,
      currentQuestionId: painItem.currentQuestionId,
      details,
      instructions: painItem.instructions,
      painMedications,
    };

    return {
      success: true,
      value: response,
    };
  } catch (error) {
    console.error("[CarePlan:Pain] 疼痛ケアプラン情報の取得に失敗しました", {
      admissionId,
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      success: false,
      value: {
        code: "PAIN_CARE_PLAN_FETCH_ERROR",
        cause: "疼痛ケアプラン情報の取得に失敗しました",
      },
    };
  }
}
