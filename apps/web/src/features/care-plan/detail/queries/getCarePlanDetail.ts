"use server";

import { prisma } from "@delispect/db";
import type { Result } from "@/shared/types";
import type { CarePlanDetailResponse, CarePlanItemDetail } from "../types";
import type { CarePlanCategoryType, CarePlanItemStatusType } from "../../types";

/**
 * ケアプラン詳細情報を取得する
 *
 * 入院IDに基づき、ケアプランとその全アイテム詳細、
 * 患者情報を含む詳細レスポンスを返す。
 */
export async function getCarePlanDetail(
  admissionId: number,
): Promise<Result<CarePlanDetailResponse | null>> {
  try {
    const carePlan = await prisma.carePlan.findUnique({
      where: { admissionId },
      include: {
        items: {
          orderBy: { id: "asc" },
        },
        createdBy: {
          select: { id: true, username: true },
        },
        admission: {
          include: {
            patient: {
              select: {
                patientId: true,
                lastName: true,
                firstName: true,
              },
            },
          },
        },
      },
    });

    if (!carePlan) {
      return {
        success: true,
        value: null,
      };
    }

    const items: CarePlanItemDetail[] = carePlan.items.map((item) => ({
      id: item.id,
      category: item.category as CarePlanCategoryType,
      status: item.status as CarePlanItemStatusType,
      details: item.details as Record<string, unknown> | null,
      instructions: item.instructions,
      currentQuestionId: item.currentQuestionId,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    }));

    const response: CarePlanDetailResponse = {
      carePlanId: carePlan.id,
      admissionId: carePlan.admissionId,
      createdBy: carePlan.createdBy.username,
      createdById: carePlan.createdBy.id,
      createdAt: carePlan.createdAt.toISOString(),
      updatedAt: carePlan.updatedAt.toISOString(),
      items,
      patientName: `${carePlan.admission.patient.lastName} ${carePlan.admission.patient.firstName}`,
      patientId: carePlan.admission.patient.patientId,
      admissionDate: carePlan.admission.admissionDate.toISOString(),
      ward: carePlan.admission.ward,
      room: carePlan.admission.room,
    };

    return {
      success: true,
      value: response,
    };
  } catch (error) {
    console.error("[CarePlanDetail] ケアプラン詳細の取得に失敗しました", {
      admissionId,
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      success: false,
      value: {
        code: "CARE_PLAN_DETAIL_FETCH_ERROR",
        cause: "ケアプラン詳細の取得に失敗しました",
      },
    };
  }
}
