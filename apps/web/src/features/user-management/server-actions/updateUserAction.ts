"use server";

import { prisma } from "@delispect/db";
import { hashPassword } from "@delispect/auth";
import { authorizeServerAction } from "@/lib/auth";
import { updateUserSchema } from "../schemata";
import type { UpdateUserFormState } from "../types";

/**
 * ユーザー編集 Server Action（全権管理者のみ）
 */
export async function updateUserAction(
  userId: number,
  _prevState: UpdateUserFormState,
  formData: FormData,
): Promise<UpdateUserFormState> {
  // 認可チェック: 全権管理者のみ
  const authResult = await authorizeServerAction(["SUPER_ADMIN"]);
  if (!authResult.success) {
    return {
      success: false,
      message:
        authResult.value.code === "UNAUTHORIZED"
          ? "認証が必要です。再度ログインしてください。"
          : "この操作を実行する権限がありません。",
    };
  }

  const rawInput = {
    username: formData.get("username") as string,
    email: formData.get("email") as string,
    password: (formData.get("password") as string) || "",
    confirmPassword: (formData.get("confirmPassword") as string) || "",
    roles: formData.getAll("roles") as string[],
    isActive: formData.get("isActive") === "true",
  };

  // バリデーション
  const parsed = updateUserSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors as UpdateUserFormState["fieldErrors"],
    };
  }

  try {
    // ユーザー存在チェック
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return {
        success: false,
        message: "ユーザーが見つかりません",
      };
    }

    // ユーザー名の重複チェック（自分以外）
    const duplicateUsername = await prisma.user.findFirst({
      where: {
        username: parsed.data.username,
        NOT: { id: userId },
      },
    });

    if (duplicateUsername) {
      return {
        success: false,
        fieldErrors: {
          username: ["このユーザー名は既に使用されています"],
        },
      };
    }

    // メールアドレスの重複チェック（自分以外）
    const duplicateEmail = await prisma.user.findFirst({
      where: {
        email: parsed.data.email,
        NOT: { id: userId },
      },
    });

    if (duplicateEmail) {
      return {
        success: false,
        fieldErrors: {
          email: ["このメールアドレスは既に使用されています"],
        },
      };
    }

    // ロールIDの取得
    const roles = await prisma.role.findMany({
      where: { name: { in: parsed.data.roles } },
    });

    if (roles.length !== parsed.data.roles.length) {
      return {
        success: false,
        fieldErrors: {
          roles: ["無効なロールが指定されています"],
        },
      };
    }

    // ユーザー更新（トランザクション）
    await prisma.$transaction(async (tx) => {
      // ユーザー情報の更新
      const updateData: Record<string, unknown> = {
        username: parsed.data.username,
        email: parsed.data.email,
        isActive: parsed.data.isActive,
      };

      // パスワードが入力されている場合のみ更新
      if (parsed.data.password && parsed.data.password !== "") {
        updateData.passwordHash = await hashPassword(parsed.data.password);
        // パスワード変更時はログイン失敗回数をリセット
        updateData.failedLoginAttempts = 0;
        updateData.lockedUntil = null;
      }

      await tx.user.update({
        where: { id: userId },
        data: updateData,
      });

      // ロールの再設定（一度削除して再作成）
      await tx.userRole.deleteMany({
        where: { userId },
      });

      await tx.userRole.createMany({
        data: roles.map((role) => ({
          userId,
          roleId: role.id,
        })),
      });
    });

    return {
      success: true,
      message: "ユーザー情報を更新しました",
    };
  } catch {
    return {
      success: false,
      message:
        "ユーザー情報の更新に失敗しました。しばらく経ってから再度お試しください。",
    };
  }
}
