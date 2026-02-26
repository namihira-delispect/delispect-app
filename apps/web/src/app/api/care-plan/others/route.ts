import { NextResponse, type NextRequest } from "next/server";
import { authorizeServerAction } from "@/lib/auth";
import {
  getOthersByCategoryParamsSchema,
  saveOthersCarePlanSchema,
} from "@/features/care-plan-others/schemata";
import { getOthersCarePlanByCategory } from "@/features/care-plan-others/queries/getOthersCarePlan";
import { saveOthersCarePlanAction } from "@/features/care-plan-others/server-actions/saveOthersCarePlanAction";

/**
 * その他カテゴリのケアプラン取得API
 *
 * GET /api/care-plan/others?admissionId=xxx&category=MOBILITY
 *
 * 認証済みユーザーのみアクセス可能。
 * 入院ID+カテゴリーに対応するケアプランアイテム情報を返す。
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
  const admissionIdStr = searchParams.get("admissionId");
  const category = searchParams.get("category");

  // バリデーション
  const parsed = getOthersByCategoryParamsSchema.safeParse({
    admissionId: admissionIdStr,
    category,
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: "入力が不正です", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  // データ取得
  const result = await getOthersCarePlanByCategory(parsed.data.admissionId, parsed.data.category);
  if (!result.success) {
    const status = result.value.code === "NOT_FOUND" ? 404 : 500;
    return NextResponse.json({ error: result.value.cause }, { status });
  }

  return NextResponse.json({ item: result.value });
}

/**
 * その他カテゴリのケアプラン保存API
 *
 * PUT /api/care-plan/others
 *
 * 認証済みユーザーのみアクセス可能。
 * チェックリストの選択内容を保存する。
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
  const parsed = saveOthersCarePlanSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "入力が不正です", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  // 保存
  const result = await saveOthersCarePlanAction({
    itemId: parsed.data.itemId,
    checklist: parsed.data.checklist,
  });

  if (!result.success) {
    const status =
      result.value.code === "NOT_FOUND"
        ? 404
        : result.value.code === "INVALID_CATEGORY"
          ? 400
          : 500;
    return NextResponse.json({ error: result.value.cause }, { status });
  }

  return NextResponse.json(result.value);
}
