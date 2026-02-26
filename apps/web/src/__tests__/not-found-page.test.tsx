import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import NotFound from "../app/not-found";

// Next.jsのLinkコンポーネントをモック
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    style,
  }: {
    children: React.ReactNode;
    href: string;
    style?: React.CSSProperties;
  }) => (
    <a href={href} style={style}>
      {children}
    </a>
  ),
}));

import { vi } from "vitest";

describe("NotFoundPage（404エラー）", () => {
  it("404エラーコードが表示される", () => {
    render(<NotFound />);
    expect(screen.getByText("404")).toBeInTheDocument();
  });

  it("ページが見つからない旨のメッセージが表示される", () => {
    render(<NotFound />);
    expect(screen.getByText("ページが見つかりません")).toBeInTheDocument();
    expect(screen.getByText(/お探しのページは存在しない/)).toBeInTheDocument();
  });

  it("トップページへのリンクが表示される", () => {
    render(<NotFound />);
    const link = screen.getByText("トップページへ戻る");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/");
  });
});
