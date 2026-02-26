import { NextResponse, type NextRequest } from "next/server";
import { authorizeServerAction } from "@/lib/auth";
import { auditLogSearchSchema } from "@/features/audit-logs/schemata";
import { getAuditLogs } from "@/features/audit-logs/queries/getAuditLogs";
import { maskDataFields } from "@/features/audit-logs/maskingUtils";
import {
  ACTION_LABELS,
  TARGET_TYPE_LABELS,
} from "@/features/audit-logs/types";

/**
 * 監査ログCSVエクスポートAPI
 *
 * GET /api/audit-logs/export?startDate=...&endDate=...
 *
 * マスキング状態でCSVファイルをダウンロードする。
 * システム管理者・全権管理者のみアクセス可能。
 */
export async function GET(request: NextRequest) {
  // 認証・認可チェック
  const authResult = await authorizeServerAction([
    "SYSTEM_ADMIN",
    "SUPER_ADMIN",
  ]);
  if (!authResult.success) {
    return NextResponse.json(
      { error: authResult.value.cause },
      { status: authResult.value.code === "UNAUTHORIZED" ? 401 : 403 },
    );
  }

  // クエリパラメータの取得
  const { searchParams } = request.nextUrl;
  const input = {
    startDate: searchParams.get("startDate") ?? undefined,
    endDate: searchParams.get("endDate") ?? undefined,
    username: searchParams.get("username") ?? undefined,
    actions: searchParams.get("actions")
      ? searchParams.get("actions")!.split(",")
      : undefined,
    patientId: searchParams.get("patientId") ?? undefined,
    ipAddress: searchParams.get("ipAddress") ?? undefined,
    keyword: searchParams.get("keyword") ?? undefined,
    sortColumn: searchParams.get("sortColumn") ?? undefined,
    sortDirection: searchParams.get("sortDirection") ?? undefined,
    page: 1,
    pageSize: 10000, // エクスポート時は最大件数
  };

  // バリデーション
  const parsed = auditLogSearchSchema.safeParse(input);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "入力が不正です", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  // データ取得
  const result = await getAuditLogs(parsed.data);
  if (!result.success) {
    return NextResponse.json(
      { error: result.value.cause },
      { status: 500 },
    );
  }

  const { logs } = result.value;

  // CSV生成
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
  const filename = `audit_logs_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
