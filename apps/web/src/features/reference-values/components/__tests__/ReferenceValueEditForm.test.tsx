import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ReferenceValueEditForm } from "../ReferenceValueEditForm";

describe("ReferenceValueEditForm", () => {
  const defaultProps = {
    id: 1,
    label: "白血球数（共通）",
    initialLowerLimit: "3.5",
    initialUpperLimit: "9.5",
    onClose: vi.fn(),
  };

  describe("表示", () => {
    it("ラベルが正しく表示される", () => {
      render(<ReferenceValueEditForm {...defaultProps} />);

      expect(
        screen.getByText("基準値の編集 - 白血球数（共通）"),
      ).toBeInTheDocument();
    });

    it("下限値の初期値が設定される", () => {
      render(<ReferenceValueEditForm {...defaultProps} />);

      const input = screen.getByTestId("input-lower-limit") as HTMLInputElement;
      expect(input.value).toBe("3.5");
    });

    it("上限値の初期値が設定される", () => {
      render(<ReferenceValueEditForm {...defaultProps} />);

      const input = screen.getByTestId("input-upper-limit") as HTMLInputElement;
      expect(input.value).toBe("9.5");
    });

    it("更新ボタンとキャンセルボタンが表示される", () => {
      render(<ReferenceValueEditForm {...defaultProps} />);

      expect(screen.getByTestId("edit-submit")).toBeInTheDocument();
      expect(screen.getByTestId("edit-cancel")).toBeInTheDocument();
      expect(screen.getByText("更新する")).toBeInTheDocument();
      expect(screen.getByText("キャンセル")).toBeInTheDocument();
    });

    it("モーダルダイアログとして表示される", () => {
      render(<ReferenceValueEditForm {...defaultProps} />);

      expect(screen.getByTestId("edit-dialog")).toBeInTheDocument();
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });

  describe("キャンセル操作", () => {
    it("キャンセルボタンクリックでonCloseが呼ばれる", async () => {
      const onClose = vi.fn();
      render(
        <ReferenceValueEditForm {...defaultProps} onClose={onClose} />,
      );

      const cancelButton = screen.getByTestId("edit-cancel");
      cancelButton.click();

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("入力フィールド", () => {
    it("下限値フィールドにlabelが設定されている", () => {
      render(<ReferenceValueEditForm {...defaultProps} />);

      expect(screen.getByLabelText("下限値")).toBeInTheDocument();
    });

    it("上限値フィールドにlabelが設定されている", () => {
      render(<ReferenceValueEditForm {...defaultProps} />);

      expect(screen.getByLabelText("上限値")).toBeInTheDocument();
    });

    it("初期値が空文字の場合も正しく表示される", () => {
      render(
        <ReferenceValueEditForm
          {...defaultProps}
          initialLowerLimit=""
          initialUpperLimit=""
        />,
      );

      const lowerInput = screen.getByTestId("input-lower-limit") as HTMLInputElement;
      const upperInput = screen.getByTestId("input-upper-limit") as HTMLInputElement;
      expect(lowerInput.value).toBe("");
      expect(upperInput.value).toBe("");
    });
  });
});
