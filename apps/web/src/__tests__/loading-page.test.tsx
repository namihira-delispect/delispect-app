import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import RootLoading from "../app/loading";

describe("RootLoading（ローディング状態）", () => {
  it("ローディング表示が表示される", () => {
    render(<RootLoading />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("ローディングメッセージが表示される", () => {
    render(<RootLoading />);
    expect(
      screen.getByText("ページを読み込んでいます..."),
    ).toBeInTheDocument();
  });
});
