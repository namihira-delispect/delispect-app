"use server";

import { prisma } from "@delispect/db";
import { hashPassword } from "@delispect/auth";
import { authorizeServerAction } from "@/lib/auth";
import { createUserSchema } from "../schemata";
import type { CreateUserFormState } from "../types";

/**
 * ユーザー登録 Server Action（全権管理者のみ）
 */
export async function createUserAction(
  _prevState: CreateUserFormState,
  formData: FormData,
): Promise<CreateUserFormState> {
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
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
    roles: formData.getAll("roles") as string[],
  };

  // バリデーション
  const parsed = createUserSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors as CreateUserFormState["fieldErrors"],
    };
  }

  try {
    // ユーザー名の重複チェック
    const existingUsername = await prisma.user.findUnique({
      where: { username: parsed.data.username },
    });

    if (existingUsername) {
      return {
        success: false,
        fieldErrors: {
          username: ["このユーザー名は既に使用されています"],
        },
      };
    }

    // メールアドレスの重複チェック
    const existingEmail = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    });

    if (existingEmail) {
      return {
        success: false,
        fieldErrors: {
          email: ["このメールアドレスは既に使用されています"],
        },
      };
    }

    // パスワードハッシュ化
    const passwordHash = await hashPassword(parsed.data.password);

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

    // ユーザー作成（トランザクション）
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          username: parsed.data.username,
          email: parsed.data.email,
          passwordHash,
          isActive: true,
        },
      });

      await tx.userRole.createMany({
        data: roles.map((role) => ({
          userId: user.id,
          roleId: role.id,
        })),
      });
    });

    return {
      success: true,
      message: "ユーザーを登録しました",
    };
  } catch {
    return {
      success: false,
      message:
        "ユーザーの登録に失敗しました。しばらく経ってから再度お試しください。",
    };
  }
}
