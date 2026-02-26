import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Sidebar } from "../Sidebar";

// Next.js usePathname のモック
vi.mock("next/navigation", () => ({
  usePathname: () => "/patients",
}));

describe("Sidebar", () => {
  it("DELISPECTロゴが表示される", () => {
    render(<Sidebar userRoles={["SUPER_ADMIN"]} currentPath="/patients" />);
    expect(screen.getByText("DELISPECT")).toBeInTheDocument();
  });

  it("全権管理者にはすべてのメニューが表示される", () => {
    render(<Sidebar userRoles={["SUPER_ADMIN"]} currentPath="/patients" />);
    expect(screen.getByText("患者入院一覧")).toBeInTheDocument();
    expect(screen.getByText("管理")).toBeInTheDocument();
    expect(screen.getByText("個人設定")).toBeInTheDocument();
  });

  it("一般ユーザーには管理メニューが表示されない", () => {
    render(<Sidebar userRoles={["GENERAL"]} currentPath="/patients" />);
    expect(screen.getByText("患者入院一覧")).toBeInTheDocument();
    expect(screen.queryByText("管理")).not.toBeInTheDocument();
    expect(screen.getByText("個人設定")).toBeInTheDocument();
  });

  it("システム管理者には患者入院一覧が表示されない", () => {
    render(
      <Sidebar userRoles={["SYSTEM_ADMIN"]} currentPath="/admin/users" />,
    );
    expect(screen.queryByText("患者入院一覧")).not.toBeInTheDocument();
    expect(screen.getByText("管理")).toBeInTheDocument();
    expect(screen.getByText("個人設定")).toBeInTheDocument();
  });

  it("管理メニューをクリックするとサブメニューが展開される", async () => {
    const user = userEvent.setup();

    render(<Sidebar userRoles={["SUPER_ADMIN"]} currentPath="/patients" />);

    const adminButton = screen.getByText("管理");
    await user.click(adminButton);

    expect(screen.getByText("ユーザー管理")).toBeInTheDocument();
    expect(screen.getByText("薬剤マスタ")).toBeInTheDocument();
    expect(screen.getByText("基準値マスタ")).toBeInTheDocument();
    expect(screen.getByText("システム設定")).toBeInTheDocument();
    expect(screen.getByText("データマッピング")).toBeInTheDocument();
    expect(screen.getByText("監査ログ")).toBeInTheDocument();
  });

  it("管理サブページにいる場合、管理メニューが初期展開される", () => {
    render(
      <Sidebar userRoles={["SUPER_ADMIN"]} currentPath="/admin/users" />,
    );
    expect(screen.getByText("ユーザー管理")).toBeInTheDocument();
  });

  it("現在のパスのメニュー項目にaria-current=pageが設定される", () => {
    render(<Sidebar userRoles={["SUPER_ADMIN"]} currentPath="/patients" />);
    const link = screen.getByText("患者入院一覧").closest("a");
    expect(link).toHaveAttribute("aria-current", "page");
  });

  it("メインメニューにaria-labelが設定される", () => {
    render(<Sidebar userRoles={["SUPER_ADMIN"]} currentPath="/patients" />);
    expect(screen.getByLabelText("メインメニュー")).toBeInTheDocument();
  });
});
