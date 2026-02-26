"use server";

import { authorizeServerAction } from "@/lib/auth";
import type { Result } from "@/shared/types";
import type { AdmissionDetailResponse } from "../types";
import { admissionDetailParamsSchema } from "../schemata";
import { getAdmissionDetail } from "../queries/getAdmissionDetail";

/**
 * 患者入院詳細を取得するServer Action
 *
 * 認証済みユーザーのみ実行可能。
 * 入院IDをバリデーションし、詳細情報を返す。
 */
export async function getAdmissionDetailAction(input: {
  id: number;
}): Promise<Result<AdmissionDetailResponse>> {
  // 認証チェック（全ロールがアクセス可能）
  const authResult = await authorizeServerAction();
  if (!authResult.success) {
    return authResult;
  }

  // バリデーション
  const parsed = admissionDetailParamsSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      value: { code: "INVALID_INPUT", cause: parsed.error.flatten() },
    };
  }

  // 詳細取得
  return getAdmissionDetail(parsed.data.id);
}
