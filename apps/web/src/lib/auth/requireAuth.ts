import { redirect } from "next/navigation";
import type { UserRole, CurrentUser } from "@/shared/types";
import { getCurrentUser } from "./authorization";
import { hasAnyRole, canAccessPage } from "./authorization";

/**
 * Server Component用の認証・認可ガード
 *
 * 認証されていない場合はログインページにリダイレクトする。
 * ロールが不足している場合は403ページ（or トップ）にリダイレクトする。
 *
 * @param options - 必要なロール（省略時はログインのみチェック）
 * @returns 認証済みユーザー情報
 */
export async function requireAuth(options?: {
  roles?: UserRole[];
}): Promise<CurrentUser> {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  if (options?.roles && options.roles.length > 0) {
    if (!hasAnyRole(currentUser.roles, options.roles)) {
      redirect("/forbidden");
    }
  }

  return currentUser;
}

/**
 * パスベースのページアクセス制御（Server Component用）
 *
 * PAGE_ROLE_MAPに基づいてアクセスを検証する。
 *
 * @param pathname - 現在のパス
 * @returns 認証済みユーザー情報
 */
export async function requirePageAccess(
  pathname: string,
): Promise<CurrentUser> {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  if (!canAccessPage(currentUser.roles, pathname)) {
    redirect("/forbidden");
  }

  return currentUser;
}
