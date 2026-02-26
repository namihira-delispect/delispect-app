"use server";

import { prisma } from "@delispect/db";
import type { Result } from "@/shared/types";
import type { HighRiskKasanAssessmentDisplay, AssessmentItemDisplay } from "../types";
import { ASSESSMENT_ITEM_DEFINITIONS } from "../types";
import { judgeHighRiskKasan, isPatientOver70, hasRiskDrugInPrescriptions } from "@/lib/kasan";

/**
 * ハイリスクケア加算アセスメント情報を取得する
 *
 * 入院IDに基づき、MedicalHistory・年齢・処方薬剤情報を取得し、
 * アセスメント項目一覧と判定結果を返す。
 */
export async function getHighRiskKasanAssessment(
  admissionId: number,
): Promise<Result<HighRiskKasanAssessmentDisplay>> {
  try {
    const admission = await prisma.admission.findUnique({
      where: { id: admissionId },
      include: {
        patient: {
          select: { birthday: true },
        },
        medicalHistory: true,
        prescriptions: {
          include: {
            medicineMaster: {
              select: { riskFactorFlg: true },
            },
          },
        },
        highRiskCareKasan: {
          include: {
            assessedBy: {
              select: { username: true },
            },
          },
        },
      },
    });

    if (!admission) {
      return {
        success: false,
        value: {
          code: "NOT_FOUND",
          cause: "指定された入院情報が見つかりません",
        },
      };
    }

    // 自動判定項目を算出
    const isOver70 = isPatientOver70(admission.ageAtAdmission);
    const prescriptionRiskFlags = admission.prescriptions
      .filter((p) => p.medicineMaster != null)
      .map((p) => ({ riskFactorFlg: p.medicineMaster!.riskFactorFlg }));
    const hasRiskDrug = hasRiskDrugInPrescriptions(prescriptionRiskFlags);

    // MedicalHistory情報
    const medicalHistory = admission.medicalHistory;
    const medicalHistoryInput = {
      hasDementia: medicalHistory?.hasDementia ?? null,
      hasOrganicBrainDamage: medicalHistory?.hasOrganicBrainDamage ?? null,
      isHeavyAlcohol: medicalHistory?.isHeavyAlcohol ?? null,
      hasDeliriumHistory: medicalHistory?.hasDeliriumHistory ?? null,
      hasGeneralAnesthesia: medicalHistory?.hasGeneralAnesthesia ?? null,
    };

    // 判定実行
    const judgmentResult = judgeHighRiskKasan({
      medicalHistory: medicalHistoryInput,
      isOver70,
      hasRiskDrug,
    });

    // アセスメント項目を構築
    const items: AssessmentItemDisplay[] = ASSESSMENT_ITEM_DEFINITIONS.map((def) => {
      let isApplicable: boolean | null = null;

      switch (def.key) {
        case "hasDementia":
          isApplicable = medicalHistoryInput.hasDementia;
          break;
        case "hasOrganicBrainDamage":
          isApplicable = medicalHistoryInput.hasOrganicBrainDamage;
          break;
        case "isHeavyAlcohol":
          isApplicable = medicalHistoryInput.isHeavyAlcohol;
          break;
        case "hasDeliriumHistory":
          isApplicable = medicalHistoryInput.hasDeliriumHistory;
          break;
        case "hasGeneralAnesthesia":
          isApplicable = medicalHistoryInput.hasGeneralAnesthesia;
          break;
        case "isOver70":
          isApplicable = isOver70;
          break;
        case "hasRiskDrug":
          isApplicable = hasRiskDrug;
          break;
      }

      return {
        key: def.key,
        label: def.label,
        category: def.category,
        source: def.source,
        isApplicable,
        criteria: def.criteria,
      };
    });

    // 既存のHighRiskCareKasan判定結果
    const existingKasan = admission.highRiskCareKasan;

    const response: HighRiskKasanAssessmentDisplay = {
      admissionId: admission.id,
      isEligible: existingKasan ? existingKasan.isEligible : judgmentResult.isEligible,
      isAssessed: existingKasan != null,
      items,
      assessedBy: existingKasan?.assessedBy?.username ?? null,
      assessedAt: existingKasan?.updatedAt?.toISOString() ?? null,
    };

    return {
      success: true,
      value: response,
    };
  } catch (error) {
    console.error("[HighRiskKasan] アセスメント情報の取得に失敗しました", {
      admissionId,
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      success: false,
      value: {
        code: "HIGH_RISK_KASAN_FETCH_ERROR",
        cause: "ハイリスクケア加算アセスメント情報の取得に失敗しました",
      },
    };
  }
}
