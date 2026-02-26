import { NextResponse, type NextRequest } from "next/server";
import { authorizeServerAction } from "@/lib/auth";
import { admissionDetailParamsSchema } from "@/features/admissions/schemata";
import { getAdmissionDetail } from "@/features/admissions/queries/getAdmissionDetail";

/**
 * 患者入院詳細取得API
 *
 * GET /api/admissions/[id]
 *
 * 認証済みユーザーのみアクセス可能。
 * 入院IDに対応する詳細情報を返す。
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // 認証チェック
  const authResult = await authorizeServerAction();
  if (!authResult.success) {
    return NextResponse.json(
      { error: authResult.value.cause },
      { status: authResult.value.code === "UNAUTHORIZED" ? 401 : 403 },
    );
  }

  const { id } = await params;

  // バリデーション
  const parsed = admissionDetailParamsSchema.safeParse({ id });
  if (!parsed.success) {
    return NextResponse.json(
      { error: "入力が不正です", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  // 詳細取得
  const result = await getAdmissionDetail(parsed.data.id);
  if (!result.success) {
    const status = result.value.code === "NOT_FOUND" ? 404 : 500;
    return NextResponse.json({ error: result.value.cause }, { status });
  }

  return NextResponse.json(result.value);
}
