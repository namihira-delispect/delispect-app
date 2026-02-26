"use server";

import { authorizeServerAction } from "@/lib/auth";
import type { Result } from "@/shared/types";
import type { BatchRiskAssessmentResponse } from "../types";
import { batchRiskAssessmentSchema } from "../schemata";

/**
 * 一括リスク評価を実行するServer Action
 *
 * 医師・看護師長以上のロール（SYSTEM_ADMIN, SUPER_ADMIN）のみ実行可能。
 * 上限50件までの入院レコードに対してリスク評価を一括実行する。
 *
 * 現在の実装はモック（ML APIとの統合は後続チケットで実装）
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

  // モック実装: ML APIとの連携は後続で実装
  // 現在は全件成功として返す
  const results = admissionIds.map((admissionId) => ({
    admissionId,
    success: true,
  }));

  return {
    success: true,
    value: {
      successCount: results.length,
      failureCount: 0,
      results,
    },
  };
}
