import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CarePlanDetailItemCard } from "../CarePlanDetailItemCard";
import type { CarePlanItemDetail } from "../../types";

function createMockItem(overrides?: Partial<CarePlanItemDetail>): CarePlanItemDetail {
  return {
    id: 1,
    category: "MEDICATION",
    status: "COMPLETED",
    details: null,
    instructions: "- リスク薬剤: ベンゾジアゼピン系",
    currentQuestionId: null,
    createdAt: "2026-01-15T09:00:00.000Z",
    updatedAt: "2026-01-15T09:30:00.000Z",
    ...overrides,
  };
}

describe("CarePlanDetailItemCard", () => {
  it("カテゴリーラベルを表示する", () => {
    const item = createMockItem({ category: "MEDICATION" });
    render(<CarePlanDetailItemCard item={item} />);

    expect(screen.getByText("薬剤管理")).toBeDefined();
  });

  it("ステータスバッジを表示する", () => {
    const item = createMockItem({ status: "COMPLETED" });
    render(<CarePlanDetailItemCard item={item} />);

    expect(screen.getByText("完了")).toBeDefined();
  });

  it("完了アイテムの場合はアセスメント結果を表示する", () => {
    const item = createMockItem({
      status: "COMPLETED",
      instructions: "- リスク薬剤: ベンゾジアゼピン系",
    });
    render(<CarePlanDetailItemCard item={item} />);

    expect(screen.getByText("アセスメント結果")).toBeDefined();
    expect(screen.getByText("- リスク薬剤: ベンゾジアゼピン系")).toBeDefined();
  });

  it("実施中アイテムの場合もアセスメント結果を表示する", () => {
    const item = createMockItem({
      status: "IN_PROGRESS",
      instructions: "- 日中活動時に痛みあり",
    });
    render(<CarePlanDetailItemCard item={item} />);

    expect(screen.getByText("実施中")).toBeDefined();
    expect(screen.getByText("- 日中活動時に痛みあり")).toBeDefined();
  });

  it("未実施アイテムの場合は未実施メッセージを表示する", () => {
    const item = createMockItem({
      status: "NOT_STARTED",
      instructions: null,
    });
    render(<CarePlanDetailItemCard item={item} />);

    // ステータスバッジと本文で「未実施」が2回表示される
    const elements = screen.getAllByText("未実施");
    expect(elements.length).toBeGreaterThanOrEqual(2);
  });

  it("該当なしアイテムの場合は該当なしメッセージを表示する", () => {
    const item = createMockItem({
      status: "NOT_APPLICABLE",
      instructions: null,
    });
    render(<CarePlanDetailItemCard item={item} />);

    // ステータスバッジと本文で「該当なし」が2回表示される
    const elements = screen.getAllByText("該当なし");
    expect(elements.length).toBeGreaterThanOrEqual(2);
  });

  it("指示内容がない完了アイテムはアセスメント結果なしを表示する", () => {
    const item = createMockItem({
      status: "COMPLETED",
      instructions: null,
    });
    render(<CarePlanDetailItemCard item={item} />);

    expect(screen.getByText("アセスメント結果なし")).toBeDefined();
  });

  it("data-testidが正しく設定される", () => {
    const item = createMockItem({ category: "PAIN" });
    const { container } = render(<CarePlanDetailItemCard item={item} />);

    const element = container.querySelector('[data-testid="care-plan-detail-item-PAIN"]');
    expect(element).toBeDefined();
    expect(element).not.toBeNull();
  });

  it("更新日時を表示する", () => {
    const item = createMockItem({
      status: "COMPLETED",
      updatedAt: "2026-01-15T09:30:00.000Z",
    });
    render(<CarePlanDetailItemCard item={item} />);

    // 更新日時のテキストが含まれることを確認
    const element = screen.getByText(/更新日時:/);
    expect(element).toBeDefined();
  });
});
