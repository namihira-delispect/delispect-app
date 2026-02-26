import { RoleName } from "@delispect/auth";

/** ナビゲーション項目の型 */
export type NavItem = {
  /** メニュー表示名 */
  label: string;
  /** 遷移先パス */
  href: string;
  /** この項目を表示するロール（undefinedの場合は全ロールに表示） */
  allowedRoles?: RoleName[];
  /** サブメニュー項目 */
  children?: NavItem[];
};

/** 管理メニューを表示可能なロール */
const ADMIN_ROLES: RoleName[] = [RoleName.SYSTEM_ADMIN, RoleName.SUPER_ADMIN];

/** サイドナビゲーションのメニュー定義 */
export const NAV_ITEMS: NavItem[] = [
  {
    label: "患者入院一覧",
    href: "/patients",
  },
  {
    label: "管理",
    href: "/admin",
    allowedRoles: ADMIN_ROLES,
    children: [
      { label: "ユーザー管理", href: "/admin/users" },
      { label: "薬剤マスタ", href: "/admin/medicines" },
      { label: "基準値マスタ", href: "/admin/reference-values" },
      { label: "システム設定", href: "/admin/settings" },
      { label: "データマッピング", href: "/admin/data-mapping" },
      { label: "監査ログ", href: "/admin/audit-logs" },
    ],
  },
  {
    label: "個人設定",
    href: "/settings",
    children: [
      { label: "アカウント情報変更", href: "/settings/account" },
      { label: "パスワード変更", href: "/settings/password" },
    ],
  },
];

/** デフォルトのページサイズ */
export const DEFAULT_PAGE_SIZE = 20;

/** ページサイズの選択肢 */
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

/** ソート方向 */
export const SortDirection = {
  ASC: "asc",
  DESC: "desc",
} as const;

export type SortDirection = (typeof SortDirection)[keyof typeof SortDirection];
