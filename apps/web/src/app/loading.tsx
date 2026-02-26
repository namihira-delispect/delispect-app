import { Loading } from "@/shared/components/Loading";

/**
 * ルートレイアウトのローディング状態
 *
 * Next.js App Routerの規約に従い、ページ遷移時のローディング状態を表示する。
 */
export default function RootLoading() {
  return <Loading size="large" message="ページを読み込んでいます..." />;
}
