import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CarePlanItemRow } from "../CarePlanItemRow";
import type { CarePlanItemEntry } from "../../types";

const mockItem: CarePlanItemEntry = {
  id: 1,
  category: "MEDICATION",
  status: "NOT_STARTED",
  instructions: null,
  updatedAt: "2026-02-27T10:00:00.000Z",
};

describe("CarePlanItemRow", () => {
  it("カテゴリー名が日本語で表示される", () => {
    render(<CarePlanItemRow item={mockItem} admissionId={1} />);
    expect(screen.getByText("薬剤管理")).toBeDefined();
  });

  it("カテゴリーの説明が表示される", () => {
    render(<CarePlanItemRow item={mockItem} admissionId={1} />);
    expect(screen.getByText("リスク薬剤の確認と薬剤変更提案")).toBeDefined();
  });

  it("未実施ステータスが表示される", () => {
    render(<CarePlanItemRow item={mockItem} admissionId={1} />);
    expect(screen.getByText("未実施")).toBeDefined();
  });

  it("未実施の場合はケアプラン作成ボタンが表示される", () => {
    render(<CarePlanItemRow item={mockItem} admissionId={1} />);
    const link = screen.getByText("ケアプラン作成");
    expect(link.getAttribute("href")).toBe("/admissions/1/care-plan/medication");
  });

  it("実施中の場合は続きを入力ボタンが表示される", () => {
    const inProgressItem: CarePlanItemEntry = {
      ...mockItem,
      status: "IN_PROGRESS",
    };
    render(<CarePlanItemRow item={inProgressItem} admissionId={2} />);
    expect(screen.getByText("実施中")).toBeDefined();
    const link = screen.getByText("続きを入力");
    expect(link.getAttribute("href")).toBe("/admissions/2/care-plan/medication");
  });

  it("完了の場合は詳細を確認ボタンが表示される", () => {
    const completedItem: CarePlanItemEntry = {
      ...mockItem,
      status: "COMPLETED",
    };
    render(<CarePlanItemRow item={completedItem} admissionId={3} />);
    expect(screen.getByText("完了")).toBeDefined();
    const link = screen.getByText("詳細を確認");
    expect(link.getAttribute("href")).toBe("/admissions/3/care-plan/medication");
  });

  it("疼痛カテゴリーが正しく表示される", () => {
    const painItem: CarePlanItemEntry = {
      id: 2,
      category: "PAIN",
      status: "IN_PROGRESS",
      instructions: "痛み確認中",
      updatedAt: "2026-02-27T10:00:00.000Z",
    };
    render(<CarePlanItemRow item={painItem} admissionId={1} />);
    expect(screen.getByText("疼痛管理")).toBeDefined();
    expect(screen.getByText("痛みの確認と生活への影響評価")).toBeDefined();
  });

  it("離床カテゴリーが正しく表示される", () => {
    const mobilityItem: CarePlanItemEntry = {
      id: 6,
      category: "MOBILITY",
      status: "NOT_STARTED",
      instructions: null,
      updatedAt: "2026-02-27T10:00:00.000Z",
    };
    render(<CarePlanItemRow item={mobilityItem} admissionId={1} />);
    expect(screen.getByText("離床促進")).toBeDefined();
  });
});
