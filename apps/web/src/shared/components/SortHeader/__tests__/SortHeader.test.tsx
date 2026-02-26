import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SortHeader } from "../SortHeader";

describe("SortHeader", () => {
  const defaultProps = {
    label: "患者名",
    columnKey: "name",
    currentSortColumn: null,
    currentSortDirection: "asc" as const,
    onSort: vi.fn(),
  };

  it("ラベルが表示される", () => {
    render(<SortHeader {...defaultProps} />);
    expect(screen.getByText("患者名")).toBeInTheDocument();
  });

  it("クリックするとonSortが昇順で呼ばれる", async () => {
    const user = userEvent.setup();
    const onSort = vi.fn();

    render(<SortHeader {...defaultProps} onSort={onSort} />);

    await user.click(screen.getByLabelText("患者名でソート"));
    expect(onSort).toHaveBeenCalledWith("name", "asc");
  });

  it("同じカラムをクリックするとソート方向が反転する", async () => {
    const user = userEvent.setup();
    const onSort = vi.fn();

    render(
      <SortHeader
        {...defaultProps}
        currentSortColumn="name"
        currentSortDirection="asc"
        onSort={onSort}
      />,
    );

    await user.click(screen.getByLabelText("患者名でソート"));
    expect(onSort).toHaveBeenCalledWith("name", "desc");
  });

  it("アクティブなカラムのdata-sortが設定される", () => {
    render(
      <SortHeader
        {...defaultProps}
        currentSortColumn="name"
        currentSortDirection="asc"
      />,
    );
    expect(screen.getByLabelText("患者名でソート")).toHaveAttribute(
      "data-sort",
      "ascending",
    );
  });

  it("非アクティブなカラムのdata-sortがnoneになる", () => {
    render(<SortHeader {...defaultProps} currentSortColumn="other" />);
    expect(screen.getByLabelText("患者名でソート")).toHaveAttribute(
      "data-sort",
      "none",
    );
  });
});
