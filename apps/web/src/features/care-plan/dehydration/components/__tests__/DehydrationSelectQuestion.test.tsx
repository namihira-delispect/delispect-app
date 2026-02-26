import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DehydrationSelectQuestion } from "../DehydrationSelectQuestion";

describe("DehydrationSelectQuestion", () => {
  const options = [
    { value: "NORMAL", label: "正常" },
    { value: "MILD", label: "軽度異常" },
    { value: "SEVERE", label: "重度異常" },
  ];

  it("タイトルと説明文が表示される", () => {
    render(
      <DehydrationSelectQuestion
        title="皮膚の状態"
        description="テスト説明文"
        options={options}
        selectedValue={null}
        onValueChange={vi.fn()}
        onNext={vi.fn()}
        onBack={null}
      />,
    );
    expect(screen.getByText("皮膚の状態")).toBeDefined();
    expect(screen.getByText("テスト説明文")).toBeDefined();
  });

  it("全選択肢が表示される", () => {
    render(
      <DehydrationSelectQuestion
        title="皮膚の状態"
        description="説明"
        options={options}
        selectedValue={null}
        onValueChange={vi.fn()}
        onNext={vi.fn()}
        onBack={null}
      />,
    );
    expect(screen.getByText("正常")).toBeDefined();
    expect(screen.getByText("軽度異常")).toBeDefined();
    expect(screen.getByText("重度異常")).toBeDefined();
  });

  it("選択肢をクリックするとonValueChangeが呼ばれる", () => {
    const onValueChange = vi.fn();
    render(
      <DehydrationSelectQuestion
        title="皮膚の状態"
        description="説明"
        options={options}
        selectedValue={null}
        onValueChange={onValueChange}
        onNext={vi.fn()}
        onBack={null}
      />,
    );
    fireEvent.click(screen.getByText("軽度異常"));
    expect(onValueChange).toHaveBeenCalledWith("MILD");
  });

  it("選択済みの値がチェックされている", () => {
    render(
      <DehydrationSelectQuestion
        title="皮膚の状態"
        description="説明"
        options={options}
        selectedValue="SEVERE"
        onValueChange={vi.fn()}
        onNext={vi.fn()}
        onBack={null}
      />,
    );
    const radios = screen.getAllByRole("radio") as HTMLInputElement[];
    const severeRadio = radios.find((r) => r.value === "SEVERE");
    expect(severeRadio?.checked).toBe(true);
  });

  it("次へボタンクリックでonNextが呼ばれる", () => {
    const onNext = vi.fn();
    render(
      <DehydrationSelectQuestion
        title="皮膚の状態"
        description="説明"
        options={options}
        selectedValue="NORMAL"
        onValueChange={vi.fn()}
        onNext={onNext}
        onBack={null}
      />,
    );
    fireEvent.click(screen.getByText("次へ"));
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it("戻るボタンが表示され、onBackが呼ばれる", () => {
    const onBack = vi.fn();
    render(
      <DehydrationSelectQuestion
        title="皮膚の状態"
        description="説明"
        options={options}
        selectedValue={null}
        onValueChange={vi.fn()}
        onNext={vi.fn()}
        onBack={onBack}
      />,
    );
    fireEvent.click(screen.getByText("戻る"));
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
