import { NextResponse, type NextRequest } from "next/server";
import { authorizeServerAction } from "@/lib/auth";
import {
  medicationCarePlanParamsSchema,
  saveMedicationCarePlanSchema,
} from "@/features/care-plan-medication/schemata";
import { getMedicationCarePlan } from "@/features/care-plan-medication/queries/getMedicationCarePlan";
import { saveMedicationCarePlanAction } from "@/features/care-plan-medication/server-actions/saveMedicationCarePlanAction";

/**
 * 薬剤ケアプランデータ取得API
 *
 * GET /api/care-plan/medication?admissionId=xxx
 *
 * 認証済みユーザーのみアクセス可能。
 * 入院IDに対応する薬剤ケアプランの表示データを返す。
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
  const parsed = medicationCarePlanParamsSchema.safeParse({
    admissionId: admissionIdStr,
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: "入力が不正です", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  // 薬剤ケアプランデータ取得
  const result = await getMedicationCarePlan(parsed.data.admissionId);
  if (!result.success) {
    const status = result.value.code === "NOT_FOUND" ? 404 : 500;
    return NextResponse.json({ error: result.value.cause }, { status });
  }

  return NextResponse.json({ data: result.value });
}

/**
 * 薬剤ケアプラン保存API
 *
 * POST /api/care-plan/medication
 *
 * 認証済みユーザーのみアクセス可能。
 * 薬剤ケアプランの入力内容を保存する。
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
  const parsed = saveMedicationCarePlanSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "入力が不正です", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  // 薬剤ケアプラン保存
  const result = await saveMedicationCarePlanAction({
    carePlanItemId: parsed.data.carePlanItemId,
    currentQuestionId: parsed.data.currentQuestionId,
    details: parsed.data.details,
    status: parsed.data.status,
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

  return NextResponse.json({ data: result.value });
}
