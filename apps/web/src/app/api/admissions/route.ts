import { NextResponse, type NextRequest } from "next/server";
import { authorizeServerAction } from "@/lib/auth";
import { admissionSearchSchema } from "@/features/admissions/schemata";
import { getAdmissionList } from "@/features/admissions/queries/getAdmissionList";

/**
 * 患者入院一覧検索API
 *
 * GET /api/admissions?riskLevel=...&careStatus=...&admissionDateFrom=...
 *
 * 認証済みユーザーのみアクセス可能。
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

  // クエリパラメータの取得
  const { searchParams } = request.nextUrl;
  const input = {
    riskLevel: searchParams.get("riskLevel") ?? undefined,
    careStatus: searchParams.get("careStatus") ?? undefined,
    admissionDateFrom: searchParams.get("admissionDateFrom") ?? undefined,
    admissionDateTo: searchParams.get("admissionDateTo") ?? undefined,
    assessmentDateFrom: searchParams.get("assessmentDateFrom") ?? undefined,
    assessmentDateTo: searchParams.get("assessmentDateTo") ?? undefined,
    name: searchParams.get("name") ?? undefined,
    sortColumn: searchParams.get("sortColumn") ?? undefined,
    sortDirection: searchParams.get("sortDirection") ?? undefined,
    page: searchParams.get("page") ?? undefined,
    pageSize: searchParams.get("pageSize") ?? undefined,
  };

  // バリデーション
  const parsed = admissionSearchSchema.safeParse(input);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "入力が不正です", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  // 検索実行
  const result = await getAdmissionList(parsed.data);
  if (!result.success) {
    return NextResponse.json({ error: result.value.cause }, { status: 500 });
  }

  return NextResponse.json(result.value);
}
