import { NextResponse, type NextRequest } from "next/server";
import { authorizeServerAction } from "@/lib/auth";
import {
  getPainCarePlanParamsSchema,
  savePainCarePlanSchema,
} from "@/features/care-plan/pain/schemata";
import { getPainCarePlan } from "@/features/care-plan/pain/queries/getPainCarePlan";
import { savePainCarePlanAction } from "@/features/care-plan/pain/server-actions/savePainCarePlanAction";

/**
 * 疼痛ケアプラン取得API
 *
 * GET /api/care-plan/pain?admissionId=xxx
 *
 * 認証済みユーザーのみアクセス可能。
 * 入院IDに対応する疼痛ケアプラン情報を返す。
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
  const parsed = getPainCarePlanParamsSchema.safeParse({ admissionId: admissionIdStr });
  if (!parsed.success) {
    return NextResponse.json(
      { error: "入力が不正です", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  // 疼痛ケアプラン取得
  const result = await getPainCarePlan(parsed.data.admissionId);
  if (!result.success) {
    return NextResponse.json({ error: result.value.cause }, { status: 500 });
  }

  return NextResponse.json({ painCarePlan: result.value });
}

/**
 * 疼痛ケアプラン保存API
 *
 * PUT /api/care-plan/pain
 *
 * 認証済みユーザーのみアクセス可能。
 * 疼痛ケアプランのデータを保存し、ステータスを更新する。
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
  const parsed = savePainCarePlanSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "入力が不正です", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  // 疼痛ケアプラン保存
  const result = await savePainCarePlanAction({
    admissionId: parsed.data.admissionId,
    currentQuestionId: parsed.data.currentQuestionId,
    details: parsed.data.details as import("@/features/care-plan/pain/types").PainCarePlanDetails,
    isCompleted: parsed.data.isCompleted,
  });

  if (!result.success) {
    const status = result.value.code === "NOT_FOUND" ? 404 : 500;
    return NextResponse.json({ error: result.value.cause }, { status });
  }

  return NextResponse.json(result.value);
}
