import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Filter } from "../Filter";

describe("Filter", () => {
  const options = [
    { value: "high", label: "高" },
    { value: "medium", label: "中" },
    { value: "low", label: "低" },
  ];

  it("ラベルと選択肢が表示される", () => {
    render(
      <Filter label="リスク" options={options} value="" onChange={vi.fn()} />,
    );
    expect(screen.getByText("リスク:")).toBeInTheDocument();
    expect(screen.getByLabelText("リスクフィルター")).toBeInTheDocument();
  });

  it("「すべて」の選択肢がデフォルトで表示される", () => {
    render(
      <Filter label="リスク" options={options} value="" onChange={vi.fn()} />,
    );
    expect(screen.getByText("すべて")).toBeInTheDocument();
  });

  it("showAll=falseで「すべて」が非表示になる", () => {
    render(
      <Filter
        label="リスク"
        options={options}
        value="high"
        onChange={vi.fn()}
        showAll={false}
      />,
    );
    expect(screen.queryByText("すべて")).not.toBeInTheDocument();
  });

  it("選択を変更するとonChangeが呼ばれる", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <Filter label="リスク" options={options} value="" onChange={onChange} />,
    );

    await user.selectOptions(screen.getByLabelText("リスクフィルター"), "high");
    expect(onChange).toHaveBeenCalledWith("high");
  });
});
