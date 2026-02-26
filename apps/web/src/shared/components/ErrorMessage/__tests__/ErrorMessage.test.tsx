import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ErrorMessage } from "../ErrorMessage";

describe("ErrorMessage", () => {
  it("エラーメッセージが表示される", () => {
    render(<ErrorMessage message="エラーが発生しました" />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("エラーが発生しました")).toBeInTheDocument();
  });

  it("再試行ボタンが表示されクリックできる", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();

    render(<ErrorMessage message="エラー" onRetry={onRetry} />);

    const retryButton = screen.getByText("再試行");
    expect(retryButton).toBeInTheDocument();

    await user.click(retryButton);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("onRetryが未指定の場合、再試行ボタンが表示されない", () => {
    render(<ErrorMessage message="エラー" />);
    expect(screen.queryByText("再試行")).not.toBeInTheDocument();
  });

  describe("ガイダンス表示", () => {
    it("guidanceが指定された場合にガイダンスメッセージが表示される", () => {
      render(
        <ErrorMessage
          message="入力エラー"
          guidance="必須項目を入力してください。"
        />,
      );

      expect(screen.getByText("入力エラー")).toBeInTheDocument();
      expect(
        screen.getByText("必須項目を入力してください。"),
      ).toBeInTheDocument();
    });

    it("guidanceが未指定の場合はガイダンスが表示されない", () => {
      render(<ErrorMessage message="エラー" />);

      const alert = screen.getByRole("alert");
      // ガイダンスのdivが表示されない（メッセージ行のdivのみ）
      expect(alert.children).toHaveLength(1);
    });
  });

  describe("バリエーション（variant）", () => {
    it("デフォルトはerrorバリエーション", () => {
      render(<ErrorMessage message="エラー" />);
      const alert = screen.getByRole("alert");
      expect(alert).toHaveAttribute("data-variant", "error");
    });

    it("warningバリエーションが適用される", () => {
      render(<ErrorMessage message="警告" variant="warning" />);
      const alert = screen.getByRole("alert");
      expect(alert).toHaveAttribute("data-variant", "warning");
    });

    it("guidanceバリエーションが適用される", () => {
      render(<ErrorMessage message="案内" variant="guidance" />);
      const alert = screen.getByRole("alert");
      expect(alert).toHaveAttribute("data-variant", "guidance");
    });
  });

  describe("ガイダンスと再試行の組み合わせ", () => {
    it("ガイダンスと再試行ボタンの両方が表示される", async () => {
      const user = userEvent.setup();
      const onRetry = vi.fn();

      render(
        <ErrorMessage
          message="接続エラー"
          guidance="ネットワーク接続を確認してください。"
          onRetry={onRetry}
        />,
      );

      expect(screen.getByText("接続エラー")).toBeInTheDocument();
      expect(
        screen.getByText("ネットワーク接続を確認してください。"),
      ).toBeInTheDocument();

      const retryButton = screen.getByText("再試行");
      await user.click(retryButton);
      expect(onRetry).toHaveBeenCalledTimes(1);
    });
  });
});
