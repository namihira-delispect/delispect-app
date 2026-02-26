import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ResetPasswordForm } from "../[id]/ResetPasswordForm";

// Server action mock
vi.mock("../actions", () => ({
  resetUserPassword: Object.assign(vi.fn(), {
    bind: vi.fn().mockReturnValue(vi.fn()),
  }),
}));

describe("ResetPasswordForm", () => {
  it("フォームが正しくレンダリングされる", () => {
    render(<ResetPasswordForm userId={1} />);

    expect(screen.getByTestId("reset-password-form")).toBeInTheDocument();
    expect(screen.getByTestId("input-newPassword")).toBeInTheDocument();
    expect(screen.getByTestId("input-confirmPassword")).toBeInTheDocument();
  });

  it("パスワードリセットボタンが表示される", () => {
    render(<ResetPasswordForm userId={1} />);

    expect(screen.getByTestId("submit-reset-password")).toHaveTextContent(
      "パスワードをリセット"
    );
  });

  it("パスワード入力フィールドが必須である", () => {
    render(<ResetPasswordForm userId={1} />);

    expect(screen.getByTestId("input-newPassword")).toBeRequired();
    expect(screen.getByTestId("input-confirmPassword")).toBeRequired();
  });

  it("パスワード入力フィールドのタイプがpasswordである", () => {
    render(<ResetPasswordForm userId={1} />);

    expect(screen.getByTestId("input-newPassword")).toHaveAttribute(
      "type",
      "password"
    );
    expect(screen.getByTestId("input-confirmPassword")).toHaveAttribute(
      "type",
      "password"
    );
  });
});
