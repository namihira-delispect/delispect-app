import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DehydrationLabQuestion } from "../DehydrationLabQuestion";
import type { LabValueAnswer } from "../../types";

describe("DehydrationLabQuestion", () => {
  const defaultLabValue: LabValueAnswer = {
    value: 42,
    lowerLimit: 38,
    upperLimit: 48,
    unit: "%",
    deviationStatus: "NORMAL",
  };

  it("タイトルと説明文が表示される", () => {
    render(
      <DehydrationLabQuestion
        title="Ht（ヘマトクリット）"
        description="テスト説明文"
        labValue={defaultLabValue}
        onNext={vi.fn()}
        onBack={null}
      />,
    );
    expect(screen.getByText("Ht（ヘマトクリット）")).toBeDefined();
    expect(screen.getByText("テスト説明文")).toBeDefined();
  });

  it("検査値と基準値が表示される", () => {
    render(
      <DehydrationLabQuestion
        title="Ht"
        description="説明"
        labValue={defaultLabValue}
        onNext={vi.fn()}
        onBack={null}
      />,
    );
    expect(screen.getByText("42 %")).toBeDefined();
    expect(screen.getByText("基準値内")).toBeDefined();
  });

  it("データなしの場合にデータなしが表示される", () => {
    render(
      <DehydrationLabQuestion
        title="Ht"
        description="説明"
        labValue={null}
        onNext={vi.fn()}
        onBack={null}
      />,
    );
    expect(screen.getByText("データなし")).toBeDefined();
  });

  it("逸脱状態がHIGHの場合に基準値超過が表示される", () => {
    const highLabValue: LabValueAnswer = {
      ...defaultLabValue,
      value: 55,
      deviationStatus: "HIGH",
    };
    render(
      <DehydrationLabQuestion
        title="Ht"
        description="説明"
        labValue={highLabValue}
        onNext={vi.fn()}
        onBack={null}
      />,
    );
    expect(screen.getByText("基準値超過")).toBeDefined();
  });

  it("次へボタンクリックでonNextが呼ばれる", () => {
    const onNext = vi.fn();
    render(
      <DehydrationLabQuestion
        title="Ht"
        description="説明"
        labValue={defaultLabValue}
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
      <DehydrationLabQuestion
        title="Ht"
        description="説明"
        labValue={defaultLabValue}
        onNext={vi.fn()}
        onBack={onBack}
      />,
    );
    fireEvent.click(screen.getByText("戻る"));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("onBackがnullの場合に戻るボタンが表示されない", () => {
    render(
      <DehydrationLabQuestion
        title="Ht"
        description="説明"
        labValue={defaultLabValue}
        onNext={vi.fn()}
        onBack={null}
      />,
    );
    expect(screen.queryByText("戻る")).toBeNull();
  });
});
