import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SortableHeader } from "../SortableHeader";

describe("SortableHeader", () => {
  it("ラベルが表示される", () => {
    render(
      <SortableHeader label="患者名" sortKey="name" onSort={vi.fn()} />
    );

    expect(screen.getByText("患者名")).toBeInTheDocument();
  });

  it("クリックで昇順ソートが実行される", () => {
    const onSort = vi.fn();
    render(
      <SortableHeader label="患者名" sortKey="name" onSort={onSort} />
    );

    fireEvent.click(screen.getByTestId("sort-header-name"));

    expect(onSort).toHaveBeenCalledWith("name", "asc");
  });

  it("昇順状態でクリックすると降順に切り替わる", () => {
    const onSort = vi.fn();
    render(
      <SortableHeader
        label="患者名"
        sortKey="name"
        currentSortKey="name"
        currentSortDirection="asc"
        onSort={onSort}
      />
    );

    fireEvent.click(screen.getByTestId("sort-header-name"));

    expect(onSort).toHaveBeenCalledWith("name", "desc");
  });

  it("降順状態でクリックすると昇順に切り替わる", () => {
    const onSort = vi.fn();
    render(
      <SortableHeader
        label="患者名"
        sortKey="name"
        currentSortKey="name"
        currentSortDirection="desc"
        onSort={onSort}
      />
    );

    fireEvent.click(screen.getByTestId("sort-header-name"));

    expect(onSort).toHaveBeenCalledWith("name", "asc");
  });

  it("別のカラムがソート中の場合、昇順でソート開始される", () => {
    const onSort = vi.fn();
    render(
      <SortableHeader
        label="患者名"
        sortKey="name"
        currentSortKey="age"
        currentSortDirection="desc"
        onSort={onSort}
      />
    );

    fireEvent.click(screen.getByTestId("sort-header-name"));

    expect(onSort).toHaveBeenCalledWith("name", "asc");
  });

  it("aria-labelが設定される", () => {
    render(
      <SortableHeader label="患者名" sortKey="name" onSort={vi.fn()} />
    );

    expect(screen.getByLabelText("患者名でソート")).toBeInTheDocument();
  });
});
