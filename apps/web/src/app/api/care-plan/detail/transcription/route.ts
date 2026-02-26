import { NextResponse, type NextRequest } from "next/server";
import { authorizeServerAction } from "@/lib/auth";
import {
  createTranscriptionSchema,
  transcriptionHistoryParamsSchema,
} from "@/features/care-plan/detail/schemata";
import { createTranscriptionAction } from "@/features/care-plan/detail/server-actions/createTranscriptionAction";
import { getTranscriptionHistory } from "@/features/care-plan/detail/queries/getTranscriptionHistory";

/**
 * 転記履歴取得API
 *
 * GET /api/care-plan/detail/transcription?carePlanId=xxx
 *
 * 認証済みユーザーのみアクセス可能。
 * ケアプランIDに対応する転記履歴一覧を返す。
 */
export async function GET(request: NextRequest) {
  // 認証チェック
  const authResult = await authorizeServerAction();
  if (!authResult.success) {
    return NextResponse.json(
      { error: authResult.value.cause },
      { status: authResult.value.code === "UNAUTHORIZED" ? 401 : 403 },
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const carePlanIdStr = searchParams.get("carePlanId");

  // バリデーション
  const parsed = transcriptionHistoryParamsSchema.safeParse({ carePlanId: carePlanIdStr });
  if (!parsed.success) {
    return NextResponse.json(
      { error: "入力が不正です", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  // 転記履歴取得
  const result = await getTranscriptionHistory(parsed.data.carePlanId);
  if (!result.success) {
    return NextResponse.json({ error: result.value.cause }, { status: 500 });
  }

  return NextResponse.json({ histories: result.value });
}

/**
 * 転記履歴作成API
 *
 * POST /api/care-plan/detail/transcription
 *
 * 認証済みユーザーのみアクセス可能。
 * ケアプランの転記テキストを保存し、転記履歴を作成する。
 */
export async function POST(request: NextRequest) {
  // 認証チェック
  const authResult = await authorizeServerAction();
  if (!authResult.success) {
    return NextResponse.json(
      { error: authResult.value.cause },
      { status: authResult.value.code === "UNAUTHORIZED" ? 401 : 403 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "リクエストボディの解析に失敗しました" }, { status: 400 });
  }

  // バリデーション
  const parsed = createTranscriptionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "入力が不正です", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  // 転記履歴の作成
  const result = await createTranscriptionAction({
    carePlanId: parsed.data.carePlanId,
    content: parsed.data.content,
  });

  if (!result.success) {
    const status = result.value.code === "NOT_FOUND" ? 404 : 500;
    return NextResponse.json({ error: result.value.cause }, { status });
  }

  return NextResponse.json(result.value, { status: 201 });
}
