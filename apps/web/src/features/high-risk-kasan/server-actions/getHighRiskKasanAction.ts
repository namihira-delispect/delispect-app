"use server";

import { authorizeServerAction } from "@/lib/auth";
import type { Result } from "@/shared/types";
import type { HighRiskKasanAssessmentDisplay } from "../types";
import { highRiskKasanParamsSchema } from "../schemata";
import { getHighRiskKasanAssessment } from "../queries/getHighRiskKasanAssessment";

/**
 * ハイリスクケア加算アセスメント情報を取得するServer Action
 *
 * 認証済みユーザーのみ実行可能。
 * 入院IDをバリデーションし、アセスメント情報を返す。
 */
export async function getHighRiskKasanAction(input: {
  admissionId: number;
}): Promise<Result<HighRiskKasanAssessmentDisplay>> {
  // 認証チェック（全ロールがアクセス可能）
  const authResult = await authorizeServerAction();
  if (!authResult.success) {
    return authResult;
  }

  // バリデーション
  const parsed = highRiskKasanParamsSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      value: { code: "INVALID_INPUT", cause: parsed.error.flatten() },
    };
  }

  // アセスメント情報取得
  return getHighRiskKasanAssessment(parsed.data.admissionId);
}
