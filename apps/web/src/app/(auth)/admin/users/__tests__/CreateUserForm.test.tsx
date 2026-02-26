import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { CreateUserForm } from "../new/CreateUserForm";

// Server action mock
vi.mock("../actions", () => ({
  createUser: vi.fn(),
}));

const mockRoles = [
  { id: 1, name: "SUPER_ADMIN", description: "全権管理者" },
  { id: 2, name: "SYSTEM_ADMIN", description: "システム管理者" },
  { id: 3, name: "GENERAL_USER", description: "一般ユーザー" },
];

describe("CreateUserForm", () => {
  it("フォームが正しくレンダリングされる", () => {
    render(<CreateUserForm roles={mockRoles} />);

    expect(screen.getByTestId("create-user-form")).toBeInTheDocument();
    expect(screen.getByTestId("input-username")).toBeInTheDocument();
    expect(screen.getByTestId("input-lastName")).toBeInTheDocument();
    expect(screen.getByTestId("input-firstName")).toBeInTheDocument();
    expect(screen.getByTestId("input-email")).toBeInTheDocument();
    expect(screen.getByTestId("input-password")).toBeInTheDocument();
    expect(screen.getByTestId("input-confirmPassword")).toBeInTheDocument();
  });

  it("ロールのチェックボックスが表示される", () => {
    render(<CreateUserForm roles={mockRoles} />);

    expect(screen.getByTestId("role-checkbox-1")).toBeInTheDocument();
    expect(screen.getByTestId("role-checkbox-2")).toBeInTheDocument();
    expect(screen.getByTestId("role-checkbox-3")).toBeInTheDocument();
  });

  it("ロール名が日本語で表示される", () => {
    render(<CreateUserForm roles={mockRoles} />);

    expect(screen.getByText("全権管理者")).toBeInTheDocument();
    expect(screen.getByText("システム管理者")).toBeInTheDocument();
    expect(screen.getByText("一般ユーザー")).toBeInTheDocument();
  });

  it("有効/無効のチェックボックスが表示される", () => {
    render(<CreateUserForm roles={mockRoles} />);

    const isActiveCheckbox = screen.getByTestId("input-isActive");
    expect(isActiveCheckbox).toBeInTheDocument();
    expect(isActiveCheckbox).toBeChecked();
  });

  it("登録ボタンが表示される", () => {
    render(<CreateUserForm roles={mockRoles} />);

    expect(screen.getByTestId("submit-create-user")).toHaveTextContent("登録");
  });

  it("キャンセルリンクが一覧ページに遷移する", () => {
    render(<CreateUserForm roles={mockRoles} />);

    const cancelLink = screen.getByText("キャンセル");
    expect(cancelLink).toHaveAttribute("href", "/admin/users");
  });

  it("必須項目にrequired属性が設定されている", () => {
    render(<CreateUserForm roles={mockRoles} />);

    expect(screen.getByTestId("input-username")).toBeRequired();
    expect(screen.getByTestId("input-lastName")).toBeRequired();
    expect(screen.getByTestId("input-firstName")).toBeRequired();
    expect(screen.getByTestId("input-email")).toBeRequired();
    expect(screen.getByTestId("input-password")).toBeRequired();
    expect(screen.getByTestId("input-confirmPassword")).toBeRequired();
  });
});
