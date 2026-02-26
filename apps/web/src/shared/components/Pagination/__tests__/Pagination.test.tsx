import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Pagination } from "../Pagination";

describe("Pagination", () => {
  const defaultProps = {
    currentPage: 1,
    totalPages: 5,
    totalItems: 100,
    pageSize: 20 as const,
    onPageChange: vi.fn(),
    onPageSizeChange: vi.fn(),
  };

  it("ページ情報が表示される", () => {
    render(<Pagination {...defaultProps} />);
    expect(screen.getByText("100件中 1-20件を表示")).toBeInTheDocument();
  });

  it("ページ番号ボタンが表示される", () => {
    render(<Pagination {...defaultProps} />);
    expect(screen.getByLabelText("ページ 1")).toBeInTheDocument();
    expect(screen.getByLabelText("ページ 5")).toBeInTheDocument();
  });

  it("ページ番号をクリックするとonPageChangeが呼ばれる", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();

    render(<Pagination {...defaultProps} onPageChange={onPageChange} />);

    await user.click(screen.getByLabelText("ページ 3"));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it("次のページボタンで次のページに遷移する", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();

    render(<Pagination {...defaultProps} onPageChange={onPageChange} />);

    await user.click(screen.getByLabelText("次のページ"));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("最初のページでは前のページボタンが無効になる", () => {
    render(<Pagination {...defaultProps} currentPage={1} />);
    expect(screen.getByLabelText("前のページ")).toBeDisabled();
  });

  it("最後のページでは次のページボタンが無効になる", () => {
    render(<Pagination {...defaultProps} currentPage={5} />);
    expect(screen.getByLabelText("次のページ")).toBeDisabled();
  });

  it("ページサイズを変更するとonPageSizeChangeが呼ばれる", async () => {
    const user = userEvent.setup();
    const onPageSizeChange = vi.fn();

    render(
      <Pagination {...defaultProps} onPageSizeChange={onPageSizeChange} />,
    );

    await user.selectOptions(screen.getByLabelText("表示件数"), "50");
    expect(onPageSizeChange).toHaveBeenCalledWith(50);
  });

  it("アイテムが0件の場合に正しく表示される", () => {
    render(
      <Pagination
        {...defaultProps}
        totalItems={0}
        totalPages={0}
        currentPage={1}
      />,
    );
    expect(screen.getByText("0件中 0-0件を表示")).toBeInTheDocument();
  });
});
