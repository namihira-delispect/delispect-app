"use server";

import { authorizeServerAction } from "@/lib/auth";
import type { Result } from "@/shared/types";
import type { AuditLogSearchParams } from "../types";
import { auditLogSearchSchema } from "../schemata";
import { getAuditLogs } from "../queries/getAuditLogs";
import { maskDataFields } from "../maskingUtils";
import { ACTION_LABELS, TARGET_TYPE_LABELS } from "../types";

/** CSVエクスポート結果 */
export interface ExportResult {
  csv: string;
  filename: string;
  totalCount: number;
}

/**
 * 監査ログをCSVエクスポートするServer Action
 *
 * マスキング状態での出力。個人情報はマスキングされる。
 * システム管理者・全権管理者のみ実行可能。
 */
export async function exportAuditLogsAction(
  input: AuditLogSearchParams,
): Promise<Result<ExportResult>> {
  // 認証・認可チェック
  const authResult = await authorizeServerAction([
    "SYSTEM_ADMIN",
    "SUPER_ADMIN",
  ]);
  if (!authResult.success) {
    return authResult;
  }

  // バリデーション
  const parsed = auditLogSearchSchema.safeParse({
    ...input,
    page: 1,
    pageSize: 10000, // エクスポート時は最大件数
  });
  if (!parsed.success) {
    return {
      success: false,
      value: { code: "INVALID_INPUT", cause: parsed.error.flatten() },
    };
  }

  // データ取得
  const result = await getAuditLogs(parsed.data);
  if (!result.success) {
    return result;
  }

  const { logs, totalCount } = result.value;

  // CSV生成（マスキング状態で出力）
  const headers = [
    "日時",
    "ユーザー名",
    "操作種別",
    "対象種別",
    "対象ID",
    "IPアドレス",
    "変更前データ",
    "変更後データ",
  ];

  const rows = logs.map((log) => [
    log.occurredAt,
    log.maskedActorUsername,
    ACTION_LABELS[log.action] ?? log.action,
    TARGET_TYPE_LABELS[log.targetType] ?? log.targetType,
    log.targetId,
    log.ipAddress ?? "",
    log.beforeData ? JSON.stringify(maskDataFields(log.beforeData)) : "",
    log.afterData ? JSON.stringify(maskDataFields(log.afterData)) : "",
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
    ),
  ].join("\n");

  // BOMを追加（Excel互換）
  const bom = "\uFEFF";
  const csv = bom + csvContent;

  const now = new Date();
  const filename = `audit_logs_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}_${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}.csv`;

  return {
    success: true,
    value: {
      csv,
      filename,
      totalCount,
    },
  };
}
