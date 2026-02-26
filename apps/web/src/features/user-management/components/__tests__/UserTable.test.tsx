import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { UserTable } from "../UserTable";
import type { UserListItem } from "../../types";

describe("UserTable", () => {
  const mockUsers: UserListItem[] = [
    {
      id: 1,
      username: "admin",
      email: "admin@example.com",
      isActive: true,
      roles: ["SUPER_ADMIN"],
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    },
    {
      id: 2,
      username: "nurse01",
      email: "nurse01@example.com",
      isActive: true,
      roles: ["GENERAL"],
      createdAt: "2024-01-02T00:00:00.000Z",
      updatedAt: "2024-01-02T00:00:00.000Z",
    },
    {
      id: 3,
      username: "inactive_user",
      email: "inactive@example.com",
      isActive: false,
      roles: ["GENERAL"],
      createdAt: "2024-01-03T00:00:00.000Z",
      updatedAt: "2024-01-03T00:00:00.000Z",
    },
  ];

  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  describe("レンダリング", () => {
    it("ユーザー一覧テーブルが表示される", () => {
      render(
        <UserTable
          users={mockUsers}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />,
      );
      expect(screen.getByTestId("user-table")).toBeInTheDocument();
    });

    it("すべてのユーザー行が表示される", () => {
      render(
        <UserTable
          users={mockUsers}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />,
      );
      expect(screen.getByTestId("user-row-1")).toBeInTheDocument();
      expect(screen.getByTestId("user-row-2")).toBeInTheDocument();
      expect(screen.getByTestId("user-row-3")).toBeInTheDocument();
    });

    it("ユーザー名が表示される", () => {
      render(
        <UserTable
          users={mockUsers}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />,
      );
      expect(screen.getByText("admin")).toBeInTheDocument();
      expect(screen.getByText("nurse01")).toBeInTheDocument();
    });

    it("メールアドレスが表示される", () => {
      render(
        <UserTable
          users={mockUsers}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />,
      );
      expect(screen.getByText("admin@example.com")).toBeInTheDocument();
      expect(screen.getByText("nurse01@example.com")).toBeInTheDocument();
    });

    it("ロールラベルが表示される", () => {
      render(
        <UserTable
          users={mockUsers}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />,
      );
      expect(screen.getByText("全権管理者")).toBeInTheDocument();
      expect(screen.getAllByText("一般ユーザー")).toHaveLength(2);
    });

    it("有効/無効のステータスバッジが表示される", () => {
      render(
        <UserTable
          users={mockUsers}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />,
      );
      expect(screen.getAllByText("有効")).toHaveLength(2);
      expect(screen.getByText("無効")).toBeInTheDocument();
    });

    it("ユーザーが0件の場合に空メッセージが表示される", () => {
      render(
        <UserTable users={[]} onEdit={mockOnEdit} onDelete={mockOnDelete} />,
      );
      expect(screen.getByTestId("user-table-empty")).toBeInTheDocument();
      expect(
        screen.getByText("ユーザーが見つかりませんでした"),
      ).toBeInTheDocument();
    });
  });

  describe("操作", () => {
    it("編集ボタンクリックでonEditが呼ばれる", () => {
      render(
        <UserTable
          users={mockUsers}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />,
      );
      fireEvent.click(screen.getByTestId("edit-user-1"));
      expect(mockOnEdit).toHaveBeenCalledWith(1);
    });

    it("無効化ボタンクリックでonDeleteが呼ばれる", () => {
      render(
        <UserTable
          users={mockUsers}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />,
      );
      fireEvent.click(screen.getByTestId("delete-user-2"));
      expect(mockOnDelete).toHaveBeenCalledWith(mockUsers[1]);
    });
  });
});
