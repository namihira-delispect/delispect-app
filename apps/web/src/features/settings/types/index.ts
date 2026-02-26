/** プロフィール更新フォームの状態 */
export type ProfileFormState = {
  success?: boolean;
  message?: string;
  fieldErrors?: {
    username?: string[];
    email?: string[];
  };
};

/** パスワード変更フォームの状態 */
export type PasswordFormState = {
  success?: boolean;
  message?: string;
  fieldErrors?: {
    currentPassword?: string[];
    newPassword?: string[];
    confirmPassword?: string[];
  };
};

/** ユーザープロフィール情報 */
export interface UserProfile {
  id: number;
  username: string;
  email: string;
}
