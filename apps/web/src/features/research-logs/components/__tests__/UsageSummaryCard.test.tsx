import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { UsageSummaryCard } from "../UsageSummaryCard";
import type { UsageSummary } from "@/lib/research-log";

describe("UsageSummaryCard", () => {
  const mockSummary: UsageSummary = {
    loginCount: 42,
    featureUsage: {
      EMR_SYNC_COMPLETE: 10,
      RISK_ASSESSMENT_COMPLETE: 8,
      CARE_PLAN_COMPLETE: 5,
      HIGH_RISK_KASAN_ASSESS: 3,
      NURSING_TRANSCRIPTION: 2,
    },
    carePlanCompletionRate: 0.625,
  };

  it("タイトルを表示する", () => {
    render(<UsageSummaryCard summary={mockSummary} />);
    expect(screen.getByText("利用状況サマリー")).toBeDefined();
  });

  it("ログイン数を表示する", () => {
    render(<UsageSummaryCard summary={mockSummary} />);
    expect(screen.getByText("ログイン数")).toBeDefined();
    expect(screen.getByText("42")).toBeDefined();
  });

  it("ケアプラン完了率をパーセントで表示する", () => {
    render(<UsageSummaryCard summary={mockSummary} />);
    expect(screen.getByText("ケアプラン完了率")).toBeDefined();
    expect(screen.getByText("62.5%")).toBeDefined();
  });

  it("機能別の利用回数を表示する", () => {
    render(<UsageSummaryCard summary={mockSummary} />);
    expect(screen.getByText("電子カルテ同期")).toBeDefined();
    expect(screen.getByText("10")).toBeDefined();
    expect(screen.getByText("リスク評価")).toBeDefined();
    expect(screen.getByText("8")).toBeDefined();
  });
});
