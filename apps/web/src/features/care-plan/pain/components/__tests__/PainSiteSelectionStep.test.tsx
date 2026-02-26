import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PainSiteSelectionStep } from "../PainSiteSelectionStep";

describe("PainSiteSelectionStep", () => {
  it("タイトルが表示される", () => {
    render(<PainSiteSelectionStep selectedSiteIds={[]} onToggleSite={() => {}} />);
    expect(screen.getByText("痛みのある部位を選択してください")).toBeDefined();
  });

  it("4つのグループヘッダーが表示される", () => {
    render(<PainSiteSelectionStep selectedSiteIds={[]} onToggleSite={() => {}} />);
    expect(screen.getByText("頭・首")).toBeDefined();
    expect(screen.getByText("体幹")).toBeDefined();
    expect(screen.getByText("上肢")).toBeDefined();
    expect(screen.getByText("下肢")).toBeDefined();
  });

  it("部位ボタンが表示される", () => {
    render(<PainSiteSelectionStep selectedSiteIds={[]} onToggleSite={() => {}} />);
    expect(screen.getByText("頭部")).toBeDefined();
    expect(screen.getByText("首")).toBeDefined();
    expect(screen.getByText("腰部")).toBeDefined();
    expect(screen.getByText("右膝")).toBeDefined();
  });

  it("部位をクリックするとonToggleSiteが呼ばれる", () => {
    const onToggleSite = vi.fn();
    render(<PainSiteSelectionStep selectedSiteIds={[]} onToggleSite={onToggleSite} />);
    fireEvent.click(screen.getByText("頭部"));
    expect(onToggleSite).toHaveBeenCalledWith("HEAD");
  });

  it("選択済みの部位がaria-pressed=trueになる", () => {
    render(
      <PainSiteSelectionStep selectedSiteIds={["HEAD", "LOWER_BACK"]} onToggleSite={() => {}} />,
    );
    const headButton = screen.getByText("頭部");
    expect(headButton.getAttribute("aria-pressed")).toBe("true");
    const lowerBackButton = screen.getByText("腰部");
    expect(lowerBackButton.getAttribute("aria-pressed")).toBe("true");
  });

  it("選択数が表示される", () => {
    render(
      <PainSiteSelectionStep selectedSiteIds={["HEAD", "LOWER_BACK"]} onToggleSite={() => {}} />,
    );
    expect(screen.getByText("2箇所 選択中")).toBeDefined();
  });

  it("選択がない場合に選択数が表示されない", () => {
    render(<PainSiteSelectionStep selectedSiteIds={[]} onToggleSite={() => {}} />);
    expect(screen.queryByText(/選択中/)).toBeNull();
  });
});
