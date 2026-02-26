import { NextResponse, type NextRequest } from "next/server";
import { authorizeServerAction } from "@/lib/auth";
import {
  getDehydrationParamsSchema,
  saveDehydrationSchema,
  completeDehydrationSchema,
} from "@/features/care-plan/dehydration/schemata";
import { getDehydrationData } from "@/features/care-plan/dehydration/queries/getDehydrationData";
import { saveDehydrationAction } from "@/features/care-plan/dehydration/server-actions/saveDehydrationAction";
import { completeDehydrationAction } from "@/features/care-plan/dehydration/server-actions/completeDehydrationAction";

/**
 * 脱水アセスメントデータ取得API
 *
 * GET /api/care-plan/dehydration?itemId=xxx
 *
 * 認証済みユーザーのみアクセス可能。
 * ケアプランアイテムIDに対応する脱水アセスメントデータを返す。
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
  const itemIdStr = searchParams.get("itemId");

  // バリデーション
  const parsed = getDehydrationParamsSchema.safeParse({ itemId: itemIdStr });
  if (!parsed.success) {
    return NextResponse.json(
      { error: "入力が不正です", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  // データ取得
  const result = await getDehydrationData(parsed.data.itemId);
  if (!result.success) {
    const status = result.value.code === "NOT_FOUND" ? 404 : 500;
    return NextResponse.json({ error: result.value.cause }, { status });
  }

  return NextResponse.json(result.value);
}

/**
 * 脱水アセスメント途中保存API
 *
 * PUT /api/care-plan/dehydration
 *
 * 認証済みユーザーのみアクセス可能。
 * 一問一答の途中状態を保存する。
 */
export async function PUT(request: NextRequest) {
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
  const parsed = saveDehydrationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "入力が不正です", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  // 途中保存
  const result = await saveDehydrationAction({
    itemId: parsed.data.itemId,
    currentQuestionId: parsed.data.currentQuestionId,
    details: parsed.data.details as Record<string, unknown>,
  });

  if (!result.success) {
    const status = result.value.code === "NOT_FOUND" ? 404 : 500;
    return NextResponse.json({ error: result.value.cause }, { status });
  }

  return NextResponse.json(result.value);
}

/**
 * 脱水アセスメント完了API
 *
 * POST /api/care-plan/dehydration
 *
 * 認証済みユーザーのみアクセス可能。
 * アセスメントを完了し、対処提案を生成する。
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
  const parsed = completeDehydrationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "入力が不正です", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  // アセスメント完了
  const result = await completeDehydrationAction({
    itemId: parsed.data.itemId,
    details: parsed.data.details as Record<string, unknown>,
  });

  if (!result.success) {
    const status = result.value.code === "NOT_FOUND" ? 404 : 500;
    return NextResponse.json({ error: result.value.cause }, { status });
  }

  return NextResponse.json(result.value, { status: 201 });
}
