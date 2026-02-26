import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CarePlanStatusSummary } from "../CarePlanStatusSummary";

describe("CarePlanStatusSummary", () => {
  const defaultProps = {
    overallStatus: "IN_PROGRESS" as const,
    itemStatuses: [
      "COMPLETED" as const,
      "IN_PROGRESS" as const,
      "NOT_STARTED" as const,
      "NOT_STARTED" as const,
      "NOT_STARTED" as const,
      "NOT_STARTED" as const,
      "NOT_STARTED" as const,
      "NOT_STARTED" as const,
      "NOT_STARTED" as const,
      "NOT_STARTED" as const,
    ],
    createdBy: "看護師B",
    createdAt: "2026-02-27T09:00:00.000Z",
    updatedAt: "2026-02-27T14:00:00.000Z",
  };

  it("全体ステータスラベルが表示される", () => {
    render(<CarePlanStatusSummary {...defaultProps} />);
    expect(screen.getByText("全体ステータス:")).toBeDefined();
    expect(screen.getByText("実施中")).toBeDefined();
  });

  it("完了数が正しく表示される", () => {
    render(<CarePlanStatusSummary {...defaultProps} />);
    expect(screen.getByText("完了: 1/10")).toBeDefined();
  });

  it("実施中数が正しく表示される", () => {
    render(<CarePlanStatusSummary {...defaultProps} />);
    expect(screen.getByText("実施中: 1")).toBeDefined();
  });

  it("未実施数が正しく表示される", () => {
    render(<CarePlanStatusSummary {...defaultProps} />);
    expect(screen.getByText("未実施: 8")).toBeDefined();
  });

  it("作成者名が表示される", () => {
    render(<CarePlanStatusSummary {...defaultProps} />);
    expect(screen.getByText(/看護師B/)).toBeDefined();
  });

  it("全項目完了の場合のステータス表示", () => {
    const completedProps = {
      ...defaultProps,
      overallStatus: "COMPLETED" as const,
      itemStatuses: Array(10).fill("COMPLETED") as (
        | "COMPLETED"
        | "IN_PROGRESS"
        | "NOT_STARTED"
        | "NOT_APPLICABLE"
      )[],
    };
    render(<CarePlanStatusSummary {...completedProps} />);
    expect(screen.getByText("完了")).toBeDefined();
    expect(screen.getByText("完了: 10/10")).toBeDefined();
  });

  it("全項目未実施の場合のステータス表示", () => {
    const notStartedProps = {
      ...defaultProps,
      overallStatus: "NOT_STARTED" as const,
      itemStatuses: Array(10).fill("NOT_STARTED") as (
        | "COMPLETED"
        | "IN_PROGRESS"
        | "NOT_STARTED"
        | "NOT_APPLICABLE"
      )[],
    };
    render(<CarePlanStatusSummary {...notStartedProps} />);
    expect(screen.getByText("未実施")).toBeDefined();
    expect(screen.getByText("未実施: 10")).toBeDefined();
  });
});
