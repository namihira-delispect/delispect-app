import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Header } from "../Header";
import type { AuthUser } from "@/shared/types";

const mockUser: AuthUser = {
  id: 1,
  username: "testuser",
  email: "test@example.com",
  firstName: "太郎",
  lastName: "山田",
  roles: ["GENERAL_USER"],
};

describe("Header", () => {
  it("ユーザー名が表示される", () => {
    render(<Header user={mockUser} onLogout={vi.fn()} />);

    expect(screen.getByTestId("header-user-name")).toHaveTextContent(
      "山田 太郎"
    );
  });

  it("ログアウトボタンが表示される", () => {
    render(<Header user={mockUser} onLogout={vi.fn()} />);

    expect(screen.getByTestId("header-logout-button")).toBeInTheDocument();
    expect(screen.getByTestId("header-logout-button")).toHaveTextContent(
      "ログアウト"
    );
  });

  it("アプリケーション名が表示される", () => {
    render(<Header user={mockUser} onLogout={vi.fn()} />);

    expect(screen.getByText("DELISPECT")).toBeInTheDocument();
  });

  it("サブタイトルが表示される", () => {
    render(<Header user={mockUser} onLogout={vi.fn()} />);

    expect(screen.getByText("せん妄リスク評価システム")).toBeInTheDocument();
  });
});
