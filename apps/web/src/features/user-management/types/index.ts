import type { UserRole } from "@/shared/types";

/** ユーザー一覧の1行分のデータ */
export interface UserListItem {
  id: number;
  username: string;
  email: string;
  isActive: boolean;
  roles: UserRole[];
  createdAt: string;
  updatedAt: string;
}

/** ユーザー一覧取得の結果 */
export interface UserListResult {
  users: UserListItem[];
  totalCount: number;
}

/** ユーザー詳細（編集用） */
export interface UserDetail {
  id: number;
  username: string;
  email: string;
  isActive: boolean;
  roles: UserRole[];
}

/** ユーザー登録フォームの状態 */
export type CreateUserFormState = {
  success?: boolean;
  message?: string;
  fieldErrors?: {
    username?: string[];
    email?: string[];
    password?: string[];
    confirmPassword?: string[];
    roles?: string[];
  };
};

/** ユーザー編集フォームの状態 */
export type UpdateUserFormState = {
  success?: boolean;
  message?: string;
  fieldErrors?: {
    username?: string[];
    email?: string[];
    password?: string[];
    confirmPassword?: string[];
    roles?: string[];
    isActive?: string[];
  };
};

/** ユーザー一覧のフィルタ条件 */
export interface UserListFilter {
  search?: string;
  role?: UserRole | "";
  isActive?: string;
  sortColumn?: string;
  sortDirection?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}
