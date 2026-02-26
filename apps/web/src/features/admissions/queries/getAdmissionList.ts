"use server";

import { prisma } from "@delispect/db";
import type { Result } from "@/shared/types";
import type {
  AdmissionListResponse,
  AdmissionSearchParams,
  AdmissionListEntry,
  RiskLevelDisplay,
  CareStatusDisplay,
} from "../types";

/**
 * せん妄ハイリスク判定
 *
 * 以下のいずれかに該当する場合にハイリスクとする:
 * - 70歳以上
 * - 認知症
 * - 脳器質的障害
 * - アルコール多飲
 * - せん妄既往
 * - リスク薬剤使用
 */
function determineHighRisk(entry: {
  isOver70: boolean;
  hasDementia: boolean | null;
  hasOrganicBrainDamage: boolean | null;
  isHeavyAlcohol: boolean | null;
  hasDeliriumHistory: boolean | null;
  hasRiskDrug: boolean;
}): boolean {
  return (
    entry.isOver70 ||
    entry.hasDementia === true ||
    entry.hasOrganicBrainDamage === true ||
    entry.isHeavyAlcohol === true ||
    entry.hasDeliriumHistory === true ||
    entry.hasRiskDrug
  );
}

/**
 * ケアプランの実施状況を判定する
 */
function determineCareStatus(
  carePlan: {
    items: { status: string }[];
  } | null,
): CareStatusDisplay {
  if (!carePlan || carePlan.items.length === 0) {
    return "NOT_STARTED";
  }

  const allCompleted = carePlan.items.every(
    (item) => item.status === "COMPLETED" || item.status === "NOT_APPLICABLE",
  );
  if (allCompleted) {
    return "COMPLETED";
  }

  const hasAnyProgress = carePlan.items.some(
    (item) => item.status === "IN_PROGRESS" || item.status === "COMPLETED",
  );
  if (hasAnyProgress) {
    return "IN_PROGRESS";
  }

  return "NOT_STARTED";
}

/**
 * 入院レコードの最新リスク評価レベルを取得する
 */
function determineRiskLevel(
  riskAssessments: { riskLevel: string; isActive: boolean }[],
): RiskLevelDisplay {
  const activeAssessment = riskAssessments.find((ra) => ra.isActive);
  if (!activeAssessment) {
    return "NOT_ASSESSED";
  }
  // RiskLevel enum: HIGH, MEDIUM, LOW -> HIGH, LOW で表示
  if (activeAssessment.riskLevel === "HIGH" || activeAssessment.riskLevel === "MEDIUM") {
    return "HIGH";
  }
  return "LOW";
}

/**
 * リスク薬剤の有無を判定する
 *
 * 処方のうち、MedicineMasterでriskFactorFlgがtrueの薬剤があるかどうか
 */
function hasRiskDrugFromPrescriptions(
  prescriptions: {
    medicineMaster: { riskFactorFlg: boolean } | null;
  }[],
): boolean {
  return prescriptions.some((p) => p.medicineMaster?.riskFactorFlg === true);
}

/**
 * 患者入院一覧を検索・取得する
 *
 * 検索条件に基づいてフィルタリング・ソート・ページネーションされた
 * 入院一覧を返す。入院日の最新レコードのみ表示する。
 */
