"use server";

import { authorizeServerAction } from "@/lib/auth";
import type { Result } from "@/shared/types";
import type { AuditLogListResponse, AuditLogSearchParams } from "../types";
import { auditLogSearchSchema } from "../schemata";
import { getAuditLogs } from "../queries/getAuditLogs";

/**
 * 監査ログを検索するServer Action
 *
 * システム管理者・全権管理者のみ実行可能。
 * 入力をバリデーションし、検索結果を返す。
 */
export async function searchAuditLogsAction(
  input: AuditLogSearchParams,
): Promise<Result<AuditLogListResponse>> {
  // 認証・認可チェック（SYSTEM_ADMIN または SUPER_ADMIN のみ）
  const authResult = await authorizeServerAction([
    "SYSTEM_ADMIN",
    "SUPER_ADMIN",
  ]);
  if (!authResult.success) {
    return authResult;
  }

  // バリデーション
  const parsed = auditLogSearchSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      value: { code: "INVALID_INPUT", cause: parsed.error.flatten() },
    };
  }

  // 検索実行
  return getAuditLogs(parsed.data);
}
