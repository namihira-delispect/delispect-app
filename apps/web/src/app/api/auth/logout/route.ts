import { NextResponse } from "next/server";
import { invalidateSession } from "@delispect/auth";
import { getSessionCookie, deleteSessionCookie } from "@/lib/auth/cookies";

export async function POST() {
  try {
    const sessionId = await getSessionCookie();

    if (sessionId) {
      await invalidateSession(sessionId);
    }

    await deleteSessionCookie();

    return NextResponse.json({ success: true, value: { message: "ログアウトしました" } });
  } catch {
    return NextResponse.json(
      {
        success: false,
        value: { code: "INTERNAL_ERROR", cause: "ログアウトに失敗しました" },
      },
      { status: 500 },
    );
  }
}