export async function getAdmissionList(
  params: AdmissionSearchParams,
): Promise<Result<AdmissionListResponse>> {
  try {
    const {
      riskLevel,
      careStatus,
      admissionDateFrom,
      admissionDateTo,
      assessmentDateFrom,
      assessmentDateTo,
      name,
      sortColumn = "admissionDate",
      sortDirection = "desc",
      page = 1,
      pageSize = 20,
    } = params;

    // デフォルトの入院日フィルター: 操作日の2日前〜操作日
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const effectiveAdmissionDateFrom = admissionDateFrom ? new Date(admissionDateFrom) : twoDaysAgo;
    const effectiveAdmissionDateTo = admissionDateTo ? new Date(admissionDateTo) : today;

    // WHERE条件の構築
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const conditions: any[] = [];

    // 入院日フィルター
    conditions.push({
      admissionDate: {
        gte: effectiveAdmissionDateFrom,
        lte: effectiveAdmissionDateTo,
      },
    });

    // 名前検索（部分一致）
    if (name) {
      conditions.push({
        patient: {
          OR: [
            { lastName: { contains: name, mode: "insensitive" } },
            { firstName: { contains: name, mode: "insensitive" } },
            { lastNameKana: { contains: name, mode: "insensitive" } },
            { firstNameKana: { contains: name, mode: "insensitive" } },
          ],
        },
      });
    }

    // 評価日フィルター
    if (assessmentDateFrom || assessmentDateTo) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const dateFilter: any = {};
      if (assessmentDateFrom) dateFilter.gte = new Date(assessmentDateFrom);
      if (assessmentDateTo) dateFilter.lte = new Date(assessmentDateTo);
      conditions.push({
        riskAssessments: {
          some: {
            createdAt: dateFilter,
            isActive: true,
          },
        },
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (conditions.length > 0) {
      where.AND = conditions;
    }

    // 全レコード取得（フィルタリング前）
    // 入院日の最新レコードのみ表示するため、サブクエリ相当の処理を行う
    // Prismaでは直接的なサブクエリが難しいため、distinct + orderByで対応
    const allAdmissions = await prisma.admission.findMany({
      where,
      orderBy: [{ patientId: "asc" }, { admissionDate: "desc" }],
      include: {
        patient: true,
        medicalHistory: true,
        riskAssessments: {
          where: { isActive: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        prescriptions: {
          include: {
            medicineMaster: true,
          },
        },
        carePlan: {
          include: {
            items: {
              select: { status: true },
            },
          },
        },
      },
    });

    // 各患者の最新入院日レコードのみ抽出
    const latestAdmissionMap = new Map<number, (typeof allAdmissions)[number]>();
    for (const admission of allAdmissions) {
      const existing = latestAdmissionMap.get(admission.patientId);
      if (!existing || admission.admissionDate > existing.admissionDate) {
        latestAdmissionMap.set(admission.patientId, admission);
      }
    }

    // エントリーの変換
    let entries: AdmissionListEntry[] = Array.from(latestAdmissionMap.values()).map((admission) => {
      const patient = admission.patient;
      const medicalHistory = admission.medicalHistory;
      const isOver70 = admission.ageAtAdmission != null && admission.ageAtAdmission >= 70;
      const hasRiskDrug = hasRiskDrugFromPrescriptions(admission.prescriptions);
      const aiRiskLevel = determineRiskLevel(admission.riskAssessments);
      const carePlanStatus = determineCareStatus(admission.carePlan);
      const latestAssessment = admission.riskAssessments[0];

      return {
        admissionId: admission.id,
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
        isOver70,
        hasRiskDrug,
        hasDementia: medicalHistory?.hasDementia ?? null,
        hasOrganicBrainDamage: medicalHistory?.hasOrganicBrainDamage ?? null,
        isHeavyAlcohol: medicalHistory?.isHeavyAlcohol ?? null,
        hasDeliriumHistory: medicalHistory?.hasDeliriumHistory ?? null,
        hasGeneralAnesthesia: medicalHistory?.hasGeneralAnesthesia ?? null,
        isHighRisk: determineHighRisk({
          isOver70,
          hasDementia: medicalHistory?.hasDementia ?? null,
          hasOrganicBrainDamage: medicalHistory?.hasOrganicBrainDamage ?? null,
          isHeavyAlcohol: medicalHistory?.isHeavyAlcohol ?? null,
          hasDeliriumHistory: medicalHistory?.hasDeliriumHistory ?? null,
          hasRiskDrug,
        }),
        aiRiskLevel,
        careStatus: carePlanStatus,
        carePlanId: admission.carePlan?.id ?? null,
        latestAssessmentDate: latestAssessment
          ? latestAssessment.createdAt.toISOString().split("T")[0]
          : null,
      };
    });

    // リスク評価フィルター（取得後フィルタリング）
    if (riskLevel) {
      entries = entries.filter((e) => e.aiRiskLevel === riskLevel);
    }

    // ケア実施状況フィルター（取得後フィルタリング）
    if (careStatus) {
      entries = entries.filter((e) => e.careStatus === careStatus);
    }

    // ソート
    entries.sort((a, b) => {
      let comparison = 0;
      switch (sortColumn) {
        case "patientName":
          comparison = a.patientName.localeCompare(b.patientName, "ja");
          break;
        case "patientId":
          comparison = a.patientId.localeCompare(b.patientId);
          break;
        case "age":
          comparison = (a.age ?? 0) - (b.age ?? 0);
          break;
        case "admissionDate":
        default:
          comparison = a.admissionDate.localeCompare(b.admissionDate);
          break;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

    // ページネーション
    const totalCount = entries.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const paginatedEntries = entries.slice((page - 1) * pageSize, page * pageSize);

    return {
      success: true,
      value: {
        admissions: paginatedEntries,
        totalCount,
        page,
        pageSize,
        totalPages,
      },
    };
  } catch (error) {
    console.error("[Admission] 入院一覧の取得に失敗しました", {
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      success: false,
      value: {
        code: "ADMISSION_LIST_ERROR",
        cause: "入院一覧の取得に失敗しました",
      },
    };
  }
}
