import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@delispect/db";
import { getServerSession } from "@/lib/auth";
import { updateProfileSchema } from "@/features/settings/schemata";

/**
 * GET /api/settings/profile - プロフィール情報の取得
 */
export async function GET() {
  try {
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

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        username: true,
        email: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          value: { code: "NOT_FOUND", cause: "ユーザーが見つかりません" },
        },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, value: user });
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

/**
 * PUT /api/settings/profile - プロフィール情報の更新
 */
export async function PUT(request: NextRequest) {
  try {
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

    // バリデーション
    const parsed = updateProfileSchema.safeParse(body);
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

    // ユーザー名の重複チェック
    const existingUsername = await prisma.user.findFirst({
      where: {
        username: parsed.data.username,
        NOT: { id: session.userId },
      },
    });

    if (existingUsername) {
      return NextResponse.json(
        {
          success: false,
          value: {
            code: "DUPLICATE_USERNAME",
            cause: "このユーザー名は既に使用されています",
          },
        },
        { status: 409 },
      );
    }

    // メールアドレスの重複チェック
    const existingEmail = await prisma.user.findFirst({
      where: {
        email: parsed.data.email,
        NOT: { id: session.userId },
      },
    });

    if (existingEmail) {
      return NextResponse.json(
        {
          success: false,
          value: {
            code: "DUPLICATE_EMAIL",
            cause: "このメールアドレスは既に使用されています",
          },
        },
        { status: 409 },
      );
    }

    // 更新
    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
      data: {
        username: parsed.data.username,
        email: parsed.data.email,
      },
      select: {
        id: true,
        username: true,
        email: true,
      },
    });

    return NextResponse.json({ success: true, value: updatedUser });
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
