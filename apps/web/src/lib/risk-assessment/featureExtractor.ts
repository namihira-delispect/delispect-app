/**
 * 特徴量抽出ロジック
 *
 * 入院IDからDBのデータを参照し、MLモデルの入力形式に変換する。
 * 以下のデータを抽出する:
 * - 患者基本情報（年齢、性別、身長、体重）
 * - 既往歴（MedicalHistory）
 * - 最新バイタルサイン
 * - 最新検査値
 * - 処方薬剤（リスク薬剤の突き合わせ）
 */

import { prisma } from "@delispect/db";
import type { MlInputFeatures } from "@/features/risk-assessment/types";

/**
 * 指定された入院IDリストに対してML入力特徴量を抽出する
 *
 * @param admissionIds - 入院IDリスト
 * @returns ML入力特徴量リスト
 */
export async function extractFeatures(admissionIds: number[]): Promise<MlInputFeatures[]> {
  const admissions = await prisma.admission.findMany({
    where: { id: { in: admissionIds } },
    include: {
      patient: {
        select: {
          sex: true,
        },
      },
      medicalHistory: true,
      vitalSigns: {
        orderBy: { measuredAt: "desc" },
        take: 1,
      },
      labResults: {
        orderBy: { measuredAt: "desc" },
      },
      prescriptions: {
        include: {
          medicineMaster: {
            select: { riskFactorFlg: true },
          },
        },
      },
    },
  });

  return admissions.map((admission) => {
    // 最新バイタルサイン
    const latestVital = admission.vitalSigns[0] ?? null;

    // 最新検査値をitemCodeでグルーピング（最新のもののみ保持）
    const labResultMap: Record<string, number> = {};
    const seenLabItems = new Set<string>();
    for (const lab of admission.labResults) {
      if (!seenLabItems.has(lab.itemCode)) {
        seenLabItems.add(lab.itemCode);
        labResultMap[lab.itemCode] = Number(lab.value);
      }
    }

    // リスク薬剤数の集計
    const riskDrugCount = admission.prescriptions.filter(
      (p) => p.medicineMaster?.riskFactorFlg === true,
    ).length;

    // MedicalHistory
    const mh = admission.medicalHistory;

    const features: MlInputFeatures = {
      admissionId: admission.id,
      age: admission.ageAtAdmission,
      gender: admission.patient.sex,
      height: admission.height != null ? Number(admission.height) : null,
      weight: admission.weight != null ? Number(admission.weight) : null,
      medicalHistory: mh
        ? {
            hasDementia: mh.hasDementia,
            hasOrganicBrainDamage: mh.hasOrganicBrainDamage,
            isHeavyAlcohol: mh.isHeavyAlcohol,
            hasDeliriumHistory: mh.hasDeliriumHistory,
            usesPsychotropicDrugs: mh.usesPsychotropicDrugs,
            hasGeneralAnesthesia: mh.hasGeneralAnesthesia,
            hasEmergencySurgery: mh.hasEmergencySurgery,
            hasScheduledSurgery: mh.hasScheduledSurgery,
            hasHeadNeckSurgery: mh.hasHeadNeckSurgery,
            hasChestSurgery: mh.hasChestSurgery,
            hasAbdominalSurgery: mh.hasAbdominalSurgery,
            hasAdmissionOxygenUse: mh.hasAdmissionOxygenUse,
            oxygenLevel: mh.oxygenLevel != null ? Number(mh.oxygenLevel) : null,
          }
        : null,
      vitalSigns: latestVital
        ? {
            bodyTemperature:
              latestVital.bodyTemperature != null ? Number(latestVital.bodyTemperature) : null,
            pulse: latestVital.pulse,
            systolicBp: latestVital.systolicBp,
            diastolicBp: latestVital.diastolicBp,
            spo2: latestVital.spo2 != null ? Number(latestVital.spo2) : null,
            respiratoryRate: latestVital.respiratoryRate,
          }
        : null,
      labResults: labResultMap,
      riskDrugCount,
      totalDrugCount: admission.prescriptions.length,
    };

    return features;
  });
}
