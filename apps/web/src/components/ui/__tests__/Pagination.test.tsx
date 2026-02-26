import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Pagination } from "../Pagination";

describe("Pagination コンポーネント", () => {
  it("総ページ数が1以下の場合は何も表示しない", () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={1} onPageChange={vi.fn()} />
    );

    expect(container.firstChild).toBeNull();
  });

  it("前へ・次へボタンが表示される", () => {
    render(
      <Pagination currentPage={2} totalPages={5} onPageChange={vi.fn()} />
    );

    expect(screen.getByTestId("pagination-prev")).toBeInTheDocument();
    expect(screen.getByTestId("pagination-next")).toBeInTheDocument();
  });

  it("最初のページでは前へボタンが無効化される", () => {
    render(
      <Pagination currentPage={1} totalPages={5} onPageChange={vi.fn()} />
    );

    expect(screen.getByTestId("pagination-prev")).toBeDisabled();
  });

  it("最後のページでは次へボタンが無効化される", () => {
    render(
      <Pagination currentPage={5} totalPages={5} onPageChange={vi.fn()} />
    );

    expect(screen.getByTestId("pagination-next")).toBeDisabled();
  });

  it("ページ番号クリックでonPageChangeが呼ばれる", () => {
    const onPageChange = vi.fn();
    render(
      <Pagination currentPage={1} totalPages={5} onPageChange={onPageChange} />
    );

    fireEvent.click(screen.getByTestId("pagination-page-3"));

    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it("次へボタンクリックで次のページに遷移する", () => {
    const onPageChange = vi.fn();
    render(
      <Pagination currentPage={2} totalPages={5} onPageChange={onPageChange} />
    );

    fireEvent.click(screen.getByTestId("pagination-next"));

    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it("前へボタンクリックで前のページに遷移する", () => {
    const onPageChange = vi.fn();
    render(
      <Pagination currentPage={3} totalPages={5} onPageChange={onPageChange} />
    );

    fireEvent.click(screen.getByTestId("pagination-prev"));

    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("現在のページにaria-currentが設定される", () => {
    render(
      <Pagination currentPage={2} totalPages={5} onPageChange={vi.fn()} />
    );

    expect(screen.getByTestId("pagination-page-2")).toHaveAttribute(
      "aria-current",
      "page"
    );
  });
});
