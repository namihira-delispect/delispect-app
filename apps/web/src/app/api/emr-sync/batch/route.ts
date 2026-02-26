import { NextRequest, NextResponse } from "next/server";
import { executeBatchImport } from "@/features/emr-sync/server-actions/executeBatchImport";

/**
 * POST /api/emr-sync/batch - バッチインポートの実行
 *
 * 日次バッチスケジューラから呼び出されることを想定したエンドポイント。
 * 認証はAPIキーベースで行う（本番環境では内部ネットワーク制限等を併用）。
 *
 * リクエストボディ（任意）:
 * - daysBack: 対象日数（デフォルト: 2）
 * - maxRetries: リトライ上限（デフォルト: 3）
 * - actorId: 実行ユーザーID（デフォルト: 1 = システムユーザー）
 *
 * ヘッダー:
 * - x-api-key: 内部APIキー（Mock実装では固定値で検証）
 */
export async function POST(request: NextRequest) {
  try {
    // 簡易的なAPIキー認証（Mock実装）
    const apiKey = request.headers.get("x-api-key");
    const expectedKey = process.env.BATCH_API_KEY ?? "delispect-batch-key";

    if (apiKey !== expectedKey) {
      return NextResponse.json(
        {
          success: false,
          value: { code: "UNAUTHORIZED", cause: "無効なAPIキーです" },
        },
        { status: 401 },
      );
    }

    let config: { daysBack?: number; maxRetries?: number; actorId?: number } = {};
    try {
      const body = await request.json();
      config = body ?? {};
    } catch {
      // ボディが空の場合はデフォルト設定を使用
    }

    const result = await executeBatchImport(
      {
        daysBack: config.daysBack,
        maxRetries: config.maxRetries,
        executionTime: "03:00",
      },
      config.actorId ?? 1,
    );

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
