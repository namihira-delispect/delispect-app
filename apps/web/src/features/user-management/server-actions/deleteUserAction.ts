"use server";

import { prisma } from "@delispect/db";
import { authorizeServerAction } from "@/lib/auth";
import type { Result } from "@/shared/types";

/**
 * ユーザー削除（論理削除）Server Action（全権管理者のみ）
 *
 * isActiveをfalseに設定する論理削除を行う。
 */
export async function deleteUserAction(
  userId: number,
): Promise<Result<{ id: number }>> {
  // 認可チェック: 全権管理者のみ
  const authResult = await authorizeServerAction(["SUPER_ADMIN"]);
  if (!authResult.success) {
    return authResult;
  }

  // 自分自身の削除を防止
  if (authResult.value.id === userId) {
    return {
      success: false,
      value: {
        code: "FORBIDDEN",
        cause: "自分自身を無効化することはできません",
      },
    };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return {
        success: false,
        value: { code: "NOT_FOUND", cause: "ユーザーが見つかりません" },
      };
    }

    // 論理削除（isActiveをfalseに設定）
    await prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });

    return {
      success: true,
      value: { id: userId },
    };
  } catch {
    return {
      success: false,
      value: {
        code: "DB_ERROR",
        cause: "ユーザーの削除に失敗しました",
      },
    };
  }
}
