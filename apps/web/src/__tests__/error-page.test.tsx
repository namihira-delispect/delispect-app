import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ErrorPage from "../app/error";

describe("ErrorPage（ランタイムエラーバウンダリ）", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("エラーメッセージが表示される", () => {
    const error = new Error("テストエラー");
    const reset = vi.fn();

    render(<ErrorPage error={error} reset={reset} />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("エラーが発生しました")).toBeInTheDocument();
    expect(screen.getByText(/システムエラーが発生しました/)).toBeInTheDocument();
  });

  it("再試行ボタンをクリックするとreset関数が呼ばれる", async () => {
    const user = userEvent.setup();
    const error = new Error("テストエラー");
    const reset = vi.fn();

    render(<ErrorPage error={error} reset={reset} />);

    const retryButton = screen.getByText("再試行");
    await user.click(retryButton);

    expect(reset).toHaveBeenCalledTimes(1);
  });

  it("開発環境ではエラー詳細が表示される", () => {
    vi.stubEnv("NODE_ENV", "development");

    const error = new Error("DBエラー: テーブルが見つかりません");
    error.stack = "Error: DBエラー\n    at test.ts:10";
    const reset = vi.fn();

    render(<ErrorPage error={error} reset={reset} />);

    expect(
      screen.getByText("エラー詳細（開発環境のみ表示）:"),
    ).toBeInTheDocument();
    // エラーメッセージが<br>で区切られたdiv内に含まれているためcontainer内を検索
    const alert = screen.getByRole("alert");
    expect(alert.textContent).toContain("DBエラー: テーブルが見つかりません");
  });

  it("本番環境ではエラー詳細が表示されない", () => {
    vi.stubEnv("NODE_ENV", "production");

    const error = new Error("秘密のエラー情報");
    const reset = vi.fn();

    render(<ErrorPage error={error} reset={reset} />);

    expect(screen.queryByText("秘密のエラー情報")).not.toBeInTheDocument();
    expect(
      screen.queryByText("エラー詳細（開発環境のみ表示）:"),
    ).not.toBeInTheDocument();
  });
});
