import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BooleanQuestionStep } from "../BooleanQuestionStep";

describe("BooleanQuestionStep", () => {
  it("タイトルが表示される", () => {
    render(
      <BooleanQuestionStep
        title="日中の痛み"
        description="日中の活動時に痛みはありますか？"
        value={null}
        onChange={() => {}}
      />,
    );
    expect(screen.getByText("日中の痛み")).toBeDefined();
  });

  it("説明文が表示される", () => {
    render(
      <BooleanQuestionStep
        title="日中の痛み"
        description="日中の活動時に痛みはありますか？"
        value={null}
        onChange={() => {}}
      />,
    );
    expect(screen.getByText("日中の活動時に痛みはありますか？")).toBeDefined();
  });

  it("はいボタンといいえボタンが表示される", () => {
    render(
      <BooleanQuestionStep
        title="テスト"
        description="テスト説明"
        value={null}
        onChange={() => {}}
      />,
    );
    expect(screen.getByText("はい")).toBeDefined();
    expect(screen.getByText("いいえ")).toBeDefined();
  });

  it("はいボタンをクリックするとtrueが返される", () => {
    const onChange = vi.fn();
    render(
      <BooleanQuestionStep
        title="テスト"
        description="テスト説明"
        value={null}
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getByText("はい"));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("いいえボタンをクリックするとfalseが返される", () => {
    const onChange = vi.fn();
    render(
      <BooleanQuestionStep
        title="テスト"
        description="テスト説明"
        value={null}
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getByText("いいえ"));
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it("value=trueの場合、はいボタンがaria-pressed=trueになる", () => {
    render(
      <BooleanQuestionStep
        title="テスト"
        description="テスト説明"
        value={true}
        onChange={() => {}}
      />,
    );
    const yesButton = screen.getByText("はい");
    expect(yesButton.getAttribute("aria-pressed")).toBe("true");
  });

  it("value=falseの場合、いいえボタンがaria-pressed=trueになる", () => {
    render(
      <BooleanQuestionStep
        title="テスト"
        description="テスト説明"
        value={false}
        onChange={() => {}}
      />,
    );
    const noButton = screen.getByText("いいえ");
    expect(noButton.getAttribute("aria-pressed")).toBe("true");
  });
});
