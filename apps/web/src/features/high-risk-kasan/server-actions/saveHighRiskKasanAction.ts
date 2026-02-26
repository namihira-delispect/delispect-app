"use server";

import { prisma } from "@delispect/db";
import { authorizeServerAction } from "@/lib/auth";
import type { Result } from "@/shared/types";
import type { HighRiskKasanAssessmentDisplay } from "../types";
import { saveHighRiskKasanSchema } from "../schemata";
import { judgeHighRiskKasan, isPatientOver70, hasRiskDrugInPrescriptions } from "@/lib/kasan";
import { getHighRiskKasanAssessment } from "../queries/getHighRiskKasanAssessment";

/**
 * ハイリスクケア加算アセスメントを保存するServer Action
 *
 * 認証済みユーザーのみ実行可能。
 * MedicalHistory項目を保存し、判定結果をHighRiskCareKasanテーブルに保存する。
 * 自動判定項目（年齢・リスク薬剤）は入院情報から再算出する。
 */
export async function saveHighRiskKasanAction(input: {
  admissionId: number;
  medicalHistoryItems: {
    hasDementia: boolean;
    hasOrganicBrainDamage: boolean;
    isHeavyAlcohol: boolean;
    hasDeliriumHistory: boolean;
    hasGeneralAnesthesia: boolean;
  };
}): Promise<Result<HighRiskKasanAssessmentDisplay>> {
  // 認証チェック
  const authResult = await authorizeServerAction();
  if (!authResult.success) {
    return authResult;
  }

  // バリデーション
  const parsed = saveHighRiskKasanSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      value: { code: "INVALID_INPUT", cause: parsed.error.flatten() },
    };
  }

  const { admissionId, medicalHistoryItems } = parsed.data;
  const userId = authResult.value.id;

  try {
    // 入院情報と自動判定項目を取得
    const admission = await prisma.admission.findUnique({
      where: { id: admissionId },
      include: {
        prescriptions: {
          include: {
            medicineMaster: {
              select: { riskFactorFlg: true },
            },
          },
        },
      },
    });

    if (!admission) {
      return {
        success: false,
        value: { code: "NOT_FOUND", cause: "指定された入院情報が見つかりません" },
      };
    }

    // 自動判定項目を算出
    const isOver70 = isPatientOver70(admission.ageAtAdmission);
    const prescriptionRiskFlags = admission.prescriptions
      .filter((p) => p.medicineMaster != null)
      .map((p) => ({ riskFactorFlg: p.medicineMaster!.riskFactorFlg }));
    const hasRiskDrug = hasRiskDrugInPrescriptions(prescriptionRiskFlags);

    // 判定実行
    const judgmentResult = judgeHighRiskKasan({
      medicalHistory: {
        hasDementia: medicalHistoryItems.hasDementia,
        hasOrganicBrainDamage: medicalHistoryItems.hasOrganicBrainDamage,
        isHeavyAlcohol: medicalHistoryItems.isHeavyAlcohol,
        hasDeliriumHistory: medicalHistoryItems.hasDeliriumHistory,
        hasGeneralAnesthesia: medicalHistoryItems.hasGeneralAnesthesia,
      },
      isOver70,
      hasRiskDrug,
    });

    // トランザクションで MedicalHistory + HighRiskCareKasan を保存
    await prisma.$transaction(async (tx) => {
      // MedicalHistory を upsert
      await tx.medicalHistory.upsert({
        where: { admissionId },
        create: {
          admissionId,
          hasDementia: medicalHistoryItems.hasDementia,
          hasOrganicBrainDamage: medicalHistoryItems.hasOrganicBrainDamage,
          isHeavyAlcohol: medicalHistoryItems.isHeavyAlcohol,
          hasDeliriumHistory: medicalHistoryItems.hasDeliriumHistory,
          hasGeneralAnesthesia: medicalHistoryItems.hasGeneralAnesthesia,
        },
        update: {
          hasDementia: medicalHistoryItems.hasDementia,
          hasOrganicBrainDamage: medicalHistoryItems.hasOrganicBrainDamage,
          isHeavyAlcohol: medicalHistoryItems.isHeavyAlcohol,
          hasDeliriumHistory: medicalHistoryItems.hasDeliriumHistory,
          hasGeneralAnesthesia: medicalHistoryItems.hasGeneralAnesthesia,
        },
      });

      // HighRiskCareKasan を upsert
      await tx.highRiskCareKasan.upsert({
        where: { admissionId },
        create: {
          admissionId,
          assessedById: userId,
          isEligible: judgmentResult.isEligible,
        },
        update: {
          assessedById: userId,
          isEligible: judgmentResult.isEligible,
        },
      });
    });

    // 最新の状態を取得して返す
    return getHighRiskKasanAssessment(admissionId);
  } catch (error) {
    console.error("[HighRiskKasan] アセスメントの保存に失敗しました", {
      admissionId,
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      success: false,
      value: {
        code: "HIGH_RISK_KASAN_SAVE_ERROR",
        cause: "ハイリスクケア加算アセスメントの保存に失敗しました",
      },
    };
  }
}
