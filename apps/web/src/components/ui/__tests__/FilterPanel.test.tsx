import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FilterPanel } from "../FilterPanel";
import type { FilterDefinition } from "../FilterPanel";

const mockFilters: FilterDefinition[] = [
  {
    key: "status",
    label: "ステータス",
    options: [
      { value: "active", label: "有効" },
      { value: "inactive", label: "無効" },
    ],
  },
  {
    key: "ward",
    label: "病棟",
    options: [
      { value: "A", label: "A棟" },
      { value: "B", label: "B棟" },
    ],
  },
];

describe("FilterPanel", () => {
  it("フィルターパネルが表示される", () => {
    render(
      <FilterPanel
        filters={mockFilters}
        values={{}}
        onFilterChange={vi.fn()}
        onClear={vi.fn()}
      />
    );

    expect(screen.getByTestId("filter-panel")).toBeInTheDocument();
    expect(screen.getByTestId("filter-toggle")).toBeInTheDocument();
  });

  it("トグルボタンクリックでフィルターオプションが展開される", () => {
    render(
      <FilterPanel
        filters={mockFilters}
        values={{}}
        onFilterChange={vi.fn()}
        onClear={vi.fn()}
      />
    );

    // 初期状態ではフィルターオプションは非表示
    expect(screen.queryByTestId("filter-options")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("filter-toggle"));

    // フィルターオプションが表示される
    expect(screen.getByTestId("filter-options")).toBeInTheDocument();
    expect(screen.getByText("ステータス")).toBeInTheDocument();
    expect(screen.getByText("病棟")).toBeInTheDocument();
  });

  it("フィルター選択でonFilterChangeが呼ばれる", () => {
    const onFilterChange = vi.fn();
    render(
      <FilterPanel
        filters={mockFilters}
        values={{}}
        onFilterChange={onFilterChange}
        onClear={vi.fn()}
      />
    );

    // フィルターを展開
    fireEvent.click(screen.getByTestId("filter-toggle"));

    // ステータスフィルターを選択
    fireEvent.change(screen.getByTestId("filter-select-status"), {
      target: { value: "active" },
    });

    expect(onFilterChange).toHaveBeenCalledWith("status", "active");
  });

  it("アクティブなフィルターがある場合にバッジが表示される", () => {
    render(
      <FilterPanel
        filters={mockFilters}
        values={{ status: "active" }}
        onFilterChange={vi.fn()}
        onClear={vi.fn()}
      />
    );

    expect(screen.getByTestId("filter-active-badge")).toHaveTextContent("1");
  });

  it("アクティブなフィルターがある場合にクリアボタンが表示される", () => {
    render(
      <FilterPanel
        filters={mockFilters}
        values={{ status: "active" }}
        onFilterChange={vi.fn()}
        onClear={vi.fn()}
      />
    );

    expect(screen.getByTestId("filter-clear-button")).toBeInTheDocument();
  });

  it("クリアボタンクリックでonClearが呼ばれる", () => {
    const onClear = vi.fn();
    render(
      <FilterPanel
        filters={mockFilters}
        values={{ status: "active" }}
        onFilterChange={vi.fn()}
        onClear={onClear}
      />
    );

    fireEvent.click(screen.getByTestId("filter-clear-button"));

    expect(onClear).toHaveBeenCalledOnce();
  });

  it("フィルターが非アクティブの場合はクリアボタンが非表示", () => {
    render(
      <FilterPanel
        filters={mockFilters}
        values={{}}
        onFilterChange={vi.fn()}
        onClear={vi.fn()}
      />
    );

    expect(screen.queryByTestId("filter-clear-button")).not.toBeInTheDocument();
  });
});
