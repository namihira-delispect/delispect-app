import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { EditUserForm } from "../[id]/EditUserForm";

// Server action mock
vi.mock("../actions", () => ({
  updateUser: Object.assign(vi.fn(), {
    bind: vi.fn().mockReturnValue(vi.fn()),
  }),
}));

const mockUser = {
  id: 1,
  username: "admin",
  email: "admin@example.com",
  firstName: "太郎",
  lastName: "管理",
  isActive: true,
  roles: [{ id: 1, name: "SUPER_ADMIN" }],
};

const mockRoles = [
  { id: 1, name: "SUPER_ADMIN", description: "全権管理者" },
  { id: 2, name: "SYSTEM_ADMIN", description: "システム管理者" },
  { id: 3, name: "GENERAL_USER", description: "一般ユーザー" },
];

describe("EditUserForm", () => {
  it("フォームが正しくレンダリングされる", () => {
    render(<EditUserForm user={mockUser} roles={mockRoles} />);

    expect(screen.getByTestId("edit-user-form")).toBeInTheDocument();
  });

  it("ユーザーIDが読み取り専用で表示される", () => {
    render(<EditUserForm user={mockUser} roles={mockRoles} />);

    expect(screen.getByTestId("display-username")).toHaveTextContent("admin");
    expect(screen.getByText("ユーザーIDは変更できません")).toBeInTheDocument();
  });

  it("既存のユーザー情報がフォームに設定される", () => {
    render(<EditUserForm user={mockUser} roles={mockRoles} />);

    expect(screen.getByTestId("input-lastName")).toHaveValue("管理");
    expect(screen.getByTestId("input-firstName")).toHaveValue("太郎");
    expect(screen.getByTestId("input-email")).toHaveValue(
      "admin@example.com"
    );
  });

  it("現在のロールがチェック済みで表示される", () => {
    render(<EditUserForm user={mockUser} roles={mockRoles} />);

    expect(screen.getByTestId("role-checkbox-1")).toBeChecked();
    expect(screen.getByTestId("role-checkbox-2")).not.toBeChecked();
    expect(screen.getByTestId("role-checkbox-3")).not.toBeChecked();
  });

  it("有効状態のチェックボックスが現在の値で表示される", () => {
    render(<EditUserForm user={mockUser} roles={mockRoles} />);

    expect(screen.getByTestId("input-isActive")).toBeChecked();
  });

  it("無効ユーザーの場合、チェックボックスが未チェック", () => {
    const inactiveUser = { ...mockUser, isActive: false };
    render(<EditUserForm user={inactiveUser} roles={mockRoles} />);

    expect(screen.getByTestId("input-isActive")).not.toBeChecked();
  });

  it("更新ボタンが表示される", () => {
    render(<EditUserForm user={mockUser} roles={mockRoles} />);

    expect(screen.getByTestId("submit-edit-user")).toHaveTextContent("更新");
  });

  it("キャンセルリンクが一覧ページに遷移する", () => {
    render(<EditUserForm user={mockUser} roles={mockRoles} />);

    const cancelLink = screen.getByText("キャンセル");
    expect(cancelLink).toHaveAttribute("href", "/admin/users");
  });
});
