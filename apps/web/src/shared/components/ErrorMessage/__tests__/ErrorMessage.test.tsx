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
});
