"use server";

import { prisma } from "@delispect/db";
import { getServerSession } from "@/lib/auth";
import type { Result } from "@/shared/types";
import type { UserProfile } from "../types";

/**
 * ログインユーザーのプロフィール情報を取得する
 */
export async function getProfileAction(): Promise<Result<UserProfile>> {
  const session = await getServerSession();
  if (!session) {
    return {
      success: false,
      value: { code: "UNAUTHORIZED", cause: "認証が必要です" },
    };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        username: true,
        email: true,
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
      value: user,
    };
  } catch {
    return {
      success: false,
      value: { code: "INTERNAL_ERROR", cause: "プロフィールの取得に失敗しました" },
    };
  }
}
