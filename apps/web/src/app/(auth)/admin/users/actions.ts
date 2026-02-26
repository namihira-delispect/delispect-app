"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@delispect/db";
import { hashPassword, RoleName } from "@delispect/auth";
import { getSessionUser } from "@/lib/authService";
import {
  createUserSchema,
  updateUserSchema,
  resetPasswordSchema,
  userSearchParamsSchema,
} from "@/lib/userValidation";

const SESSION_COOKIE_NAME = "delispect_session";

/** アクション結果の型 */
export type ActionResult = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

/**
 * 現在のセッションユーザーが全権管理者であることを確認する
 */
async function requireSuperAdmin() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionId) {
    redirect("/login");
  }

  const user = await getSessionUser(sessionId);

  if (!user) {
    redirect("/login");
  }

  if (!user.roles.includes(RoleName.SUPER_ADMIN)) {
    return { authorized: false as const, user };
  }

  return { authorized: true as const, user };
}

/**
 * ユーザー一覧を取得する
 */
export async function getUsers(params: Record<string, unknown>) {
  const parsed = userSearchParamsSchema.safeParse(params);
  if (!parsed.success) {
    return { users: [], totalCount: 0, totalPages: 0 };
  }

  const { query, page, pageSize, sortKey, sortDirection, isActive } =
    parsed.data;

  const where = {
    ...(query
      ? {
          OR: [
            { username: { contains: query, mode: "insensitive" as const } },
            { firstName: { contains: query, mode: "insensitive" as const } },
            { lastName: { contains: query, mode: "insensitive" as const } },
            { email: { contains: query, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(isActive !== undefined ? { isActive } : {}),
  };

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
      orderBy: { [sortKey]: sortDirection },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.user.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    users: users.map((user) => ({
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
      roles: user.userRoles.map((ur) => ({
        id: ur.role.id,
        name: ur.role.name,
      })),
      createdAt: user.createdAt.toISOString(),
    })),
    totalCount,
    totalPages,
  };
}

/**
 * ユーザーを1件取得する
 */
export async function getUserById(id: number) {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      userRoles: {
        include: {
          role: true,
        },
      },
    },
  });

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    isActive: user.isActive,
    roles: user.userRoles.map((ur) => ({
      id: ur.role.id,
      name: ur.role.name,
    })),
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

/**
 * 全ロール一覧を取得する
 */
export async function getRoles() {
  const roles = await prisma.role.findMany({
    orderBy: { id: "asc" },
  });

  return roles.map((role) => ({
    id: role.id,
    name: role.name,
    description: role.description,
  }));
}

/**
 * ユーザーを新規登録する
 */
export async function createUser(
  _prevState: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  const authResult = await requireSuperAdmin();
  if (!authResult.authorized) {
    return { success: false, error: "この操作を行う権限がありません" };
  }

  const rawData = {
    username: formData.get("username"),
    email: formData.get("email"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    roleIds: formData.getAll("roleIds").map(Number),
    isActive: formData.get("isActive") === "true",
  };

  const parsed = createUserSchema.safeParse(rawData);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const error of parsed.error.errors) {
      const key = error.path.join(".");
      if (!fieldErrors[key]) {
        fieldErrors[key] = [];
      }
      fieldErrors[key].push(error.message);
    }
    return { success: false, error: "入力内容に誤りがあります", fieldErrors };
  }

  // ユーザーIDの重複チェック
  const existingByUsername = await prisma.user.findUnique({
    where: { username: parsed.data.username },
  });
  if (existingByUsername) {
    return {
      success: false,
      error: "入力内容に誤りがあります",
      fieldErrors: { username: ["このユーザーIDは既に使用されています"] },
    };
  }

  // メールアドレスの重複チェック
  const existingByEmail = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (existingByEmail) {
    return {
      success: false,
      error: "入力内容に誤りがあります",
      fieldErrors: {
        email: ["このメールアドレスは既に使用されています"],
      },
    };
  }

  const passwordHash = await hashPassword(parsed.data.password);

  await prisma.user.create({
    data: {
      username: parsed.data.username,
      email: parsed.data.email,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      passwordHash,
      isActive: parsed.data.isActive,
      userRoles: {
        create: parsed.data.roleIds.map((roleId) => ({
          roleId,
        })),
      },
    },
  });

  revalidatePath("/admin/users");
  redirect("/admin/users");
}

/**
 * ユーザー情報を更新する
 */
export async function updateUser(
  userId: number,
  _prevState: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  const authResult = await requireSuperAdmin();
  if (!authResult.authorized) {
    return { success: false, error: "この操作を行う権限がありません" };
  }

  const rawData = {
    email: formData.get("email"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    roleIds: formData.getAll("roleIds").map(Number),
    isActive: formData.get("isActive") === "true",
  };

  const parsed = updateUserSchema.safeParse(rawData);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const error of parsed.error.errors) {
      const key = error.path.join(".");
      if (!fieldErrors[key]) {
        fieldErrors[key] = [];
      }
      fieldErrors[key].push(error.message);
    }
    return { success: false, error: "入力内容に誤りがあります", fieldErrors };
  }

  // 対象ユーザーの存在確認
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!existingUser) {
    return { success: false, error: "対象のユーザーが見つかりません" };
  }

  // メールアドレスの重複チェック（自分以外）
  const existingByEmail = await prisma.user.findFirst({
    where: {
      email: parsed.data.email,
      id: { not: userId },
    },
  });
  if (existingByEmail) {
    return {
      success: false,
      error: "入力内容に誤りがあります",
      fieldErrors: {
        email: ["このメールアドレスは既に使用されています"],
      },
    };
  }

  // ユーザー情報の更新とロールの再設定
  await prisma.$transaction([
    prisma.userRole.deleteMany({
      where: { userId },
    }),
    prisma.user.update({
      where: { id: userId },
      data: {
        email: parsed.data.email,
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        isActive: parsed.data.isActive,
        userRoles: {
          create: parsed.data.roleIds.map((roleId) => ({
            roleId,
          })),
        },
      },
    }),
  ]);

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
  redirect("/admin/users");
}

