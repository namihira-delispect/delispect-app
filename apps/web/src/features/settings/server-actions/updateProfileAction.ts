"use server";

import { prisma } from "@delispect/db";
import { getServerSession } from "@/lib/auth";
import { updateProfileSchema } from "../schemata";
import type { ProfileFormState } from "../types";

/**
 * プロフィール更新 Server Action
 */
export async function updateProfileAction(
  _prevState: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  // 認証チェック
  const session = await getServerSession();
  if (!session) {
    return {
      success: false,
      message: "認証が必要です。再度ログインしてください。",
    };
  }

  const rawInput = {
    username: formData.get("username") as string,
    email: formData.get("email") as string,
  };

  // バリデーション
  const parsed = updateProfileSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    // ユーザー名の重複チェック
    const existingUsername = await prisma.user.findFirst({
      where: {
        username: parsed.data.username,
        NOT: { id: session.userId },
      },
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
    const existingEmail = await prisma.user.findFirst({
      where: {
        email: parsed.data.email,
        NOT: { id: session.userId },
      },
    });

    if (existingEmail) {
      return {
        success: false,
        fieldErrors: {
          email: ["このメールアドレスは既に使用されています"],
        },
      };
    }

    // プロフィール更新
    await prisma.user.update({
      where: { id: session.userId },
      data: {
        username: parsed.data.username,
        email: parsed.data.email,
      },
    });

    return {
      success: true,
      message: "プロフィールを更新しました",
    };
  } catch {
    return {
      success: false,
      message: "プロフィールの更新に失敗しました。しばらく経ってから再度お試しください。",
    };
  }
}
