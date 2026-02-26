import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AdmissionSearchForm } from "../AdmissionSearchForm";

describe("AdmissionSearchForm", () => {
  const defaultProps = {
    initialParams: {},
    onSearch: vi.fn(),
    onClear: vi.fn(),
  };

  describe("レンダリング", () => {
    it("検索フォームが表示される", () => {
      render(<AdmissionSearchForm {...defaultProps} />);
      expect(screen.getByLabelText("検索フォーム")).toBeDefined();
    });

    it("リスク評価セレクトが表示される", () => {
      render(<AdmissionSearchForm {...defaultProps} />);
      expect(screen.getByLabelText("リスク評価")).toBeDefined();
    });

    it("ケア実施状況セレクトが表示される", () => {
      render(<AdmissionSearchForm {...defaultProps} />);
      expect(screen.getByLabelText("ケア実施状況")).toBeDefined();
    });

    it("名前入力フィールドが表示される", () => {
      render(<AdmissionSearchForm {...defaultProps} />);
      expect(screen.getByLabelText("名前")).toBeDefined();
    });

    it("入院日の日付範囲フィールドが表示される", () => {
      render(<AdmissionSearchForm {...defaultProps} />);
      expect(screen.getByLabelText("入院日（開始）")).toBeDefined();
      expect(screen.getByLabelText("入院日（終了）")).toBeDefined();
    });

    it("評価日の日付範囲フィールドが表示される", () => {
      render(<AdmissionSearchForm {...defaultProps} />);
      expect(screen.getByLabelText("評価日（開始）")).toBeDefined();
      expect(screen.getByLabelText("評価日（終了）")).toBeDefined();
    });

    it("検索ボタンとクリアボタンが表示される", () => {
      render(<AdmissionSearchForm {...defaultProps} />);
      expect(screen.getByText("検索")).toBeDefined();
      expect(screen.getByText("クリア")).toBeDefined();
    });
  });

  describe("検索実行", () => {
    it("検索ボタンをクリックするとonSearchが呼ばれる", () => {
      const onSearch = vi.fn();
      render(<AdmissionSearchForm {...defaultProps} onSearch={onSearch} />);

      fireEvent.click(screen.getByText("検索"));
      expect(onSearch).toHaveBeenCalledTimes(1);
    });

    it("名前を入力して検索するとパラメータに含まれる", () => {
      const onSearch = vi.fn();
      render(<AdmissionSearchForm {...defaultProps} onSearch={onSearch} />);

      const nameInput = screen.getByLabelText("名前");
      fireEvent.change(nameInput, { target: { value: "田中" } });
      fireEvent.click(screen.getByText("検索"));

      expect(onSearch).toHaveBeenCalledWith(expect.objectContaining({ name: "田中" }));
    });

    it("リスク評価を選択して検索するとパラメータに含まれる", () => {
      const onSearch = vi.fn();
      render(<AdmissionSearchForm {...defaultProps} onSearch={onSearch} />);

      const select = screen.getByLabelText("リスク評価");
      fireEvent.change(select, { target: { value: "HIGH" } });
      fireEvent.click(screen.getByText("検索"));

      expect(onSearch).toHaveBeenCalledWith(expect.objectContaining({ riskLevel: "HIGH" }));
    });

    it("ケア実施状況を選択して検索するとパラメータに含まれる", () => {
      const onSearch = vi.fn();
      render(<AdmissionSearchForm {...defaultProps} onSearch={onSearch} />);

      const select = screen.getByLabelText("ケア実施状況");
      fireEvent.change(select, { target: { value: "COMPLETED" } });
      fireEvent.click(screen.getByText("検索"));

      expect(onSearch).toHaveBeenCalledWith(expect.objectContaining({ careStatus: "COMPLETED" }));
    });
  });

  describe("条件クリア", () => {
    it("クリアボタンをクリックするとonClearが呼ばれる", () => {
      const onClear = vi.fn();
      render(<AdmissionSearchForm {...defaultProps} onClear={onClear} />);

      fireEvent.click(screen.getByText("クリア"));
      expect(onClear).toHaveBeenCalledTimes(1);
    });
  });

  describe("初期値", () => {
    it("initialParamsのnameが設定された場合に初期値が反映される", () => {
      render(<AdmissionSearchForm {...defaultProps} initialParams={{ name: "佐藤" }} />);

      const nameInput = screen.getByLabelText("名前") as HTMLInputElement;
      expect(nameInput.value).toBe("佐藤");
    });

    it("initialParamsのriskLevelが設定された場合に初期値が反映される", () => {
      render(<AdmissionSearchForm {...defaultProps} initialParams={{ riskLevel: "HIGH" }} />);

      const select = screen.getByLabelText("リスク評価") as HTMLSelectElement;
      expect(select.value).toBe("HIGH");
    });
  });
});
