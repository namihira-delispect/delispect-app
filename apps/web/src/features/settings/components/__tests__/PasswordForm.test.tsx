import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { PasswordForm } from "../PasswordForm";

// Server Actionsのモック
vi.mock("../../server-actions/changePasswordAction", () => ({
  changePasswordAction: vi.fn(),
}));

describe("PasswordForm", () => {
  describe("レンダリング", () => {
    it("パスワード変更の見出しが表示される", () => {
      render(<PasswordForm />);
      expect(screen.getByText("パスワード変更")).toBeInTheDocument();
    });

    it("現在のパスワードの入力フィールドが表示される", () => {
      render(<PasswordForm />);
      expect(screen.getByLabelText("現在のパスワード")).toBeInTheDocument();
    });

    it("新しいパスワードの入力フィールドが表示される", () => {
      render(<PasswordForm />);
      expect(screen.getByLabelText("新しいパスワード")).toBeInTheDocument();
    });

    it("新しいパスワード（確認）の入力フィールドが表示される", () => {
      render(<PasswordForm />);
      expect(screen.getByLabelText("新しいパスワード（確認）")).toBeInTheDocument();
    });

    it("パスワード変更ボタンが表示される", () => {
      render(<PasswordForm />);
      expect(screen.getByTestId("password-submit")).toBeInTheDocument();
      expect(screen.getByTestId("password-submit")).toHaveTextContent("パスワードを変更する");
    });

    it("パスワード要件のヒントが表示される", () => {
      render(<PasswordForm />);
      expect(
        screen.getByText("12文字以上、大文字・小文字・数字・記号をそれぞれ含めてください"),
      ).toBeInTheDocument();
    });

    it("すべての入力フィールドがpasswordタイプである", () => {
      render(<PasswordForm />);
      const currentPassword = screen.getByLabelText("現在のパスワード");
      const newPassword = screen.getByLabelText("新しいパスワード");
      const confirmPassword = screen.getByLabelText("新しいパスワード（確認）");
      expect(currentPassword).toHaveAttribute("type", "password");
      expect(newPassword).toHaveAttribute("type", "password");
      expect(confirmPassword).toHaveAttribute("type", "password");
    });
  });
});
