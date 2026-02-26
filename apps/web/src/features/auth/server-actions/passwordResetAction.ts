"use server";

import { unlockAccount } from "@delispect/auth";
import { getServerSession } from "@/lib/auth";

type PasswordResetResult =
  | { success: true; value: { message: string } }
  | { success: false; value: { code: string; cause: string } };

/**
 * 管理者によるアカウントロック解除
 */
export async function passwordResetAction(
  userId: number,
): Promise<PasswordResetResult> {
  const session = await getServerSession();
  if (!session) {
    return {
      success: false,
      value: { code: "UNAUTHORIZED", cause: "認証が必要です" },
    };
  }

  try {
    await unlockAccount(userId);
    return {
      success: true,
      value: { message: "アカウントのロックを解除しました" },
    };
  } catch (error) {
    return {
      success: false,
      value: {
        code: "INTERNAL_ERROR",
        cause:
          error instanceof Error
            ? error.message
            : "ロック解除に失敗しました",
      },
    };
  }
}
