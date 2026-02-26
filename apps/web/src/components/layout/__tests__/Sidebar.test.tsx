import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Sidebar } from "../Sidebar";
import type { NavItem } from "@/shared/constants";

const mockItems: NavItem[] = [
  { label: "患者入院一覧", href: "/patients" },
  {
    label: "管理",
    href: "/admin",
    children: [
      { label: "ユーザー管理", href: "/admin/users" },
      { label: "薬剤マスタ", href: "/admin/medicines" },
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

describe("Sidebar", () => {
  it("メニュー項目が表示される", () => {
    render(<Sidebar items={mockItems} currentPath="/" />);

    expect(screen.getByText("患者入院一覧")).toBeInTheDocument();
    expect(screen.getByText("管理")).toBeInTheDocument();
    expect(screen.getByText("個人設定")).toBeInTheDocument();
  });

  it("サブメニューをクリックで展開できる", () => {
    render(<Sidebar items={mockItems} currentPath="/" />);

    // サブメニューは初期状態で非表示
    expect(screen.queryByText("ユーザー管理")).not.toBeInTheDocument();

    // 管理メニューをクリック
    fireEvent.click(screen.getByText("管理"));

    // サブメニューが表示される
    expect(screen.getByText("ユーザー管理")).toBeInTheDocument();
    expect(screen.getByText("薬剤マスタ")).toBeInTheDocument();
  });

  it("サブメニューを再クリックで折りたためる", () => {
    render(<Sidebar items={mockItems} currentPath="/" />);

    // 展開
    fireEvent.click(screen.getByText("管理"));
    expect(screen.getByText("ユーザー管理")).toBeInTheDocument();

    // 折りたたみ
    fireEvent.click(screen.getByText("管理"));
    expect(screen.queryByText("ユーザー管理")).not.toBeInTheDocument();
  });

  it("子ページがアクティブの場合、親メニューのサブメニューが自動展開される", () => {
    render(<Sidebar items={mockItems} currentPath="/admin/users" />);

    // 管理メニューのサブメニューが展開されている
    expect(screen.getByText("ユーザー管理")).toBeInTheDocument();
  });

  it("ナビゲーションのaria-labelが設定されている", () => {
    render(<Sidebar items={mockItems} currentPath="/" />);

    expect(screen.getByLabelText("メインナビゲーション")).toBeInTheDocument();
  });
});
