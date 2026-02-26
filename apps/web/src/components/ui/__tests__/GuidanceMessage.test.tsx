import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { GuidanceMessage } from "../GuidanceMessage";

describe("GuidanceMessage", () => {
  it("ガイダンスメッセージが表示される", () => {
    render(<GuidanceMessage message="入力してください" />);

    expect(screen.getByTestId("guidance-message")).toBeInTheDocument();
    expect(screen.getByText("入力してください")).toBeInTheDocument();
  });

  it("role=statusが設定される", () => {
    render(<GuidanceMessage message="メッセージ" />);

    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("デフォルトでinfoバリアントが適用される", () => {
    render(<GuidanceMessage message="情報メッセージ" />);

    expect(screen.getByTestId("guidance-message")).toBeInTheDocument();
  });

  it("warningバリアントが表示される", () => {
    render(<GuidanceMessage message="警告メッセージ" variant="warning" />);

    expect(screen.getByText("警告メッセージ")).toBeInTheDocument();
  });

  it("successバリアントが表示される", () => {
    render(<GuidanceMessage message="成功メッセージ" variant="success" />);

    expect(screen.getByText("成功メッセージ")).toBeInTheDocument();
  });
});
