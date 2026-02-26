import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { UserEditForm } from "../UserEditForm";
import type { UserDetail } from "../../types";

// Server Actionsのモック
vi.mock("../../server-actions/updateUserAction", () => ({
  updateUserAction: vi.fn(),
}));

describe("UserEditForm", () => {
  const mockUser: UserDetail = {
    id: 1,
    username: "testuser",
    email: "test@example.com",
    isActive: true,
    roles: ["GENERAL"],
  };

  describe("レンダリング", () => {
    it("ユーザー編集の見出しが表示される", () => {
      render(<UserEditForm user={mockUser} />);
      expect(screen.getByText("ユーザー編集")).toBeInTheDocument();
    });

    it("ユーザーIDが読み取り専用で表示される", () => {
      render(<UserEditForm user={mockUser} />);
      const userIdInput = screen.getByLabelText("ユーザーID");
      expect(userIdInput).toBeInTheDocument();
      expect(userIdInput).toBeDisabled();
    });

    it("ユーザー名の入力フィールドに現在値が表示される", () => {
      render(<UserEditForm user={mockUser} />);
      const input = screen.getByLabelText("ユーザー名");
      expect(input).toBeInTheDocument();
      expect(input).toHaveValue("testuser");
    });

    it("メールアドレスの入力フィールドに現在値が表示される", () => {
      render(<UserEditForm user={mockUser} />);
      const input = screen.getByLabelText("メールアドレス");
      expect(input).toBeInTheDocument();
      expect(input).toHaveValue("test@example.com");
    });

    it("パスワードフィールドが空で表示される", () => {
      render(<UserEditForm user={mockUser} />);
      expect(
        screen.getByLabelText("パスワード（変更する場合のみ入力）"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("空欄の場合はパスワードを変更しません"),
      ).toBeInTheDocument();
    });

    it("ロールチェックボックスが表示され、現在のロールがチェックされている", () => {
      render(<UserEditForm user={mockUser} />);
      const generalCheckbox = screen.getByLabelText(
        "一般ユーザー",
      ) as HTMLInputElement;
      expect(generalCheckbox.checked).toBe(true);

      const adminCheckbox = screen.getByLabelText(
        "全権管理者",
      ) as HTMLInputElement;
      expect(adminCheckbox.checked).toBe(false);
    });

    it("アカウント状態のラジオボタンが表示される", () => {
      render(<UserEditForm user={mockUser} />);
      const activeRadio = screen.getByLabelText("有効") as HTMLInputElement;
      expect(activeRadio.checked).toBe(true);

      const inactiveRadio = screen.getByLabelText("無効") as HTMLInputElement;
      expect(inactiveRadio.checked).toBe(false);
    });

    it("無効ユーザーの場合、無効が選択されている", () => {
      render(<UserEditForm user={{ ...mockUser, isActive: false }} />);
      const inactiveRadio = screen.getByLabelText("無効") as HTMLInputElement;
      expect(inactiveRadio.checked).toBe(true);
    });

    it("更新ボタンが表示される", () => {
      render(<UserEditForm user={mockUser} />);
      expect(screen.getByTestId("edit-user-submit")).toBeInTheDocument();
      expect(screen.getByTestId("edit-user-submit")).toHaveTextContent(
        "更新する",
      );
    });

    it("キャンセルリンクが表示される", () => {
      render(<UserEditForm user={mockUser} />);
      expect(screen.getByText("キャンセル")).toBeInTheDocument();
    });
  });
});
