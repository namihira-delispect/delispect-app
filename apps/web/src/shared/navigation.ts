import type { NavItem } from "./constants";

/**
 * ユーザーのロールに基づいてナビゲーション項目をフィルタリングする
 *
 * @param items - ナビゲーション項目の配列
 * @param userRoles - ユーザーが持つロールの配列
 * @returns ユーザーに表示可能なナビゲーション項目
 */
export function filterNavItemsByRole(
  items: NavItem[],
  userRoles: string[]
): NavItem[] {
  return items.filter((item) => {
    if (!item.allowedRoles) {
      return true;
    }
    return item.allowedRoles.some((role) => userRoles.includes(role));
  });
}
