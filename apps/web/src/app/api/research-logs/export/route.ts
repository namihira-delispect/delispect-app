import { NextRequest, NextResponse } from "next/server";
import { authorizeServerAction } from "@/lib/auth/authorization";
import { exportResearchLogsCsv } from "@/lib/research-log";
import type { ResearchLogAction } from "@/lib/research-log";
import { logAudit, AUDIT_ACTIONS, AUDIT_TARGET_TYPES } from "@/lib/audit";
import { csvExportSchema } from "@/features/research-logs/schemata";

/**
 * GET /api/research-logs/export
 *
 * 解析用操作ログをCSV形式でエクスポートする。
 * 管理者権限が必要。エクスポート操作自体を監査ログに記録する。
 */
export async function GET(request: NextRequest) {
  try {
    // 認証・認可チェック
    const authResult = await authorizeServerAction(["SYSTEM_ADMIN", "SUPER_ADMIN"]);
    if (!authResult.success) {
      const status = authResult.value.code === "UNAUTHORIZED" ? 401 : 403;
      return NextResponse.json(
        { success: false, value: authResult.value },
        { status },
      );
    }

    // クエリパラメータの取得・バリデーション
    const searchParams = request.nextUrl.searchParams;
    const params = {
      startDate: searchParams.get("startDate") ?? "",
      endDate: searchParams.get("endDate") ?? "",
      actionType: searchParams.get("actionType") ?? undefined,
    };

    const parsed = csvExportSchema.safeParse(params);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          value: {
            code: "INVALID_INPUT",
            cause: parsed.error.flatten().fieldErrors,
          },
        },
        { status: 400 },
      );
    }

    const startDate = new Date(parsed.data.startDate + "T00:00:00.000Z");
    const endDate = new Date(parsed.data.endDate + "T23:59:59.999Z");

    if (startDate > endDate) {
      return NextResponse.json(
        {
          success: false,
          value: { code: "INVALID_INPUT", cause: "開始日は終了日以前である必要があります" },
        },
        { status: 400 },
      );
    }

    // CSVエクスポート実行
    const csv = await exportResearchLogsCsv({
      startDate,
      endDate,
      actionType: parsed.data.actionType as ResearchLogAction | undefined,
    });

    // エクスポート操作を監査ログに記録
    await logAudit({
      actorId: authResult.value.id,
      action: AUDIT_ACTIONS.VIEW,
      targetType: AUDIT_TARGET_TYPES.IMPORT,
      targetId: "research-log-export",
      afterData: {
        startDate: parsed.data.startDate,
        endDate: parsed.data.endDate,
        actionType: parsed.data.actionType ?? "ALL",
      },
    });

    // CSVレスポンスの返却
    const filename = `research-logs_${parsed.data.startDate}_${parsed.data.endDate}.csv`;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        value: { code: "INTERNAL_ERROR", cause: "エクスポートに失敗しました" },
      },
      { status: 500 },
    );
  }
}
