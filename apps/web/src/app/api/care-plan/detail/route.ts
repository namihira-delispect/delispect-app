import { NextResponse, type NextRequest } from "next/server";
import { authorizeServerAction } from "@/lib/auth";
import { carePlanDetailParamsSchema } from "@/features/care-plan/detail/schemata";
import { getCarePlanDetail } from "@/features/care-plan/detail/queries/getCarePlanDetail";
import { getTranscriptionHistory } from "@/features/care-plan/detail/queries/getTranscriptionHistory";

/**
 * ケアプラン詳細取得API
 *
 * GET /api/care-plan/detail?admissionId=xxx
 *
 * 認証済みユーザーのみアクセス可能。
 * 入院IDに対応するケアプラン詳細情報と転記履歴を返す。
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
  const parsed = carePlanDetailParamsSchema.safeParse({ admissionId: admissionIdStr });
  if (!parsed.success) {
    return NextResponse.json(
      { error: "入力が不正です", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  // ケアプラン詳細取得
  const detailResult = await getCarePlanDetail(parsed.data.admissionId);
  if (!detailResult.success) {
    return NextResponse.json({ error: detailResult.value.cause }, { status: 500 });
  }

  if (!detailResult.value) {
    return NextResponse.json({ detail: null, histories: [] });
  }

  // 転記履歴取得
  const historiesResult = await getTranscriptionHistory(detailResult.value.carePlanId);
  const histories = historiesResult.success ? historiesResult.value : [];

  return NextResponse.json({
    detail: detailResult.value,
    histories,
  });
}
