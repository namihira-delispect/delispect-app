import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@delispect/db";
import { hashPassword } from "@delispect/auth";
import { authorizeServerAction } from "@/lib/auth";
import { updateUserSchema } from "@/features/user-management/schemata";
import type { UserDetail } from "@/features/user-management/types";

/**
 * GET /api/users/:id - ユーザー詳細取得
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await authorizeServerAction(["SUPER_ADMIN"]);
  if (!authResult.success) {
    const status = authResult.value.code === "UNAUTHORIZED" ? 401 : 403;
    return NextResponse.json(
      { success: false, value: authResult.value },
      { status },
    );
  }

  const { id } = await params;
  const userId = parseInt(id, 10);
  if (isNaN(userId)) {
    return NextResponse.json(
      {
        success: false,
        value: { code: "INVALID_INPUT", cause: "無効なユーザーIDです" },
      },
      { status: 400 },
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: { role: true },
        },
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

    const userDetail: UserDetail = {
      id: user.id,
      username: user.username,
      email: user.email,
      isActive: user.isActive,
      roles: user.userRoles.map(
        (ur) => ur.role.name,
      ) as UserDetail["roles"],
    };

    return NextResponse.json({ success: true, value: userDetail });
  } catch {
    return NextResponse.json(
      {
        success: false,
        value: {
          code: "INTERNAL_ERROR",
          cause: "ユーザー情報の取得に失敗しました",
        },
      },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/users/:id - ユーザー更新
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await authorizeServerAction(["SUPER_ADMIN"]);
  if (!authResult.success) {
    const status = authResult.value.code === "UNAUTHORIZED" ? 401 : 403;
    return NextResponse.json(
      { success: false, value: authResult.value },
      { status },
    );
  }

  const { id } = await params;
  const userId = parseInt(id, 10);
  if (isNaN(userId)) {
    return NextResponse.json(
      {
        success: false,
        value: { code: "INVALID_INPUT", cause: "無効なユーザーIDです" },
      },
      { status: 400 },
    );
  }

  try {
    const body = await request.json();

    const parsed = updateUserSchema.safeParse(body);
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

    // ユーザー存在チェック
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!existingUser) {
      return NextResponse.json(
        {
          success: false,
          value: { code: "NOT_FOUND", cause: "ユーザーが見つかりません" },
        },
        { status: 404 },
      );
    }

    // ユーザー名の重複チェック
    const duplicateUsername = await prisma.user.findFirst({
      where: {
        username: parsed.data.username,
        NOT: { id: userId },
      },
    });
    if (duplicateUsername) {
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
    const duplicateEmail = await prisma.user.findFirst({
      where: {
        email: parsed.data.email,
        NOT: { id: userId },
      },
    });
    if (duplicateEmail) {
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

    const roles = await prisma.role.findMany({
      where: { name: { in: parsed.data.roles } },
    });

    if (roles.length !== parsed.data.roles.length) {
      return NextResponse.json(
        {
          success: false,
          value: {
            code: "INVALID_ROLES",
            cause: "無効なロールが指定されています",
          },
        },
        { status: 400 },
      );
    }

    await prisma.$transaction(async (tx) => {
      const updateData: Record<string, unknown> = {
        username: parsed.data.username,
        email: parsed.data.email,
        isActive: parsed.data.isActive,
      };

      if (parsed.data.password && parsed.data.password !== "") {
        updateData.passwordHash = await hashPassword(parsed.data.password);
        updateData.failedLoginAttempts = 0;
        updateData.lockedUntil = null;
      }

      await tx.user.update({
        where: { id: userId },
        data: updateData,
      });

      await tx.userRole.deleteMany({ where: { userId } });
      await tx.userRole.createMany({
        data: roles.map((role) => ({
          userId,
          roleId: role.id,
        })),
      });
    });

    return NextResponse.json({
      success: true,
      value: { id: userId },
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        value: {
          code: "INTERNAL_ERROR",
          cause: "ユーザー情報の更新に失敗しました",
        },
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/users/:id - ユーザー論理削除
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await authorizeServerAction(["SUPER_ADMIN"]);
  if (!authResult.success) {
    const status = authResult.value.code === "UNAUTHORIZED" ? 401 : 403;
    return NextResponse.json(
      { success: false, value: authResult.value },
      { status },
    );
  }

  const { id } = await params;
  const userId = parseInt(id, 10);
  if (isNaN(userId)) {
    return NextResponse.json(
      {
        success: false,
        value: { code: "INVALID_INPUT", cause: "無効なユーザーIDです" },
      },
      { status: 400 },
    );
  }

  // 自分自身の削除を防止
  if (authResult.value.id === userId) {
    return NextResponse.json(
      {
        success: false,
        value: {
          code: "FORBIDDEN",
          cause: "自分自身を無効化することはできません",
        },
      },
      { status: 403 },
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
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

    // 論理削除
    await prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      value: { id: userId },
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        value: {
          code: "INTERNAL_ERROR",
          cause: "ユーザーの削除に失敗しました",
        },
      },
      { status: 500 },
    );
  }
}
