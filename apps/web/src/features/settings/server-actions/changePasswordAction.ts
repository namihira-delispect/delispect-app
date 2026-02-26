"use server";

import { prisma } from "@delispect/db";
import { verifyPassword, hashPassword } from "@delispect/auth";
import { getServerSession } from "@/lib/auth";
import { changePasswordSchema } from "../schemata";
import type { PasswordFormState } from "../types";

/**
 * パスワード変更 Server Action
 */
export async function changePasswordAction(
  _prevState: PasswordFormState,
  formData: FormData,
): Promise<PasswordFormState> {
  // 認証チェック
  const session = await getServerSession();
  if (!session) {
    return {
      success: false,
      message: "認証が必要です。再度ログインしてください。",
    };
  }

  const rawInput = {
    currentPassword: formData.get("currentPassword") as string,
    newPassword: formData.get("newPassword") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  // バリデーション
  const parsed = changePasswordSchema.safeParse(rawInput);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return {
      success: false,
      fieldErrors: {
        currentPassword: fieldErrors.currentPassword,
        newPassword: fieldErrors.newPassword,
        confirmPassword: fieldErrors.confirmPassword,
      },
    };
  }

  try {
    // 現在のパスワードハッシュを取得
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { passwordHash: true },
    });

    if (!user) {
      return {
        success: false,
        message: "ユーザーが見つかりません。",
      };
    }

    // 現在のパスワード検証
    const isCurrentPasswordValid = await verifyPassword(
      parsed.data.currentPassword,
      user.passwordHash,
    );

    if (!isCurrentPasswordValid) {
      return {
        success: false,
        fieldErrors: {
          currentPassword: ["現在のパスワードが正しくありません"],
        },
      };
    }

    // 新しいパスワードをハッシュ化して更新
    const newPasswordHash = await hashPassword(parsed.data.newPassword);
    await prisma.user.update({
      where: { id: session.userId },
      data: { passwordHash: newPasswordHash },
    });

    return {
      success: true,
      message: "パスワードを変更しました",
    };
  } catch {
    return {
      success: false,
      message: "パスワードの変更に失敗しました。しばらく経ってから再度お試しください。",
    };
  }
}
