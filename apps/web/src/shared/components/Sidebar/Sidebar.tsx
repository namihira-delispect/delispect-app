"use client";

import { useState, type CSSProperties } from "react";
import type { UserRole } from "@/shared/types";

export interface SidebarProps {
  /** ログインユーザーのロール一覧 */
  userRoles: UserRole[];
  /** 現在のパス */
  currentPath: string;
}

interface MenuItem {
  label: string;
  href: string;
  icon: string;
  children?: MenuItem[];
  /** 閲覧可能なロール（指定なし = 全ロール） */
  allowedRoles?: UserRole[];
}

const MENU_ITEMS: MenuItem[] = [
  {
    label: "患者入院一覧",
    href: "/patients",
    icon: "\uD83C\uDFE5",
    allowedRoles: ["GENERAL", "SUPER_ADMIN"],
  },
  {
    label: "管理",
    href: "/admin",
    icon: "\u2699\uFE0F",
    allowedRoles: ["SYSTEM_ADMIN", "SUPER_ADMIN"],
    children: [
      { label: "ユーザー管理", href: "/admin/users", icon: "\uD83D\uDC65" },
      { label: "薬剤マスタ", href: "/admin/medicines", icon: "\uD83D\uDC8A" },
      { label: "基準値マスタ", href: "/admin/reference-values", icon: "\uD83D\uDCCA" },
      { label: "システム設定", href: "/admin/system-settings", icon: "\uD83D\uDD27" },
      { label: "データマッピング", href: "/admin/data-mapping", icon: "\uD83D\uDD17" },
      { label: "監査ログ", href: "/admin/audit-logs", icon: "\uD83D\uDCDD" },
    ],
  },
  {
    label: "個人設定",
    href: "/settings",
    icon: "\uD83D\uDC64",
  },
];

const sidebarStyle: CSSProperties = {
  width: "16rem",
  minHeight: "100vh",
  backgroundColor: "#1e293b",
  color: "#e2e8f0",
  display: "flex",
  flexDirection: "column",
  flexShrink: 0,
};

const logoStyle: CSSProperties = {
  padding: "1.25rem 1rem",
  fontSize: "1.25rem",
  fontWeight: 700,
  color: "#ffffff",
  borderBottom: "1px solid #334155",
  letterSpacing: "0.05em",
};

const navStyle: CSSProperties = {
  flex: 1,
  padding: "0.5rem 0",
  overflowY: "auto",
};

const menuItemStyle = (isActive: boolean): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  padding: "0.625rem 1rem",
  color: isActive ? "#ffffff" : "#cbd5e1",
  backgroundColor: isActive ? "#334155" : "transparent",
  textDecoration: "none",
  fontSize: "0.875rem",
  cursor: "pointer",
  border: "none",
  width: "100%",
  textAlign: "left",
});

const subMenuStyle: CSSProperties = {
  paddingLeft: "1.5rem",
};

const subMenuItemStyle = (isActive: boolean): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  padding: "0.5rem 1rem",
  color: isActive ? "#ffffff" : "#94a3b8",
  backgroundColor: isActive ? "#334155" : "transparent",
  textDecoration: "none",
  fontSize: "0.8125rem",
  cursor: "pointer",
  border: "none",
  width: "100%",
  textAlign: "left",
});

const expandIconStyle = (isExpanded: boolean): CSSProperties => ({
  marginLeft: "auto",
  fontSize: "0.625rem",
  transition: "transform 0.2s",
  transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
});

/** メニュー項目がユーザーロールに基づいて表示可能か判定 */
function isMenuVisible(item: MenuItem, userRoles: UserRole[]): boolean {
  if (!item.allowedRoles) return true;
  return item.allowedRoles.some((role) => userRoles.includes(role));
}

/**
 * サイドバーナビゲーションコンポーネント
 *
 * ロールに応じたメニュー表示制御を行う。
 */
export function Sidebar({ userRoles, currentPath }: SidebarProps) {
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(() => {
    // 現在のパスに合致するメニューを初期展開
    const expanded = new Set<string>();
    for (const item of MENU_ITEMS) {
      if (item.children?.some((child) => currentPath.startsWith(child.href))) {
        expanded.add(item.href);
      }
    }
    return expanded;
  });

  const toggleMenu = (href: string) => {
    setExpandedMenus((prev) => {
      const next = new Set(prev);
      if (next.has(href)) {
        next.delete(href);
      } else {
        next.add(href);
      }
      return next;
    });
  };

  const visibleItems = MENU_ITEMS.filter((item) =>
    isMenuVisible(item, userRoles),
  );

  return (
    <aside style={sidebarStyle} role="navigation" aria-label="メインメニュー">
      <div style={logoStyle}>DELISPECT</div>
      <nav style={navStyle}>
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {visibleItems.map((item) => {
            const isActive = currentPath === item.href;
            const isExpanded = expandedMenus.has(item.href);
            const hasChildren = item.children && item.children.length > 0;

            return (
              <li key={item.href}>
                {hasChildren ? (
                  <>
                    <button
                      type="button"
                      style={menuItemStyle(isActive)}
                      onClick={() => toggleMenu(item.href)}
                      aria-expanded={isExpanded}
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                      <span style={expandIconStyle(isExpanded)}>&#9654;</span>
                    </button>
                    {isExpanded && (
                      <ul
                        style={{
                          ...subMenuStyle,
                          listStyle: "none",
                          margin: 0,
                          padding: 0,
                          paddingLeft: "1.5rem",
                        }}
                      >
                        {item.children!.map((child) => {
                          const isChildActive = currentPath === child.href;
                          return (
                            <li key={child.href}>
                              <a
                                href={child.href}
                                style={subMenuItemStyle(isChildActive)}
                                aria-current={isChildActive ? "page" : undefined}
                              >
                                <span>{child.icon}</span>
                                <span>{child.label}</span>
                              </a>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </>
                ) : (
                  <a
                    href={item.href}
                    style={menuItemStyle(isActive)}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
