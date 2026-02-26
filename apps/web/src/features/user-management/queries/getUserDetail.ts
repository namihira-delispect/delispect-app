"use server";

import { prisma } from "@delispect/db";
import { authorizeServerAction } from "@/lib/auth";
import type { Result } from "@/shared/types";
import type { UserDetail } from "../types";

/**
 * ユーザー詳細を取得する（全権管理者のみ）
 */
export async function getUserDetail(
  userId: number,
): Promise<Result<UserDetail>> {
  // 認可チェック: 全権管理者のみ
  const authResult = await authorizeServerAction(["SUPER_ADMIN"]);
  if (!authResult.success) {
    return authResult;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      return {
        success: false,
        value: { code: "NOT_FOUND", cause: "ユーザーが見つかりません" },
      };
    }

    return {
      success: true,
      value: {
        id: user.id,
        username: user.username,
        email: user.email,
        isActive: user.isActive,
        roles: user.userRoles.map((ur) => ur.role.name) as UserDetail["roles"],
      },
    };
  } catch {
    return {
      success: false,
      value: {
        code: "DB_ERROR",
        cause: "ユーザー情報の取得に失敗しました",
      },
    };
  }
}
