import { prisma } from "@delispect/db";
import type { UserRole, CurrentUser, Result } from "@/shared/types";
import {
  ROLE_PERMISSIONS,
  PAGE_ROLE_MAP,
  type PermissionCode,
} from "./permissions";
import { getServerSession } from "./getServerSession";

/**
 * ユーザーのロール一覧をDBから取得する
 */
export async function getUserRoles(userId: number): Promise<UserRole[]> {
  const userRoles = await prisma.userRole.findMany({
    where: { userId },
    include: { role: true },
  });

  return userRoles.map((ur) => ur.role.name as UserRole);
}

/**
 * ログインユーザー情報をDBから取得する（ロール付き）
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await getServerSession();
  if (!session) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      username: true,
      email: true,
    },
  });

  if (!user) {
    return null;
  }

  const roles = await getUserRoles(user.id);

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    roles,
  };
}

/**
 * ユーザーが特定のロールを持っているか判定する
 */
export function hasRole(userRoles: UserRole[], requiredRole: UserRole): boolean {
  return userRoles.includes(requiredRole);
}

/**
 * ユーザーが必要なロールのいずれかを持っているか判定する
 */
export function hasAnyRole(
  userRoles: UserRole[],
  requiredRoles: UserRole[],
): boolean {
  return requiredRoles.some((role) => userRoles.includes(role));
}

/**
 * ロール一覧から権限コード一覧を導出する
 */
export function getPermissionsForRoles(roles: UserRole[]): PermissionCode[] {
  const permissionSet = new Set<PermissionCode>();
  for (const role of roles) {
    const perms = ROLE_PERMISSIONS[role];
    if (perms) {
      for (const perm of perms) {
        permissionSet.add(perm);
      }
    }
  }
  return Array.from(permissionSet);
}

/**
 * ユーザーが特定の権限を持っているか判定する
 */
export function hasPermission(
  userRoles: UserRole[],
  permission: PermissionCode,
): boolean {
  const permissions = getPermissionsForRoles(userRoles);
  return permissions.includes(permission);
}

/**
 * ユーザーが必要な権限のいずれかを持っているか判定する
 */
export function hasAnyPermission(
  userRoles: UserRole[],
  requiredPermissions: PermissionCode[],
): boolean {
  const permissions = getPermissionsForRoles(userRoles);
  return requiredPermissions.some((perm) => permissions.includes(perm));
}

/**
 * ユーザーが必要な権限をすべて持っているか判定する
 */
export function hasAllPermissions(
  userRoles: UserRole[],
  requiredPermissions: PermissionCode[],
): boolean {
  const permissions = getPermissionsForRoles(userRoles);
  return requiredPermissions.every((perm) => permissions.includes(perm));
}

/**
 * 指定パスにアクセスできるか判定する
 *
 * PAGE_ROLE_MAPに登録されていないパスはアクセス可能とする。
 * マッチングは最も長いプレフィックスを優先する。
 */
export function canAccessPage(
  userRoles: UserRole[],
  pathname: string,
): boolean {
  // 最も長いプレフィックスマッチを見つける
  const matchingPaths = Object.keys(PAGE_ROLE_MAP)
    .filter((path) => pathname === path || pathname.startsWith(path + "/"))
    .sort((a, b) => b.length - a.length);

  if (matchingPaths.length === 0) {
    // マッピングにないパスはアクセス可能
    return true;
  }

  const bestMatch = matchingPaths[0];
  const allowedRoles = PAGE_ROLE_MAP[bestMatch];
  return hasAnyRole(userRoles, allowedRoles);
}

/**
 * Server Action用の認証・認可チェック
 *
 * セッション検証 + 権限チェックを一括で行う。
 * 認証されていない場合やロールが不足している場合はResult型のエラーを返す。
 */
export async function authorizeServerAction(
  requiredRoles?: UserRole[],
): Promise<Result<CurrentUser>> {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return {
      success: false,
      value: { code: "UNAUTHORIZED", cause: "認証が必要です" },
    };
  }

  if (requiredRoles && requiredRoles.length > 0) {
    if (!hasAnyRole(currentUser.roles, requiredRoles)) {
      return {
        success: false,
        value: { code: "FORBIDDEN", cause: "この操作を実行する権限がありません" },
      };
    }
  }

  return { success: true, value: currentUser };
}

/**
 * Server Action用の権限ベース認可チェック
 *
 * セッション検証 + 権限コードベースのチェックを一括で行う。
 */
export async function authorizeServerActionByPermission(
  requiredPermissions: PermissionCode[],
): Promise<Result<CurrentUser>> {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return {
      success: false,
      value: { code: "UNAUTHORIZED", cause: "認証が必要です" },
    };
  }

  if (!hasAnyPermission(currentUser.roles, requiredPermissions)) {
    return {
      success: false,
      value: { code: "FORBIDDEN", cause: "この操作を実行する権限がありません" },
    };
  }

  return { success: true, value: currentUser };
}
