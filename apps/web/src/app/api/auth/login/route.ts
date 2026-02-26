import { NextRequest, NextResponse } from "next/server";
import { authenticate, loginSchema } from "@delispect/auth";
import { setSessionCookie } from "@/lib/auth/cookies";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // バリデーション
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          value: {
            code: "VALIDATION_ERROR",
            cause: parsed.error.flatten().fieldErrors,
          },
        },
        { status: 400 },
      );
    }

    // IP アドレス取得
    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      undefined;

    // 認証
    const result = await authenticate(parsed.data, ipAddress);

    if (!result.success) {
      const statusMap: Record<string, number> = {
        INVALID_CREDENTIALS: 401,
        ACCOUNT_LOCKED: 423,
        ACCOUNT_DISABLED: 403,
        INTERNAL_ERROR: 500,
      };

      return NextResponse.json(
        { success: false, value: result.value },
        { status: statusMap[result.value.code] ?? 500 },
      );
    }

    // セッションCookie設定
    await setSessionCookie(result.value.sessionId);

    return NextResponse.json({
      success: true,
      value: {
        userId: result.value.userId,
        username: result.value.username,
      },
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        value: { code: "INTERNAL_ERROR", cause: "内部エラーが発生しました" },
      },
      { status: 500 },
    );
  }
}
