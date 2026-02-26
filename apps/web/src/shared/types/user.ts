/** 認証済みユーザー情報 */
export type AuthUser = {
  id: number;
  username: string;
  email: string | null;
  firstName: string;
  lastName: string;
  roles: string[];
};
