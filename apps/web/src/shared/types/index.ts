/** Result型パターン: 成功/失敗を明示的に表す */
export type Result<T> = Success<T> | Failure;

interface Success<T> {
  success: true;
  value: T;
}

interface Failure {
  success: false;
  value: { code: string; cause: unknown };
}

/** ユーザーロール */
export type UserRole = "GENERAL" | "SYSTEM_ADMIN" | "SUPER_ADMIN";

/** ログインユーザー情報 */
export interface CurrentUser {
  id: number;
  username: string;
  email: string;
  roles: UserRole[];
}

/** ソート方向 */
export type SortDirection = "asc" | "desc";

/** ソート状態 */
export interface SortState {
  column: string;
  direction: SortDirection;
}

/** ページネーション状態 */
export interface PaginationState {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
}

/** ページサイズ選択肢 */
export const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;
export type PageSize = (typeof PAGE_SIZE_OPTIONS)[number] | "auto";
