import { NextResponse, type NextRequest } from "next/server";
import { authorizeServerAction } from "@/lib/auth";
import {
  highRiskKasanParamsSchema,
  saveHighRiskKasanSchema,
} from "@/features/high-risk-kasan/schemata";
import { getHighRiskKasanAssessment } from "@/features/high-risk-kasan/queries/getHighRiskKasanAssessment";
import { saveHighRiskKasanAction } from "@/features/high-risk-kasan/server-actions/saveHighRiskKasanAction";

/**
 * ハイリスクケア加算アセスメント取得API
 *
 * GET /api/high-risk-kasan/[admissionId]
 *
 * 認証済みユーザーのみアクセス可能。
 * 入院IDに対応するアセスメント情報を返す。
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ admissionId: string }> },
) {
  // 認証チェック
  const authResult = await authorizeServerAction();
  if (!authResult.success) {
    return NextResponse.json(
      { error: authResult.value.cause },
      { status: authResult.value.code === "UNAUTHORIZED" ? 401 : 403 },
    );
  }

  const { admissionId } = await params;

  // バリデーション
  const parsed = highRiskKasanParamsSchema.safeParse({ admissionId });
  if (!parsed.success) {
    return NextResponse.json(
      { error: "入力が不正です", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  // アセスメント情報取得
  const result = await getHighRiskKasanAssessment(parsed.data.admissionId);
  if (!result.success) {
    const status = result.value.code === "NOT_FOUND" ? 404 : 500;
    return NextResponse.json({ error: result.value.cause }, { status });
  }

  return NextResponse.json(result.value);
}

/**
 * ハイリスクケア加算アセスメント保存API
 *
 * PUT /api/high-risk-kasan/[admissionId]
 *
 * 認証済みユーザーのみアクセス可能。
 * アセスメント結果を保存する。
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ admissionId: string }> },
) {
  // 認証チェック
  const authResult = await authorizeServerAction();
  if (!authResult.success) {
    return NextResponse.json(
      { error: authResult.value.cause },
      { status: authResult.value.code === "UNAUTHORIZED" ? 401 : 403 },
    );
  }

  const { admissionId } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "リクエストボディの解析に失敗しました" }, { status: 400 });
  }

  // バリデーション
  const parsed = saveHighRiskKasanSchema.safeParse({
    admissionId,
    ...(typeof body === "object" && body !== null ? body : {}),
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: "入力が不正です", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  // アセスメント保存
  const result = await saveHighRiskKasanAction({
    admissionId: parsed.data.admissionId,
    medicalHistoryItems: parsed.data.medicalHistoryItems,
  });

  if (!result.success) {
    const status = result.value.code === "NOT_FOUND" ? 404 : 500;
    return NextResponse.json({ error: result.value.cause }, { status });
  }

  return NextResponse.json(result.value);
}
