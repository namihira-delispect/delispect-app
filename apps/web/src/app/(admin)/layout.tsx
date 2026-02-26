import type { ReactNode } from "react";

/**
 * 管理画面レイアウト
 *
 * 管理者向けのページで共通に使用するレイアウト。
 * 認証・認可チェックは各ページコンポーネント内で行う。
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
