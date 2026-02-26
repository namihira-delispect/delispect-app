"use server";

import { prisma } from "@delispect/db";
import type { Result } from "@/shared/types";
import type {
  AdmissionDetailResponse,
  VitalSignDisplay,
  LabResultDisplay,
  CareInfoDisplay,
  RiskAssessmentDisplay,
  CarePlanDisplay,
  PrescriptionDisplay,
} from "../types";
import { LAB_ITEM_NAMES } from "../types";

/**
 * せん妄ハイリスク判定（詳細画面用）
 */
function determineHighRisk(params: {
  isOver70: boolean;
  hasDementia: boolean | null;
  hasOrganicBrainDamage: boolean | null;
  isHeavyAlcohol: boolean | null;
  hasDeliriumHistory: boolean | null;
  hasRiskDrug: boolean;
}): boolean {
  return (
    params.isOver70 ||
    params.hasDementia === true ||
    params.hasOrganicBrainDamage === true ||
    params.isHeavyAlcohol === true ||
    params.hasDeliriumHistory === true ||
    params.hasRiskDrug
  );
}

/**
 * 最新バイタルサインを変換する
 */
function formatVitalSign(
  vitalSign: {
    bodyTemperature: { toNumber(): number } | null;
    pulse: number | null;
    systolicBp: number | null;
    diastolicBp: number | null;
    spo2: { toNumber(): number } | null;
    measuredAt: Date;
  } | null,
): VitalSignDisplay | null {
  if (!vitalSign) return null;
  return {
    bodyTemperature: vitalSign.bodyTemperature?.toNumber() ?? null,
    pulse: vitalSign.pulse,
    systolicBp: vitalSign.systolicBp,
    diastolicBp: vitalSign.diastolicBp,
    spo2: vitalSign.spo2?.toNumber() ?? null,
    measuredAt: vitalSign.measuredAt.toISOString(),
  };
}

/**
 * 採血結果を変換する（対象項目：CRP, WBC, HCT(Ht), HGB(Hb)）
 */
function formatLabResults(
  labResults: {
    itemCode: string;
    value: { toNumber(): number };
    measuredAt: Date;
  }[],
): LabResultDisplay[] {
  // 各項目コードごとに最新の結果を取得
  const latestByCode = new Map<string, (typeof labResults)[number]>();
  for (const result of labResults) {
    const existing = latestByCode.get(result.itemCode);
    if (!existing || result.measuredAt > existing.measuredAt) {
      latestByCode.set(result.itemCode, result);
    }
  }

  return Array.from(latestByCode.values()).map((result) => ({
    itemCode: result.itemCode,
    itemName: LAB_ITEM_NAMES[result.itemCode] ?? result.itemCode,
    value: result.value.toNumber(),
    measuredAt: result.measuredAt.toISOString(),
  }));
}

/**
 * 処方情報を変換する
 */
function formatPrescriptions(
  prescriptions: {
    drugName: string;
    prescriptionType: string;
    prescribedAt: Date;
    medicineMaster: { riskFactorFlg: boolean } | null;
  }[],
): PrescriptionDisplay[] {
  return prescriptions.map((p) => ({
    drugName: p.drugName,
    prescriptionType: p.prescriptionType,
    prescribedAt: p.prescribedAt.toISOString(),
    isRiskDrug: p.medicineMaster?.riskFactorFlg === true,
  }));
}

/**
 * ケア関連情報を構築する
 *
 * ケアプランアイテムのカテゴリーから痛み・便秘の状態を判定し、
 * 処方薬剤一覧とともに返す。
 */
function buildCareInfo(
  carePlan: {
    items: {
      category: string;
      status: string;
      updatedAt: Date;
    }[];
  } | null,
  prescriptions: PrescriptionDisplay[],
): CareInfoDisplay {
  let painStatus: string | null = null;
  let constipationStatus: string | null = null;
  let assessedAt: string | null = null;

  if (carePlan) {
    const painItem = carePlan.items.find((item) => item.category === "PAIN");
    if (painItem) {
      painStatus = painItem.status;
      assessedAt = painItem.updatedAt.toISOString();
    }

    const constipationItem = carePlan.items.find((item) => item.category === "CONSTIPATION");
    if (constipationItem) {
      constipationStatus = constipationItem.status;
      if (!assessedAt || constipationItem.updatedAt.toISOString() > assessedAt) {
        assessedAt = constipationItem.updatedAt.toISOString();
      }
    }
  }

  return {
    painStatus,
    constipationStatus,
    prescriptions,
    assessedAt,
  };
}

/**
 * リスク評価情報を変換する
 */
function formatRiskAssessments(
  riskAssessments: {
    riskLevel: string;
    riskFactors: unknown;
    mlInputSnapshot: unknown;
    createdAt: Date;
    assessedBy: {
      username: string;
    };
  }[],
): RiskAssessmentDisplay[] {
  return riskAssessments.map((ra) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const snapshot = ra.mlInputSnapshot as any;
    const riskScore = snapshot?.riskScore ?? null;
    return {
      riskLevel: ra.riskLevel,
      riskFactors: (ra.riskFactors ?? {}) as Record<string, unknown>,
      riskScore: typeof riskScore === "number" ? riskScore : null,
      assessedAt: ra.createdAt.toISOString(),
      assessedBy: ra.assessedBy.username,
    };
  });
}

