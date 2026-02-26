import { NextRequest, NextResponse } from "next/server";
import { authorizeServerAction } from "@/lib/auth";
import { executeManualImport } from "@/features/emr-sync/server-actions/executeEmrSync";
import { manualImportSchema } from "@/features/emr-sync/schemata";
import { checkImportLock } from "@/features/emr-sync/repositories/importLock";

/**
 * GET /api/emr-sync - インポートロックの状態取得
 *
 * 現在インポート処理中かどうかを確認する。
 * システム管理者・全権管理者のみアクセス可能。
 */
export async function GET() {
  try {
    const authResult = await authorizeServerAction([
      "SYSTEM_ADMIN",
      "SUPER_ADMIN",
    ]);
    if (!authResult.success) {
      const status = authResult.value.code === "UNAUTHORIZED" ? 401 : 403;
      return NextResponse.json(
        { success: false, value: authResult.value },
        { status },
      );
    }

    const lockResult = await checkImportLock();
    if (!lockResult.success) {
      return NextResponse.json(
        { success: false, value: lockResult.value },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      value: {
        isLocked: lockResult.value !== null,
        lock: lockResult.value,
      },
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        value: { code: "INTERNAL_ERROR", cause: "内部エラーが発生しました" },
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/emr-sync - 手動インポートの実行
 *
 * リクエストボディ: { startDate: "YYYY-MM-DD", endDate: "YYYY-MM-DD" }
 *
 * システム管理者・全権管理者のみ実行可能。
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await authorizeServerAction([
      "SYSTEM_ADMIN",
      "SUPER_ADMIN",
    ]);
    if (!authResult.success) {
      const status = authResult.value.code === "UNAUTHORIZED" ? 401 : 403;
      return NextResponse.json(
        { success: false, value: authResult.value },
        { status },
      );
    }

    const body = await request.json();

    // バリデーション
    const parsed = manualImportSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          value: {
            code: "VALIDATION_ERROR",
            cause: parsed.error.flatten().fieldErrors,
          },
        },
        { status: 400 },
      );
    }

    // 手動インポート実行
    const result = await executeManualImport(parsed.data);

    if (!result.success) {
      const status = result.value.code === "IMPORT_LOCKED" ? 409 : 500;
      return NextResponse.json(
        { success: false, value: result.value },
        { status },
      );
    }

    return NextResponse.json({
      success: true,
      value: result.value,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        value: { code: "INTERNAL_ERROR", cause: "内部エラーが発生しました" },
      },
      { status: 500 },
    );
  }
}
