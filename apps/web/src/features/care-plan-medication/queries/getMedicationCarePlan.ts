"use server";

import { prisma } from "@delispect/db";
import type { Result } from "@/shared/types";
import type {
  MedicationCarePlanResponse,
  PrescriptionEntry,
  RiskDrugMatch,
  MedicationCarePlanDetails,
  MedicationQuestionId,
} from "../types";
import { OPIOID_CATEGORY_ID, RISK_DRUG_WARNING_MESSAGES, ALTERNATIVE_DRUG_MAP } from "../types";

/**
 * 薬剤ケアプランの表示データを取得する
 *
 * 入院IDに基づき、処方データ・リスク薬剤マスタの照合結果・
 * オピオイド薬剤情報・代替薬剤提案を取得する。
 */
export async function getMedicationCarePlan(
  admissionId: number,
): Promise<Result<MedicationCarePlanResponse>> {
  try {
    // ケアプランとMEDICATIONカテゴリのアイテムを取得
    const carePlan = await prisma.carePlan.findUnique({
      where: { admissionId },
      include: {
        items: {
          where: { category: "MEDICATION" },
          take: 1,
        },
      },
    });

    if (!carePlan || carePlan.items.length === 0) {
      return {
        success: false,
        value: {
          code: "NOT_FOUND",
          cause: "ケアプランまたは薬剤カテゴリが見つかりません",
        },
      };
    }

    const carePlanItem = carePlan.items[0];

    // 処方データをリスク薬剤マスタと結合して取得
    const prescriptions = await prisma.prescription.findMany({
      where: { admissionId },
      include: {
        medicineMaster: true,
      },
      orderBy: { prescribedAt: "desc" },
    });

    // 処方データをPrescriptionEntry型にマッピング
    const prescriptionEntries: PrescriptionEntry[] = prescriptions.map((p) => ({
      id: p.id,
      yjCode: p.yjCode,
      drugName: p.drugName,
      prescriptionType: p.prescriptionType as "ORAL" | "INJECTION" | "EXTERNAL",
      prescribedAt: p.prescribedAt.toISOString(),
      isRiskDrug: p.medicineMaster?.riskFactorFlg ?? false,
      isOpioid: p.medicineMaster?.categoryId === OPIOID_CATEGORY_ID,
      riskCategoryId: p.medicineMaster?.riskFactorFlg
        ? (p.medicineMaster?.categoryId ?? null)
        : null,
    }));

    // リスク薬剤照合結果の生成
    const riskDrugMatches: RiskDrugMatch[] = prescriptionEntries
      .filter((p) => p.isRiskDrug && p.riskCategoryId !== null)
      .map((p) => ({
        prescription: p,
        warningMessage:
          RISK_DRUG_WARNING_MESSAGES[p.riskCategoryId!] ??
          "リスク薬剤が処方されています。投与の回避または調整を検討してください。",
        alternatives: ALTERNATIVE_DRUG_MAP[p.riskCategoryId!] ?? [],
        changeReason: getChangeReason(p.riskCategoryId!),
      }));

    // オピオイド薬剤の抽出
    const opioidDrugs = prescriptionEntries.filter((p) => p.isOpioid);

    // 保存済みの詳細データ
    const savedDetails = carePlanItem.details as MedicationCarePlanDetails | null;

    const response: MedicationCarePlanResponse = {
      admissionId,
      carePlanItemId: carePlanItem.id,
      status: carePlanItem.status as MedicationCarePlanResponse["status"],
      currentQuestionId: (carePlanItem.currentQuestionId as MedicationQuestionId) ?? null,
      prescriptions: prescriptionEntries,
      riskDrugMatches,
      opioidDrugs,
      savedDetails,
    };

    return {
      success: true,
      value: response,
    };
  } catch (error) {
    console.error("[CarePlan:Medication] 薬剤ケアプランデータの取得に失敗しました", {
      admissionId,
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      success: false,
      value: {
        code: "MEDICATION_CARE_PLAN_FETCH_ERROR",
        cause: "薬剤ケアプランデータの取得に失敗しました",
      },
    };
  }
}

/**
 * カテゴリIDに応じた薬剤変更理由を返す
 */
function getChangeReason(categoryId: number): string {
  const reasons: Record<number, string> = {
    1: "オピオイド薬剤はせん妄の直接的な原因となる可能性があります。非オピオイド鎮痛薬の使用を優先してください。",
    2: "ベンゾジアゼピン系薬剤はGABA受容体に作用し、せん妄リスクを増大させます。",
    3: "抗コリン薬はアセチルコリン系の機能低下を引き起こし、せん妄の原因となります。",
    4: "H2ブロッカーは中枢神経系への影響があり、せん妄リスクがあります。PPIへの変更を推奨します。",
    5: "抗精神病薬は必要最小量に留め、可能な限り早期に中止を検討してください。",
    6: "ステロイドの高用量投与はせん妄リスクを増大させます。漸減スケジュールの検討を推奨します。",
  };
  return reasons[categoryId] ?? "リスク薬剤に該当するため、代替薬剤への変更を検討してください。";
}
