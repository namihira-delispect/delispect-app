import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CsvImportDialog } from "../CsvImportDialog";

describe("CsvImportDialog", () => {
  describe("表示制御", () => {
    it("isOpenがfalseの場合は何も表示しない", () => {
      const { container } = render(
        <CsvImportDialog isOpen={false} onPreview={vi.fn()} onImport={vi.fn()} onClose={vi.fn()} />,
      );

      expect(container.innerHTML).toBe("");
    });

    it("isOpenがtrueの場合にダイアログが表示される", () => {
      render(
        <CsvImportDialog isOpen={true} onPreview={vi.fn()} onImport={vi.fn()} onClose={vi.fn()} />,
      );

      expect(screen.getByText("CSVインポート")).toBeDefined();
    });
  });

  describe("ファイルアップロード", () => {
    it("ドロップゾーンのテキストが表示される", () => {
      render(
        <CsvImportDialog isOpen={true} onPreview={vi.fn()} onImport={vi.fn()} onClose={vi.fn()} />,
      );

      expect(screen.getByText("CSVファイルをドロップまたはクリックして選択")).toBeDefined();
      expect(screen.getByText("UTF-8エンコーディングのCSVファイル")).toBeDefined();
    });
  });

  describe("キャンセル", () => {
    it("キャンセルボタンクリックでonCloseが呼ばれる", () => {
      const onClose = vi.fn();

      render(
        <CsvImportDialog isOpen={true} onPreview={vi.fn()} onImport={vi.fn()} onClose={onClose} />,
      );

      const cancelButton = screen.getByText("キャンセル");
      fireEvent.click(cancelButton);

      expect(onClose).toHaveBeenCalled();
    });
  });
});
