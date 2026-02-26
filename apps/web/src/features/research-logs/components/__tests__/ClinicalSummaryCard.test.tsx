import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ClinicalSummaryCard } from "../ClinicalSummaryCard";
import type { ClinicalSummary } from "@/lib/research-log";

describe("ClinicalSummaryCard", () => {
  const mockSummary: ClinicalSummary = {
    riskAssessmentRate: 0.8,
    carePlanCreationRate: 0.75,
    itemCreationRates: {
      MEDICATION: 0.9,
      PAIN: 0.6,
      DEHYDRATION: 0.5,
      CONSTIPATION: 0.4,
      INFLAMMATION: 0.3,
      MOBILITY: 0.7,
      DEMENTIA: 0.2,
      SAFETY: 0.8,
      SLEEP: 0.55,
    },
  };

  it("タイトルを表示する", () => {
    render(<ClinicalSummaryCard summary={mockSummary} />);
    expect(screen.getByText("臨床指標サマリー")).toBeDefined();
  });

  it("リスク評価実施率をパーセントで表示する", () => {
    render(<ClinicalSummaryCard summary={mockSummary} />);
    expect(screen.getByText("リスク評価実施率")).toBeDefined();
    // 80.0%は複数箇所に表示される可能性があるためgetAllByTextで検証
    const elements = screen.getAllByText("80.0%");
    expect(elements.length).toBeGreaterThanOrEqual(1);
  });

  it("ケアプラン作成率をパーセントで表示する", () => {
    render(<ClinicalSummaryCard summary={mockSummary} />);
    expect(screen.getByText("ケアプラン作成率")).toBeDefined();
    expect(screen.getByText("75.0%")).toBeDefined();
  });

  it("項目別作成実施率のサブタイトルを表示する", () => {
    render(<ClinicalSummaryCard summary={mockSummary} />);
    expect(screen.getByText("ケアプラン項目別作成実施率")).toBeDefined();
  });

  it("各カテゴリの日本語ラベルを表示する", () => {
    render(<ClinicalSummaryCard summary={mockSummary} />);
    expect(screen.getByText("薬剤")).toBeDefined();
    expect(screen.getByText("疼痛")).toBeDefined();
    expect(screen.getByText("脱水")).toBeDefined();
    expect(screen.getByText("便秘")).toBeDefined();
    expect(screen.getByText("炎症")).toBeDefined();
    expect(screen.getByText("離床")).toBeDefined();
    expect(screen.getByText("認知症")).toBeDefined();
    expect(screen.getByText("安全管理")).toBeDefined();
    expect(screen.getByText("睡眠")).toBeDefined();
  });
});
