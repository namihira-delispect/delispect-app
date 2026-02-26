import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Loading } from "../Loading";

describe("Loading", () => {
  it("デフォルトの読み込みメッセージが表示される", () => {
    render(<Loading />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("読み込み中...")).toBeInTheDocument();
  });

  it("カスタムメッセージが表示される", () => {
    render(<Loading message="データを取得中..." />);
    expect(screen.getByText("データを取得中...")).toBeInTheDocument();
  });

  it("aria-labelにメッセージが設定される", () => {
    render(<Loading message="処理中です" />);
    expect(screen.getByRole("status")).toHaveAttribute(
      "aria-label",
      "処理中です",
    );
  });

  it("sizeプロパティを受け付ける", () => {
    const { container } = render(<Loading size="large" />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
