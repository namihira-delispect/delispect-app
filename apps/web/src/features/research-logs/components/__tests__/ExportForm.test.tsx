import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ExportForm } from "../ExportForm";

describe("ExportForm", () => {
  it("タイトルを表示する", () => {
    render(<ExportForm />);
    expect(screen.getByRole("heading", { name: "CSVエクスポート" })).toBeDefined();
  });

  it("開始日と終了日の入力フィールドを表示する", () => {
    render(<ExportForm />);
    expect(screen.getByText("開始日")).toBeDefined();
    expect(screen.getByText("終了日")).toBeDefined();
  });

  it("エクスポートボタンを表示する", () => {
    render(<ExportForm />);
    expect(screen.getByRole("button", { name: "CSVエクスポート" })).toBeDefined();
  });

  it("デフォルト値を設定できる", () => {
    render(
      <ExportForm
        defaultStartDate="2026-01-01"
        defaultEndDate="2026-01-31"
      />,
    );
    const inputs = screen.getAllByDisplayValue(/2026/);
    expect(inputs.length).toBeGreaterThanOrEqual(2);
  });
});
