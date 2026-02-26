"use client";

import { useState } from "react";
import type { NavItem } from "@/shared/constants";

type SidebarProps = {
  items: NavItem[];
  currentPath: string;
};

/**
 * サイドナビゲーション
 *
 * - メニュー項目の表示
 * - サブメニューの開閉
 * - 現在のパスに基づくアクティブ表示
 */
export function Sidebar({ items, currentPath }: SidebarProps) {
  return (
    <nav style={styles.sidebar} aria-label="メインナビゲーション" data-testid="sidebar">
      <ul style={styles.navList}>
        {items.map((item) => (
          <SidebarItem
            key={item.href}
            item={item}
            currentPath={currentPath}
          />
        ))}
      </ul>
    </nav>
  );
}

type SidebarItemProps = {
  item: NavItem;
  currentPath: string;
};

function SidebarItem({ item, currentPath }: SidebarItemProps) {
  const hasChildren = item.children && item.children.length > 0;
  const isActive = currentPath === item.href || currentPath.startsWith(item.href + "/");
  const isChildActive = hasChildren && item.children!.some(
    (child) => currentPath === child.href || currentPath.startsWith(child.href + "/")
  );

  const [isOpen, setIsOpen] = useState(isChildActive);

  const handleToggle = () => {
    if (hasChildren) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <li style={styles.navItem}>
      {hasChildren ? (
        <>
          <button
            onClick={handleToggle}
            style={{
              ...styles.navLink,
              ...((isActive || isChildActive) ? styles.navLinkActive : {}),
            }}
            aria-expanded={isOpen}
            data-testid={`sidebar-item-${item.href}`}
          >
            <span>{item.label}</span>
            <span
              style={{
                ...styles.chevron,
                ...(isOpen ? styles.chevronOpen : {}),
              }}
              aria-hidden="true"
            >
              &#9662;
            </span>
          </button>
          {isOpen && (
            <ul style={styles.subNavList} data-testid={`sidebar-submenu-${item.href}`}>
              {item.children!.map((child) => {
                const isSubActive = currentPath === child.href || currentPath.startsWith(child.href + "/");
                return (
                  <li key={child.href} style={styles.subNavItem}>
                    <a
                      href={child.href}
                      style={{
                        ...styles.subNavLink,
                        ...(isSubActive ? styles.subNavLinkActive : {}),
                      }}
                      data-testid={`sidebar-item-${child.href}`}
                    >
                      {child.label}
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
          style={{
            ...styles.navLink,
            ...(isActive ? styles.navLinkActive : {}),
          }}
          data-testid={`sidebar-item-${item.href}`}
        >
          <span>{item.label}</span>
        </a>
      )}
    </li>
  );
}

const styles: Record<string, React.CSSProperties> = {
  sidebar: {
    width: "240px",
    minWidth: "240px",
    backgroundColor: "#f8f9fa",
    borderRight: "1px solid #e0e0e0",
    overflowY: "auto",
    height: "100%",
  },
  navList: {
    listStyle: "none",
    margin: 0,
    padding: "0.5rem 0",
  },
  navItem: {
    margin: 0,
  },
  navLink: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    padding: "0.75rem 1.25rem",
    color: "#374151",
    textDecoration: "none",
    fontSize: "0.875rem",
    fontWeight: "500",
    border: "none",
    backgroundColor: "transparent",
    cursor: "pointer",
    transition: "background-color 0.15s",
    textAlign: "left" as const,
  },
  navLinkActive: {
    backgroundColor: "#e8eaf0",
    color: "#1a1a2e",
    fontWeight: "600",
  },
  chevron: {
    fontSize: "0.625rem",
    transition: "transform 0.2s",
    transform: "rotate(-90deg)",
  },
  chevronOpen: {
    transform: "rotate(0deg)",
  },
  subNavList: {
    listStyle: "none",
    margin: 0,
    padding: 0,
  },
  subNavItem: {
    margin: 0,
  },
  subNavLink: {
    display: "block",
    padding: "0.5rem 1.25rem 0.5rem 2.25rem",
    color: "#6b7280",
    textDecoration: "none",
    fontSize: "0.8125rem",
    transition: "background-color 0.15s, color 0.15s",
  },
  subNavLinkActive: {
    backgroundColor: "#e8eaf0",
    color: "#1a1a2e",
    fontWeight: "500",
  },
};
