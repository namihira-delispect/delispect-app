import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Header } from "../Header";

describe("Header", () => {
  it("ユーザー名が表示される", () => {
    render(<Header username="テストユーザー" onLogout={vi.fn()} />);
    expect(screen.getByTestId("header-username")).toHaveTextContent(
      "テストユーザー",
    );
  });

  it("ログアウトボタンが表示される", () => {
    render(<Header username="テストユーザー" onLogout={vi.fn()} />);
    expect(screen.getByLabelText("ログアウト")).toBeInTheDocument();
  });

  it("ログアウトボタンをクリックするとonLogoutが呼ばれる", async () => {
    const user = userEvent.setup();
    const onLogout = vi.fn();

    render(<Header username="テストユーザー" onLogout={onLogout} />);

    await user.click(screen.getByLabelText("ログアウト"));
    expect(onLogout).toHaveBeenCalledTimes(1);
  });

  it("banner roleが設定される", () => {
    render(<Header username="テストユーザー" onLogout={vi.fn()} />);
    expect(screen.getByRole("banner")).toBeInTheDocument();
  });
});
