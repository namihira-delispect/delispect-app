"use server";

import { authorizeServerAction } from "@/lib/auth";
import type { Result } from "@/shared/types";
import type { BatchRiskAssessmentResponse } from "../types";
import { batchRiskAssessmentSchema } from "../schemata";
import { executeRiskAssessmentAction } from "@/features/risk-assessment/server-actions";

/**
 * 一括リスク評価を実行するServer Action
 *
 * 医師・看護師長以上のロール（SYSTEM_ADMIN, SUPER_ADMIN）のみ実行可能。
 * 上限50件までの入院レコードに対してリスク評価を一括実行する。
 *
 * 実際のリスク評価ロジックはrisk-assessment機能に委譲する。
 */
export async function batchRiskAssessmentAction(input: {
  admissionIds: number[];
}): Promise<Result<BatchRiskAssessmentResponse>> {
  // 認証・認可チェック（SYSTEM_ADMIN, SUPER_ADMIN のみ）
  const authResult = await authorizeServerAction(["SYSTEM_ADMIN", "SUPER_ADMIN"]);
  if (!authResult.success) {
    return authResult;
  }

  // バリデーション
  const parsed = batchRiskAssessmentSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      value: { code: "INVALID_INPUT", cause: parsed.error.flatten() },
    };
  }

  const { admissionIds } = parsed.data;

  // risk-assessment機能に委譲
  const assessmentResult = await executeRiskAssessmentAction({ admissionIds });

  if (!assessmentResult.success) {
    return assessmentResult;
  }

  // レスポンス形式を変換（BatchRiskAssessmentResponse形式に合わせる）
  const results = assessmentResult.value.results.map((r) => ({
    admissionId: r.admissionId,
    success: r.success,
    ...(r.error ? { error: r.error } : {}),
  }));

  return {
    success: true,
    value: {
      successCount: assessmentResult.value.successCount,
      failureCount: assessmentResult.value.failureCount,
      results,
    },
  };
}
