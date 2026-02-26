import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConfirmDialog } from "../ConfirmDialog";

describe("ConfirmDialog", () => {
  const defaultProps = {
    isOpen: true,
    title: "削除の確認",
    message: "本当に削除しますか？",
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  };

  it("ダイアログが表示される", () => {
    render(<ConfirmDialog {...defaultProps} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("削除の確認")).toBeInTheDocument();
    expect(screen.getByText("本当に削除しますか？")).toBeInTheDocument();
  });

  it("isOpenがfalseの場合、ダイアログが非表示になる", () => {
    render(<ConfirmDialog {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("確認ボタンをクリックするとonConfirmが呼ばれる", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();

    render(<ConfirmDialog {...defaultProps} onConfirm={onConfirm} />);

    await user.click(screen.getByText("確認"));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("キャンセルボタンをクリックするとonCancelが呼ばれる", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();

    render(<ConfirmDialog {...defaultProps} onCancel={onCancel} />);

    await user.click(screen.getByText("キャンセル"));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("カスタムボタンラベルが表示される", () => {
    render(
      <ConfirmDialog
        {...defaultProps}
        confirmLabel="削除する"
        cancelLabel="戻る"
      />,
    );
    expect(screen.getByText("削除する")).toBeInTheDocument();
    expect(screen.getByText("戻る")).toBeInTheDocument();
  });

  it("Escapeキーでダイアログが閉じる", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();

    render(<ConfirmDialog {...defaultProps} onCancel={onCancel} />);

    await user.keyboard("{Escape}");
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
