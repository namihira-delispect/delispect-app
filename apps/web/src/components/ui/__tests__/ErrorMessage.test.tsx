import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ErrorMessage } from "../ErrorMessage";

describe("ErrorMessage", () => {
  it("エラーメッセージが表示される", () => {
    render(<ErrorMessage message="データの取得に失敗しました" />);

    expect(screen.getByTestId("error-message")).toBeInTheDocument();
    expect(screen.getByText("データの取得に失敗しました")).toBeInTheDocument();
  });

  it("role=alertが設定される", () => {
    render(<ErrorMessage message="エラー" />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("再試行ボタンが表示される（onRetryが指定された場合）", () => {
    const onRetry = vi.fn();
    render(<ErrorMessage message="エラー" onRetry={onRetry} />);

    const retryButton = screen.getByTestId("error-retry-button");
    expect(retryButton).toBeInTheDocument();
    expect(retryButton).toHaveTextContent("再試行");
  });

  it("再試行ボタンクリックでonRetryが呼ばれる", () => {
    const onRetry = vi.fn();
    render(<ErrorMessage message="エラー" onRetry={onRetry} />);

    fireEvent.click(screen.getByTestId("error-retry-button"));

    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("onRetryが未指定の場合は再試行ボタンが非表示", () => {
    render(<ErrorMessage message="エラー" />);

    expect(screen.queryByTestId("error-retry-button")).not.toBeInTheDocument();
  });
});
