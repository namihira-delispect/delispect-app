"use server";

import { prisma } from "@delispect/db";
import { authorizeServerAction } from "@/lib/auth";
import { extractFeatures, predictRisk } from "@/lib/risk-assessment";
import type { Result } from "@/shared/types";
import type {
  ExecuteRiskAssessmentResponse,
  RiskAssessmentResultEntry,
  MlRiskLevel,
} from "../types";
import { executeRiskAssessmentSchema } from "../schemata";

/** Prisma RiskLevel enumへの変換マッピング */
const ML_TO_PRISMA_RISK_LEVEL: Record<MlRiskLevel, "HIGH" | "MEDIUM" | "LOW"> = {
  HIGH: "HIGH",
  LOW: "LOW",
  INDETERMINATE: "MEDIUM",
};

/**
 * せん妄リスク評価を実行するServer Action
 *
 * 認証済みユーザー（SYSTEM_ADMIN, SUPER_ADMIN）のみ実行可能。
 * 入院IDリストに対してML API（Mock）を呼び出し、評価結果をDBに保存する。
 * 既存の評価レコードがある場合は、既存をis_active=falseにして新規レコードを作成する。
 *
 * @param input - 入院IDリスト
 * @returns 評価結果の一覧
 */
export async function executeRiskAssessmentAction(input: {
  admissionIds: number[];
}): Promise<Result<ExecuteRiskAssessmentResponse>> {
  // 認証・認可チェック
  const authResult = await authorizeServerAction(["SYSTEM_ADMIN", "SUPER_ADMIN"]);
  if (!authResult.success) {
    return authResult;
  }

  // バリデーション
  const parsed = executeRiskAssessmentSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      value: { code: "INVALID_INPUT", cause: parsed.error.flatten() },
    };
  }

  const { admissionIds } = parsed.data;
  const userId = authResult.value.id;

  try {
    // 1. 入院IDの存在チェック
    const existingAdmissions = await prisma.admission.findMany({
      where: { id: { in: admissionIds } },
      select: { id: true },
    });
    const existingIds = new Set(existingAdmissions.map((a) => a.id));

    // 存在しない入院IDを検出
    const notFoundIds = admissionIds.filter((id) => !existingIds.has(id));

    // 存在する入院IDのみを処理対象にする
    const validIds = admissionIds.filter((id) => existingIds.has(id));

    if (validIds.length === 0) {
      return {
        success: true,
        value: {
          successCount: 0,
          failureCount: notFoundIds.length,
          indeterminateCount: 0,
          results: notFoundIds.map((id) => ({
            admissionId: id,
            success: false,
            error: "指定された入院情報が見つかりません",
          })),
        },
      };
    }

    // 2. 特徴量抽出
    const features = await extractFeatures(validIds);

    // 3. ML API呼び出し（Mock）
    const mlResponse = await predictRisk(features);

    // 4. 結果をDBに保存
    const results: RiskAssessmentResultEntry[] = [];

    for (const mlResult of mlResponse.results) {
      try {
        const prismaRiskLevel = ML_TO_PRISMA_RISK_LEVEL[mlResult.riskLevel];

        // トランザクションで既存レコードを非アクティブ化し、新規レコードを作成
        await prisma.$transaction(async (tx) => {
          // 既存のアクティブなレコードを非アクティブ化
          await tx.riskAssessment.updateMany({
            where: {
              admissionId: mlResult.admissionId,
              isActive: true,
            },
            data: { isActive: false },
          });

          // 新規レコードを作成
          await tx.riskAssessment.create({
            data: {
              admissionId: mlResult.admissionId,
              assessedById: userId,
              riskLevel: prismaRiskLevel,
              riskFactors: mlResult.riskFactors as unknown as Record<string, never>,
              mlInputSnapshot: JSON.parse(JSON.stringify(mlResult.mlInputSnapshot)),
              isActive: true,
            },
          });
        });

        results.push({
          admissionId: mlResult.admissionId,
          success: true,
          riskLevel: mlResult.riskLevel,
          ...(mlResult.missingFields && mlResult.missingFields.length > 0
            ? { missingFields: mlResult.missingFields }
            : {}),
        });
      } catch (error) {
        console.error("[RiskAssessment] 個別評価結果の保存に失敗しました", {
          admissionId: mlResult.admissionId,
          error: error instanceof Error ? error.message : String(error),
        });
        results.push({
          admissionId: mlResult.admissionId,
          success: false,
          error: "評価結果の保存に失敗しました",
        });
      }
    }

    // 存在しなかった入院IDの結果を追加
    for (const id of notFoundIds) {
      results.push({
        admissionId: id,
        success: false,
        error: "指定された入院情報が見つかりません",
      });
    }

    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;
    const indeterminateCount = results.filter(
      (r) => r.success && r.riskLevel === "INDETERMINATE",
    ).length;

    return {
      success: true,
      value: {
        successCount,
        failureCount,
        indeterminateCount,
        results,
      },
    };
  } catch (error) {
    console.error("[RiskAssessment] リスク評価の実行に失敗しました", {
      admissionIds,
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      success: false,
      value: {
        code: "RISK_ASSESSMENT_ERROR",
        cause: "リスク評価の実行に失敗しました",
      },
    };
  }
}
