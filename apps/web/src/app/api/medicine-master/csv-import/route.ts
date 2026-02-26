import { NextRequest, NextResponse } from "next/server";
import { authorizeServerAction } from "@/lib/auth";
import { previewCsvImport, executeCsvImport } from "@/features/medicine-master/server-actions";

/**
 * CSVインポートプレビュー
 *
 * POST /api/medicine-master/csv-import?action=preview
 * POST /api/medicine-master/csv-import?action=execute
 *
 * リクエストボディ: { csvText: string }
 */
export async function POST(request: NextRequest) {
  // 認証・認可チェック
  const authResult = await authorizeServerAction(["SYSTEM_ADMIN", "SUPER_ADMIN"]);
  if (!authResult.success) {
    return NextResponse.json(
      { error: authResult.value.cause },
      { status: authResult.value.code === "UNAUTHORIZED" ? 401 : 403 },
    );
  }

  try {
    const body = await request.json();
    const { csvText } = body;

    if (!csvText || typeof csvText !== "string") {
      return NextResponse.json({ error: "CSVデータが必要です" }, { status: 400 });
    }

    const action = request.nextUrl.searchParams.get("action");

    if (action === "preview") {
      const result = await previewCsvImport(csvText);
      if (result.success) {
        return NextResponse.json(result.value);
      }
      return NextResponse.json({ error: result.value.cause }, { status: 400 });
    }

    if (action === "execute") {
      const result = await executeCsvImport(csvText);
      if (result.success) {
        return NextResponse.json(result.value);
      }
      return NextResponse.json({ error: result.value.cause }, { status: 400 });
    }

    return NextResponse.json(
      { error: "actionパラメータが不正です（preview または execute を指定してください）" },
      { status: 400 },
    );
  } catch {
    return NextResponse.json({ error: "リクエストの処理に失敗しました" }, { status: 500 });
  }
}
