import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ChecklistForm } from "../ChecklistForm";
import { MOBILITY_OPTIONS, SAFETY_OPTIONS } from "../../types";

describe("ChecklistForm", () => {
  const defaultProps = {
    categoryLabel: "離床促進",
    categoryDescription:
      "早期離床の対策方法を提案し、チェックリスト形式で離床に関する対策を選択します。",
    options: MOBILITY_OPTIONS,
    initialData: null,
    saving: false,
    onSave: vi.fn(),
  };

  it("カテゴリーラベルが表示される", () => {
    render(<ChecklistForm {...defaultProps} />);
    expect(screen.getByText("離床促進")).toBeDefined();
  });

  it("カテゴリー説明が表示される", () => {
    render(<ChecklistForm {...defaultProps} />);
    expect(
      screen.getByText(
        "早期離床の対策方法を提案し、チェックリスト形式で離床に関する対策を選択します。",
      ),
    ).toBeDefined();
  });

  it("チェックリスト選択肢が表示される", () => {
    render(<ChecklistForm {...defaultProps} />);
    for (const option of MOBILITY_OPTIONS) {
      expect(screen.getByText(option.label)).toBeDefined();
    }
  });

  it("選択肢の説明が表示される", () => {
    render(<ChecklistForm {...defaultProps} />);
    for (const option of MOBILITY_OPTIONS) {
      if (option.description) {
        expect(screen.getByText(option.description)).toBeDefined();
      }
    }
  });

  it("初期状態では選択数が0と表示される", () => {
    render(<ChecklistForm {...defaultProps} />);
    expect(screen.getByText(`0/${MOBILITY_OPTIONS.length} 項目選択中`)).toBeDefined();
  });

  it("チェックボックスをクリックすると選択数が増える", () => {
    render(<ChecklistForm {...defaultProps} />);
    const checkbox = document.getElementById("mobility_01") as HTMLInputElement;
    fireEvent.click(checkbox);
    expect(screen.getByText(`1/${MOBILITY_OPTIONS.length} 項目選択中`)).toBeDefined();
  });

  it("すべて選択ボタンをクリックすると全選択される", () => {
    render(<ChecklistForm {...defaultProps} />);
    const selectAllButton = screen.getByText("すべて選択");
    fireEvent.click(selectAllButton);
    expect(
      screen.getByText(`${MOBILITY_OPTIONS.length}/${MOBILITY_OPTIONS.length} 項目選択中`),
    ).toBeDefined();
  });

  it("すべて選択後にすべて解除ボタンが表示される", () => {
    render(<ChecklistForm {...defaultProps} />);
    const selectAllButton = screen.getByText("すべて選択");
    fireEvent.click(selectAllButton);
    expect(screen.getByText("すべて解除")).toBeDefined();
  });

  it("すべて解除ボタンをクリックすると全解除される", () => {
    render(<ChecklistForm {...defaultProps} />);
    const selectAllButton = screen.getByText("すべて選択");
    fireEvent.click(selectAllButton);
    const deselectAllButton = screen.getByText("すべて解除");
    fireEvent.click(deselectAllButton);
    expect(screen.getByText(`0/${MOBILITY_OPTIONS.length} 項目選択中`)).toBeDefined();
  });

  it("保存ボタンが表示される", () => {
    render(<ChecklistForm {...defaultProps} />);
    expect(screen.getByText("保存する")).toBeDefined();
  });

  it("保存ボタンクリックでonSaveが呼ばれる", () => {
    const onSave = vi.fn();
    render(<ChecklistForm {...defaultProps} onSave={onSave} />);
    const saveButton = screen.getByText("保存する");
    fireEvent.click(saveButton);
    expect(onSave).toHaveBeenCalledOnce();
    expect(onSave).toHaveBeenCalledWith({
      selectedOptionIds: [],
    });
  });

  it("選択肢を選んで保存すると選択したIDがonSaveに渡される", () => {
    const onSave = vi.fn();
    render(<ChecklistForm {...defaultProps} onSave={onSave} />);
    const checkbox = document.getElementById("mobility_01") as HTMLInputElement;
    fireEvent.click(checkbox);
    const saveButton = screen.getByText("保存する");
    fireEvent.click(saveButton);
    expect(onSave).toHaveBeenCalledWith({
      selectedOptionIds: ["mobility_01"],
    });
  });

  it("メモを入力して保存するとnotesがonSaveに渡される", () => {
    const onSave = vi.fn();
    render(<ChecklistForm {...defaultProps} onSave={onSave} />);
    const textarea = screen.getByPlaceholderText("追加の指示やメモがあれば入力してください");
    fireEvent.change(textarea, { target: { value: "テストメモ" } });
    const saveButton = screen.getByText("保存する");
    fireEvent.click(saveButton);
    expect(onSave).toHaveBeenCalledWith({
      selectedOptionIds: [],
      notes: "テストメモ",
    });
  });

  it("saving中は保存ボタンが無効化される", () => {
    render(<ChecklistForm {...defaultProps} saving={true} />);
    expect(screen.getByText("保存中...")).toBeDefined();
  });

  it("初期データが指定された場合にチェック状態が復元される", () => {
    const initialData = {
      selectedOptionIds: ["mobility_01", "mobility_03"],
      notes: "既存メモ",
    };
    render(<ChecklistForm {...defaultProps} initialData={initialData} />);
    expect(screen.getByText(`2/${MOBILITY_OPTIONS.length} 項目選択中`)).toBeDefined();
  });

  it("安全管理カテゴリーの選択肢が表示される", () => {
    render(
      <ChecklistForm
        {...defaultProps}
        categoryLabel="安全管理"
        categoryDescription="安全管理の取り組みを選択します。"
        options={SAFETY_OPTIONS}
      />,
    );
    expect(screen.getByText("安全管理")).toBeDefined();
    for (const option of SAFETY_OPTIONS) {
      expect(screen.getByText(option.label)).toBeDefined();
    }
  });

  it("メモラベルが表示される", () => {
    render(<ChecklistForm {...defaultProps} />);
    expect(screen.getByText("メモ（任意）")).toBeDefined();
  });
});
