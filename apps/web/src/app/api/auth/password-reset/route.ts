import { NextRequest, NextResponse } from "next/server";
import { unlockAccount } from "@delispect/auth";
import { getServerSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // 認証チェック
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        {
          success: false,
          value: { code: "UNAUTHORIZED", cause: "認証が必要です" },
        },
        { status: 401 },
      );
    }

    const body = await request.json();
    const userId = body.userId;

    if (typeof userId !== "number" || userId <= 0) {
      return NextResponse.json(
        {
          success: false,
          value: { code: "VALIDATION_ERROR", cause: "有効なユーザーIDを指定してください" },
        },
        { status: 400 },
      );
    }

    await unlockAccount(userId);

    return NextResponse.json({
      success: true,
      value: { message: "アカウントのロックを解除しました" },
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        value: { code: "INTERNAL_ERROR", cause: "ロック解除に失敗しました" },
      },
      { status: 500 },
    );
  }
}
