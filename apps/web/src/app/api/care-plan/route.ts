import { NextResponse, type NextRequest } from "next/server";
import { authorizeServerAction } from "@/lib/auth";
import { carePlanParamsSchema, createCarePlanSchema } from "@/features/care-plan/schemata";
import { getCarePlan } from "@/features/care-plan/queries/getCarePlan";
import { createCarePlanAction } from "@/features/care-plan/server-actions/createCarePlanAction";

/**
 * ケアプラン取得API
 *
 * GET /api/care-plan?admissionId=xxx
 *
 * 認証済みユーザーのみアクセス可能。
 * 入院IDに対応するケアプラン一覧情報を返す。
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

  // バリデーション
  const parsed = carePlanParamsSchema.safeParse({ admissionId: admissionIdStr });
  if (!parsed.success) {
    return NextResponse.json(
      { error: "入力が不正です", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  // ケアプラン取得
  const result = await getCarePlan(parsed.data.admissionId);
  if (!result.success) {
    return NextResponse.json({ error: result.value.cause }, { status: 500 });
  }

  return NextResponse.json({ carePlan: result.value });
}

/**
 * ケアプラン作成API
 *
 * POST /api/care-plan
 *
 * 認証済みユーザーのみアクセス可能。
 * 入院IDに対して新規ケアプランを作成する。
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
  const parsed = createCarePlanSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "入力が不正です", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  // ケアプラン作成
  const result = await createCarePlanAction({
    admissionId: parsed.data.admissionId,
  });

  if (!result.success) {
    const status =
      result.value.code === "NOT_FOUND"
        ? 404
        : result.value.code === "CARE_PLAN_ALREADY_EXISTS"
          ? 409
          : 500;
    return NextResponse.json({ error: result.value.cause }, { status });
  }

  return NextResponse.json(result.value, { status: 201 });
}