/**
 * ケアプラン情報を変換する
 */
function formatCarePlan(
  carePlan: {
    id: number;
    items: {
      category: string;
      status: string;
      instructions: string | null;
    }[];
    createdAt: Date;
    updatedAt: Date;
    createdBy: {
      username: string;
    };
  } | null,
): CarePlanDisplay | null {
  if (!carePlan) return null;

  return {
    id: carePlan.id,
    items: carePlan.items.map((item) => ({
      category: item.category,
      status: item.status,
      instructions: item.instructions,
    })),
    createdAt: carePlan.createdAt.toISOString(),
    updatedAt: carePlan.updatedAt.toISOString(),
    createdBy: carePlan.createdBy.username,
  };
}

/**
 * 患者入院詳細を取得する
 *
 * 入院IDに基づき、基本情報・バイタル・採血結果・ケア関連情報・
 * リスク評価情報・ケアプラン情報を含む詳細情報を返す。
 * バージョン情報は楽観的ロックのために含む。
 */
export async function getAdmissionDetail(
  admissionId: number,
): Promise<Result<AdmissionDetailResponse>> {
  try {
    const admission = await prisma.admission.findUnique({
      where: { id: admissionId },
      include: {
        patient: true,
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
            medicineMaster: true,
          },
          orderBy: { prescribedAt: "desc" },
        },
        riskAssessments: {
          where: { isActive: true },
          orderBy: { createdAt: "desc" },
          include: {
            assessedBy: {
              select: { username: true },
            },
          },
        },
        carePlan: {
          include: {
            items: true,
            createdBy: {
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

    const patient = admission.patient;
    const isOver70 = admission.ageAtAdmission != null && admission.ageAtAdmission >= 70;
    const hasRiskDrug = admission.prescriptions.some(
      (p) => p.medicineMaster?.riskFactorFlg === true,
    );

    const prescriptionDisplays = formatPrescriptions(admission.prescriptions);
    const latestVitalSign = formatVitalSign(admission.vitalSigns[0] ?? null);
    const labResults = formatLabResults(admission.labResults);
    const careInfo = buildCareInfo(admission.carePlan, prescriptionDisplays);
    const riskAssessments = formatRiskAssessments(admission.riskAssessments);
    const carePlan = formatCarePlan(admission.carePlan);

    // 主治医: 最新リスク評価の評価者を使用
    const attendingDoctor =
      admission.riskAssessments.length > 0
        ? admission.riskAssessments[0].assessedBy.username
        : null;

    const isHighRisk = determineHighRisk({
      isOver70,
      hasDementia: admission.medicalHistory?.hasDementia ?? null,
      hasOrganicBrainDamage: admission.medicalHistory?.hasOrganicBrainDamage ?? null,
      isHeavyAlcohol: admission.medicalHistory?.isHeavyAlcohol ?? null,
      hasDeliriumHistory: admission.medicalHistory?.hasDeliriumHistory ?? null,
      hasRiskDrug,
    });

    const response: AdmissionDetailResponse = {
      admissionId: admission.id,
      version: admission.version,
      patientId: patient.patientId,
      patientInternalId: patient.id,
      patientName: `${patient.lastName} ${patient.firstName}`,
      patientNameKana:
        patient.lastNameKana && patient.firstNameKana
          ? `${patient.lastNameKana} ${patient.firstNameKana}`
          : null,
      age: admission.ageAtAdmission,
      gender: patient.sex,
      admissionDate: admission.admissionDate.toISOString().split("T")[0],
      dischargeDate: admission.dischargeDate
        ? admission.dischargeDate.toISOString().split("T")[0]
        : null,
      ward: admission.ward,
      room: admission.room,
      attendingDoctor,
      latestVitalSign,
      labResults,
      careInfo,
      riskAssessments,
      carePlan,
      isHighRisk,
    };

    return {
      success: true,
      value: response,
    };
  } catch (error) {
    console.error("[Admission] 入院詳細の取得に失敗しました", {
      admissionId,
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      success: false,
      value: {
        code: "ADMISSION_DETAIL_ERROR",
        cause: "入院詳細の取得に失敗しました",
      },
    };
  }
}

/**
 * 楽観的ロック：バージョンチェック
 *
 * 更新時に現在のバージョンが期待値と一致するか検証する。
 * 一致しない場合は競合エラーを返す。
 */
export async function checkAdmissionVersion(
  admissionId: number,
  expectedVersion: number,
): Promise<Result<{ currentVersion: number }>> {
  try {
    const admission = await prisma.admission.findUnique({
      where: { id: admissionId },
      select: { version: true },
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

    if (admission.version !== expectedVersion) {
      return {
        success: false,
        value: {
          code: "VERSION_CONFLICT",
          cause:
            "データが他のユーザーによって更新されています。最新データを再取得してください。",
        },
      };
    }

    return {
      success: true,
      value: { currentVersion: admission.version },
    };
  } catch (error) {
    console.error("[Admission] バージョンチェックに失敗しました", {
      admissionId,
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      success: false,
      value: {
        code: "VERSION_CHECK_ERROR",
        cause: "バージョンチェックに失敗しました",
      },
    };
  }
}
