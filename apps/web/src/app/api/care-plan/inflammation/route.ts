import { NextResponse, type NextRequest } from "next/server";
import { authorizeServerAction } from "@/lib/auth";
import {
  inflammationParamsSchema,
  saveInflammationSchema,
  completeInflammationSchema,
} from "@/features/care-plan/inflammation/schemata";
import { getInflammationData } from "@/features/care-plan/inflammation/queries/getInflammationData";
import { saveInflammationAction } from "@/features/care-plan/inflammation/server-actions/saveInflammationAction";
import { completeInflammationAction } from "@/features/care-plan/inflammation/server-actions/completeInflammationAction";

/**
 * 炎症データ取得API
 *
 * GET /api/care-plan/inflammation?admissionId=xxx
 *
 * 認証済みユーザーのみアクセス可能。
 * 入院IDに対応する炎症ケアプランのデータ（採血結果、バイタルサイン等）を返す。
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
  const parsed = inflammationParamsSchema.safeParse({ admissionId: admissionIdStr });
  if (!parsed.success) {
    return NextResponse.json(
      { error: "入力が不正です", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  // データ取得
  const result = await getInflammationData(parsed.data.admissionId);
  if (!result.success) {
    const status = result.value.code === "NOT_FOUND" ? 404 : 500;
    return NextResponse.json({ error: result.value.cause }, { status });
  }

  return NextResponse.json(result.value);
}

/**
 * 炎症ケアプラン保存API（進捗保存）
 *
 * PUT /api/care-plan/inflammation
 *
 * 認証済みユーザーのみアクセス可能。
 * 一問一答の各ステップの進捗を保存する。
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
  const parsed = saveInflammationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "入力が不正です", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  // 進捗保存
  const result = await saveInflammationAction(parsed.data);
  if (!result.success) {
    const status = result.value.code === "NOT_FOUND" ? 404 : 500;
    return NextResponse.json({ error: result.value.cause }, { status });
  }

  return NextResponse.json(result.value);
}

/**
 * 炎症ケアプラン完了API
 *
 * POST /api/care-plan/inflammation
 *
 * 認証済みユーザーのみアクセス可能。
 * 炎症ケアプランを完了させ、対処提案を生成する。
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
  const parsed = completeInflammationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "入力が不正です", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  // 完了処理
  const result = await completeInflammationAction(parsed.data);
  if (!result.success) {
    const status =
      result.value.code === "NOT_FOUND"
        ? 404
        : result.value.code === "INFLAMMATION_INCOMPLETE"
          ? 400
          : 500;
    return NextResponse.json({ error: result.value.cause }, { status });
  }

  return NextResponse.json(result.value);
}
