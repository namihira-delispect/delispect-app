import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { DashboardFilter } from "../DashboardFilter";

// next/navigation モック
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe("DashboardFilter", () => {
  it("開始日と終了日の入力フィールドを表示する", () => {
    render(
      <DashboardFilter
        defaultStartDate="2026-01-01"
        defaultEndDate="2026-01-31"
      />,
    );
    expect(screen.getByText("開始日")).toBeDefined();
    expect(screen.getByText("終了日")).toBeDefined();
  });

  it("表示期間変更ボタンを表示する", () => {
    render(
      <DashboardFilter
        defaultStartDate="2026-01-01"
        defaultEndDate="2026-01-31"
      />,
    );
    expect(screen.getByRole("button", { name: "表示期間を変更" })).toBeDefined();
  });

  it("デフォルト値が設定される", () => {
    render(
      <DashboardFilter
        defaultStartDate="2026-01-01"
        defaultEndDate="2026-01-31"
      />,
    );
    const inputs = screen.getAllByDisplayValue(/2026/);
    expect(inputs.length).toBeGreaterThanOrEqual(2);
  });
});
