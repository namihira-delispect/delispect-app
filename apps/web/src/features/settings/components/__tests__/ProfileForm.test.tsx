import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProfileForm } from "../ProfileForm";

// Server Actionsのモック
vi.mock("../../server-actions/updateProfileAction", () => ({
  updateProfileAction: vi.fn(),
}));

describe("ProfileForm", () => {
  const mockProfile = {
    id: 1,
    username: "testuser",
    email: "test@example.com",
  };

  describe("レンダリング", () => {
    it("アカウント情報の見出しが表示される", () => {
      render(<ProfileForm initialProfile={mockProfile} />);
      expect(screen.getByText("アカウント情報")).toBeInTheDocument();
    });

    it("ユーザー名の入力フィールドが表示される", () => {
      render(<ProfileForm initialProfile={mockProfile} />);
      const input = screen.getByLabelText("ユーザー名");
      expect(input).toBeInTheDocument();
      expect(input).toHaveValue("testuser");
    });

    it("メールアドレスの入力フィールドが表示される", () => {
      render(<ProfileForm initialProfile={mockProfile} />);
      const input = screen.getByLabelText("メールアドレス");
      expect(input).toBeInTheDocument();
      expect(input).toHaveValue("test@example.com");
    });

    it("更新ボタンが表示される", () => {
      render(<ProfileForm initialProfile={mockProfile} />);
      expect(screen.getByTestId("profile-submit")).toBeInTheDocument();
      expect(screen.getByTestId("profile-submit")).toHaveTextContent("更新する");
    });

    it("初期プロフィール情報が入力フィールドに表示される", () => {
      render(<ProfileForm initialProfile={mockProfile} />);
      expect(screen.getByLabelText("ユーザー名")).toHaveValue("testuser");
      expect(screen.getByLabelText("メールアドレス")).toHaveValue("test@example.com");
    });
  });
});
