import { NextResponse, type NextRequest } from "next/server";
import { authorizeServerAction } from "@/lib/auth";
import { auditLogSearchSchema } from "@/features/audit-logs/schemata";
import { getAuditLogs } from "@/features/audit-logs/queries/getAuditLogs";

/**
 * 監査ログ検索API
 *
 * GET /api/audit-logs?startDate=...&endDate=...&username=...
 *
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
    page: searchParams.get("page") ?? undefined,
    pageSize: searchParams.get("pageSize") ?? undefined,
  };

  // バリデーション
  const parsed = auditLogSearchSchema.safeParse(input);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "入力が不正です", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  // 検索実行
  const result = await getAuditLogs(parsed.data);
  if (!result.success) {
    return NextResponse.json(
      { error: result.value.cause },
      { status: 500 },
    );
  }

  return NextResponse.json(result.value);
}
