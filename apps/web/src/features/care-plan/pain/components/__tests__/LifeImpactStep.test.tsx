import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LifeImpactStep } from "../LifeImpactStep";

describe("LifeImpactStep", () => {
  it("タイトルが表示される", () => {
    render(
      <LifeImpactStep
        sleepImpact={null}
        mobilityImpact={null}
        toiletImpact={null}
        onChangeImpact={() => {}}
      />,
    );
    expect(screen.getByText("痛みの生活への影響")).toBeDefined();
  });

  it("3つの影響項目が表示される", () => {
    render(
      <LifeImpactStep
        sleepImpact={null}
        mobilityImpact={null}
        toiletImpact={null}
        onChangeImpact={() => {}}
      />,
    );
    expect(screen.getByText("睡眠への影響")).toBeDefined();
    expect(screen.getByText("動きへの影響")).toBeDefined();
    expect(screen.getByText("排泄への影響")).toBeDefined();
  });

  it("各項目に説明文が表示される", () => {
    render(
      <LifeImpactStep
        sleepImpact={null}
        mobilityImpact={null}
        toiletImpact={null}
        onChangeImpact={() => {}}
      />,
    );
    expect(screen.getByText("痛みのせいで眠れない、または中途覚醒がありますか？")).toBeDefined();
    expect(screen.getByText("痛みのせいで動くのがおっくうになっていますか？")).toBeDefined();
    expect(screen.getByText("トイレを我慢するほどの痛みがありますか？")).toBeDefined();
  });

  it("睡眠への影響のはいボタンをクリックするとSLEEP_IMPACTが返される", () => {
    const onChangeImpact = vi.fn();
    render(
      <LifeImpactStep
        sleepImpact={null}
        mobilityImpact={null}
        toiletImpact={null}
        onChangeImpact={onChangeImpact}
      />,
    );
    // 最初のはいボタン（睡眠への影響）
    const yesButtons = screen.getAllByText("はい");
    fireEvent.click(yesButtons[0]);
    expect(onChangeImpact).toHaveBeenCalledWith("SLEEP_IMPACT", true);
  });

  it("排泄への影響のいいえボタンをクリックするとTOILET_IMPACTが返される", () => {
    const onChangeImpact = vi.fn();
    render(
      <LifeImpactStep
        sleepImpact={null}
        mobilityImpact={null}
        toiletImpact={null}
        onChangeImpact={onChangeImpact}
      />,
    );
    // 3番目のいいえボタン（排泄への影響）
    const noButtons = screen.getAllByText("いいえ");
    fireEvent.click(noButtons[2]);
    expect(onChangeImpact).toHaveBeenCalledWith("TOILET_IMPACT", false);
  });

  it("sleepImpact=trueの場合、はいボタンがaria-pressed=trueになる", () => {
    render(
      <LifeImpactStep
        sleepImpact={true}
        mobilityImpact={null}
        toiletImpact={null}
        onChangeImpact={() => {}}
      />,
    );
    const yesButtons = screen.getAllByText("はい");
    expect(yesButtons[0].getAttribute("aria-pressed")).toBe("true");
  });
});
