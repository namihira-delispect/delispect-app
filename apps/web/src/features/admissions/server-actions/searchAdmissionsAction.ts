"use server";

import { authorizeServerAction } from "@/lib/auth";
import type { Result } from "@/shared/types";
import type { AdmissionListResponse, AdmissionSearchParams } from "../types";
import { admissionSearchSchema } from "../schemata";
import { getAdmissionList } from "../queries/getAdmissionList";

/**
 * 患者入院一覧を検索するServer Action
 *
 * 認証済みユーザーのみ実行可能。
 * 入力をバリデーションし、検索結果を返す。
 */
export async function searchAdmissionsAction(
  input: AdmissionSearchParams,
): Promise<Result<AdmissionListResponse>> {
  // 認証チェック（全ロールがアクセス可能）
  const authResult = await authorizeServerAction();
  if (!authResult.success) {
    return authResult;
  }

  // バリデーション
  const parsed = admissionSearchSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      value: { code: "INVALID_INPUT", cause: parsed.error.flatten() },
    };
  }

  // 検索実行
  return getAdmissionList(parsed.data);
}
