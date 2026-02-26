import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@delispect/db";
import { verifyPassword, hashPassword } from "@delispect/auth";
import { getServerSession } from "@/lib/auth";
import { changePasswordSchema } from "@/features/settings/schemata";

/**
 * PUT /api/settings/password - パスワード変更
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
    const parsed = changePasswordSchema.safeParse(body);
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

    // ユーザー取得
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { passwordHash: true },
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

    // 現在のパスワード検証
    const isCurrentPasswordValid = await verifyPassword(
      parsed.data.currentPassword,
      user.passwordHash,
    );

    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          value: {
            code: "INVALID_CURRENT_PASSWORD",
            cause: "現在のパスワードが正しくありません",
          },
        },
        { status: 401 },
      );
    }

    // 新しいパスワードをハッシュ化して更新
    const newPasswordHash = await hashPassword(parsed.data.newPassword);
    await prisma.user.update({
      where: { id: session.userId },
      data: { passwordHash: newPasswordHash },
    });

    return NextResponse.json({
      success: true,
      value: { message: "パスワードを変更しました" },
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
