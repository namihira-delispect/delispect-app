import { NextResponse, type NextRequest } from "next/server";
import { authorizeServerAction } from "@/lib/auth";
import { executeRiskAssessmentAction } from "@/features/risk-assessment/server-actions";

/**
 * リスク評価実行API
 *
 * POST /api/risk-assessment
 *
 * SYSTEM_ADMIN, SUPER_ADMIN のみ実行可能。
 * 入院IDリストを受け取り、一括リスク評価を実行する。
 *
 * Request Body:
 * {
 *   admissionIds: number[]  // 1件以上50件以下
 * }
 *
 * Response:
 * {
 *   successCount: number,
 *   failureCount: number,
 *   indeterminateCount: number,
 *   results: [{ admissionId, success, riskLevel?, error?, missingFields? }]
 * }
 */
export async function POST(request: NextRequest) {
  // 認証チェック
  const authResult = await authorizeServerAction(["SYSTEM_ADMIN", "SUPER_ADMIN"]);
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

  // Server Actionに委譲
  const result = await executeRiskAssessmentAction(
    typeof body === "object" && body !== null
      ? (body as { admissionIds: number[] })
      : { admissionIds: [] },
  );

  if (!result.success) {
    const status = result.value.code === "INVALID_INPUT" ? 400 : 500;
    return NextResponse.json({ error: result.value.cause }, { status });
  }

  return NextResponse.json(result.value);
}