/**
 * 管理者によるパスワードリセット
 */
export async function resetUserPassword(
  userId: number,
  _prevState: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  const authResult = await requireSuperAdmin();
  if (!authResult.authorized) {
    return { success: false, error: "この操作を行う権限がありません" };
  }

  const rawData = {
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  };

  const parsed = resetPasswordSchema.safeParse(rawData);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const error of parsed.error.errors) {
      const key = error.path.join(".");
      if (!fieldErrors[key]) {
        fieldErrors[key] = [];
      }
      fieldErrors[key].push(error.message);
    }
    return { success: false, error: "入力内容に誤りがあります", fieldErrors };
  }

  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!existingUser) {
    return { success: false, error: "対象のユーザーが見つかりません" };
  }

  const passwordHash = await hashPassword(parsed.data.newPassword);

  // パスワード更新、ロック解除、既存セッション無効化
  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash,
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    }),
    prisma.session.deleteMany({
      where: { userId },
    }),
  ]);

  return { success: true };
}

/**
 * ユーザーを無効化（論理削除）する
 */
export async function deactivateUser(userId: number): Promise<ActionResult> {
  const authResult = await requireSuperAdmin();
  if (!authResult.authorized) {
    return { success: false, error: "この操作を行う権限がありません" };
  }

  // 自分自身を無効化できないようにする
  if (authResult.user.id === userId) {
    return { success: false, error: "自分自身を無効化することはできません" };
  }

  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!existingUser) {
    return { success: false, error: "対象のユーザーが見つかりません" };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    }),
    prisma.session.deleteMany({
      where: { userId },
    }),
  ]);

  revalidatePath("/admin/users");
  return { success: true };
}
