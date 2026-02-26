/**
 * 最新のリスク評価を取得するクエリ
 *
 * 指定した入院IDに対するアクティブなリスク評価の最新レコードを返す。
 */

import { prisma } from "@delispect/db";
import type { Result } from "@/shared/types";
import type { RiskAssessmentDisplay } from "@/features/admissions/types";

/**
 * 入院IDに紐づく最新のリスク評価を取得する
 *
 * @param admissionId - 入院ID
 * @returns 最新のリスク評価情報（存在しない場合はnull）
 */
export async function getLatestRiskAssessment(
  admissionId: number,
): Promise<Result<RiskAssessmentDisplay | null>> {
  try {
    const assessment = await prisma.riskAssessment.findFirst({
      where: {
        admissionId,
        isActive: true,
      },
      orderBy: { createdAt: "desc" },
      include: {
        assessedBy: {
          select: { username: true },
        },
      },
    });

    if (!assessment) {
      return { success: true, value: null };
    }

    const mlSnapshot = assessment.mlInputSnapshot as Record<string, unknown>;
    const riskScore = typeof mlSnapshot?.riskScore === "number" ? mlSnapshot.riskScore : null;

    return {
      success: true,
      value: {
        riskLevel: assessment.riskLevel,
        riskFactors: assessment.riskFactors as Record<string, unknown>,
        riskScore,
        assessedAt: assessment.createdAt.toISOString(),
        assessedBy: assessment.assessedBy.username,
      },
    };
  } catch (error) {
    console.error("[RiskAssessment] 最新リスク評価の取得に失敗しました", {
      admissionId,
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      success: false,
      value: {
        code: "RISK_ASSESSMENT_FETCH_ERROR",
        cause: "リスク評価の取得に失敗しました",
      },
    };
  }
}
