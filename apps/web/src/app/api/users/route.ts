import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@delispect/db";
import { hashPassword } from "@delispect/auth";
import { authorizeServerAction } from "@/lib/auth";
import { userListFilterSchema, createUserSchema } from "@/features/user-management/schemata";
import type { UserListItem } from "@/features/user-management/types";

/**
 * GET /api/users - ユーザー一覧取得
 */
export async function GET(request: NextRequest) {
  // 認可チェック: 全権管理者のみ
  const authResult = await authorizeServerAction(["SUPER_ADMIN"]);
  if (!authResult.success) {
    const status = authResult.value.code === "UNAUTHORIZED" ? 401 : 403;
    return NextResponse.json(
      { success: false, value: authResult.value },
      { status },
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const filterInput = {
      search: searchParams.get("search") ?? "",
      role: searchParams.get("role") ?? "",
      isActive: searchParams.get("isActive") ?? "",
      sortColumn: searchParams.get("sortColumn") ?? "createdAt",
      sortDirection: searchParams.get("sortDirection") ?? "desc",
      page: searchParams.get("page") ?? "1",
      pageSize: searchParams.get("pageSize") ?? "20",
    };

    const parsed = userListFilterSchema.safeParse(filterInput);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          value: {
            code: "INVALID_INPUT",
            cause: parsed.error.flatten(),
          },
        },
        { status: 400 },
      );
    }

    const {
      search,
      role,
      isActive,
      sortColumn,
      sortDirection,
      page,
      pageSize,
    } = parsed.data;

    // WHERE条件の組み立て
    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { username: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    if (role) {
      where.userRoles = {
        some: {
          role: { name: role },
        },
      };
    }

    if (isActive === "true") {
      where.isActive = true;
    } else if (isActive === "false") {
      where.isActive = false;
    }

    const orderBy: Record<string, string> = {};
    orderBy[sortColumn] = sortDirection;

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          userRoles: {
            include: { role: true },
          },
        },
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.user.count({ where }),
    ]);

    const userItems: UserListItem[] = users.map((user) => ({
      id: user.id,
      username: user.username,
      email: user.email,
      isActive: user.isActive,
      roles: user.userRoles.map(
        (ur) => ur.role.name,
      ) as UserListItem["roles"],
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      value: { users: userItems, totalCount },
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        value: {
          code: "INTERNAL_ERROR",
          cause: "ユーザー一覧の取得に失敗しました",
        },
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/users - ユーザー登録
 */
export async function POST(request: NextRequest) {
  // 認可チェック: 全権管理者のみ
  const authResult = await authorizeServerAction(["SUPER_ADMIN"]);
  if (!authResult.success) {
    const status = authResult.value.code === "UNAUTHORIZED" ? 401 : 403;
    return NextResponse.json(
      { success: false, value: authResult.value },
      { status },
    );
  }

  try {
    const body = await request.json();

    const parsed = createUserSchema.safeParse(body);
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
    const existingUsername = await prisma.user.findUnique({
      where: { username: parsed.data.username },
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
    const existingEmail = await prisma.user.findUnique({
      where: { email: parsed.data.email },
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

    const passwordHash = await hashPassword(parsed.data.password);

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

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          username: parsed.data.username,
          email: parsed.data.email,
          passwordHash,
          isActive: true,
        },
      });

      await tx.userRole.createMany({
        data: roles.map((role) => ({
          userId: newUser.id,
          roleId: role.id,
        })),
      });

      return newUser;
    });

    return NextResponse.json(
      {
        success: true,
        value: { id: user.id, username: user.username },
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        value: {
          code: "INTERNAL_ERROR",
          cause: "ユーザーの登録に失敗しました",
        },
      },
      { status: 500 },
    );
  }
}
