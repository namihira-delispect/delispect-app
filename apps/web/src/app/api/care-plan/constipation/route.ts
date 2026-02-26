import { NextResponse, type NextRequest } from "next/server";
import { authorizeServerAction } from "@/lib/auth";
import {
  constipationParamsSchema,
  saveConstipationSchema,
} from "@/features/care-plan/constipation/schemata";
import { getConstipationAssessment } from "@/features/care-plan/constipation/queries/getConstipationAssessment";
import { saveConstipationAction } from "@/features/care-plan/constipation/server-actions/saveConstipationAction";
import { updateConstipationProgressAction } from "@/features/care-plan/constipation/server-actions/updateConstipationProgressAction";

/**
 * 便秘アセスメントデータ取得API
 *
 * GET /api/care-plan/constipation?admissionId=xxx
 *
 * 認証済みユーザーのみアクセス可能。
 * 入院IDに対応する便秘のケアプランアイテムデータを返す。
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
  const parsed = constipationParamsSchema.safeParse({ admissionId: admissionIdStr });
  if (!parsed.success) {
    return NextResponse.json(
      { error: "入力が不正です", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  // データ取得
  const result = await getConstipationAssessment(parsed.data.admissionId);
  if (!result.success) {
    return NextResponse.json({ error: result.value.cause }, { status: 500 });
  }

  if (!result.value) {
    return NextResponse.json({ details: null, assessment: null, currentQuestionId: null });
  }

  const { details, status } = result.value;

  // 完了済みの場合はdetailsを返す
  if (status === "COMPLETED" && details) {
    return NextResponse.json({ details, assessment: null, currentQuestionId: null });
  }

  // 途中状態の場合はassessmentとcurrentQuestionIdを返す
  const assessment = details ? ((details as { assessment?: unknown }).assessment ?? null) : null;
  const currentQuestionId = result.value ? null : null;

  return NextResponse.json({ details: null, assessment, currentQuestionId });
}

/**
 * 便秘アセスメントデータ保存API
 *
 * POST /api/care-plan/constipation
 *
 * 認証済みユーザーのみアクセス可能。
 * 便秘アセスメントデータを検証・保存し、対処提案を生成する。
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
  const parsed = saveConstipationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "入力が不正です", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  // 保存
  const result = await saveConstipationAction({
    admissionId: parsed.data.admissionId,
    assessment: parsed.data.assessment as Parameters<
      typeof saveConstipationAction
    >[0]["assessment"],
  });

  if (!result.success) {
    const status = result.value.code === "NOT_FOUND" ? 404 : 500;
    return NextResponse.json({ error: result.value.cause }, { status });
  }

  return NextResponse.json(result.value, { status: 200 });
}

/**
 * 便秘ケアプラン進捗更新API
 *
 * PATCH /api/care-plan/constipation
 *
 * 認証済みユーザーのみアクセス可能。
 * 一問一答形式での進捗（現在の質問ID）を保存する。
 */
export async function PATCH(request: NextRequest) {
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

  const { admissionId, currentQuestionId } = body as {
    admissionId: number;
    currentQuestionId: string;
  };

  if (!admissionId || !currentQuestionId) {
    return NextResponse.json({ error: "入力が不正です" }, { status: 400 });
  }

  const result = await updateConstipationProgressAction({
    admissionId,
    currentQuestionId,
  });

  if (!result.success) {
    const status = result.value.code === "NOT_FOUND" ? 404 : 500;
    return NextResponse.json({ error: result.value.cause }, { status });
  }

  return NextResponse.json(result.value, { status: 200 });
}
