"use server";

import { prisma } from "@delispect/db";
import { authorizeServerAction } from "@/lib/auth";
import type { Result } from "@/shared/types";
import type { UserListResult, UserListItem } from "../types";
import { userListFilterSchema } from "../schemata";

/**
 * ユーザー一覧を取得する（全権管理者のみ）
 */
export async function getUserList(
  filterInput: Record<string, unknown>,
): Promise<Result<UserListResult>> {
  // 認可チェック: 全権管理者のみ
  const authResult = await authorizeServerAction(["SUPER_ADMIN"]);
  if (!authResult.success) {
    return authResult;
  }

  // バリデーション
  const parsed = userListFilterSchema.safeParse(filterInput);
  if (!parsed.success) {
    return {
      success: false,
      value: { code: "INVALID_INPUT", cause: parsed.error.flatten() },
    };
  }

  const { search, role, isActive, sortColumn, sortDirection, page, pageSize } =
    parsed.data;

  try {
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

    // ソート条件
    const orderBy: Record<string, string> = {};
    orderBy[sortColumn] = sortDirection;

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          userRoles: {
            include: {
              role: true,
            },
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
      roles: user.userRoles.map((ur) => ur.role.name) as UserListItem["roles"],
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    }));

    return {
      success: true,
      value: { users: userItems, totalCount },
    };
  } catch {
    return {
      success: false,
      value: { code: "DB_ERROR", cause: "ユーザー一覧の取得に失敗しました" },
    };
  }
}
