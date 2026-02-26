import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { UserCreateForm } from "../UserCreateForm";

// Server Actionsのモック
vi.mock("../../server-actions/createUserAction", () => ({
  createUserAction: vi.fn(),
}));

describe("UserCreateForm", () => {
  describe("レンダリング", () => {
    it("ユーザー登録の見出しが表示される", () => {
      render(<UserCreateForm />);
      expect(screen.getByText("ユーザー登録")).toBeInTheDocument();
    });

    it("ユーザー名の入力フィールドが表示される", () => {
      render(<UserCreateForm />);
      expect(screen.getByLabelText("ユーザー名")).toBeInTheDocument();
    });

    it("メールアドレスの入力フィールドが表示される", () => {
      render(<UserCreateForm />);
      expect(screen.getByLabelText("メールアドレス")).toBeInTheDocument();
    });

    it("パスワードの入力フィールドが表示される", () => {
      render(<UserCreateForm />);
      expect(screen.getByLabelText("パスワード")).toBeInTheDocument();
    });

    it("パスワード（確認）の入力フィールドが表示される", () => {
      render(<UserCreateForm />);
      expect(screen.getByLabelText("パスワード（確認）")).toBeInTheDocument();
    });

    it("ロール選択チェックボックスが表示される", () => {
      render(<UserCreateForm />);
      expect(screen.getByLabelText("一般ユーザー")).toBeInTheDocument();
      expect(screen.getByLabelText("システム管理者")).toBeInTheDocument();
      expect(screen.getByLabelText("全権管理者")).toBeInTheDocument();
    });

    it("登録ボタンが表示される", () => {
      render(<UserCreateForm />);
      expect(screen.getByTestId("create-user-submit")).toBeInTheDocument();
      expect(screen.getByTestId("create-user-submit")).toHaveTextContent(
        "登録する",
      );
    });

    it("キャンセルリンクが表示される", () => {
      render(<UserCreateForm />);
      expect(screen.getByText("キャンセル")).toBeInTheDocument();
    });
  });
});
