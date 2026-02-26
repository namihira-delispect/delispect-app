import { describe, it, expect, vi, beforeEach } from "vitest";
import { getDashboardSummary, getUsageSummary, getClinicalSummary } from "../aggregation";

vi.mock("@delispect/db", () => {
  const mockCount = vi.fn();
  const mockFindMany = vi.fn();

  return {
    prisma: {
      researchLog: {
        count: mockCount,
        findMany: mockFindMany,
      },
    },
  };
});

import { prisma } from "@delispect/db";

/* eslint-disable @typescript-eslint/no-explicit-any */
const mockCount = prisma.researchLog.count as any;
const mockFindMany = prisma.researchLog.findMany as any;
/* eslint-enable @typescript-eslint/no-explicit-any */

const startDate = new Date("2026-01-01T00:00:00Z");
const endDate = new Date("2026-01-31T23:59:59Z");

describe("getUsageSummary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("ログイン数を正しく集計する", async () => {
    // ログイン数: 10
    // 各機能利用回数: EMR=5, Risk=3, CarePlan=2, HighRisk=1, Nursing=0
    // ケアプラン開始: 4, 完了: 2
    mockCount
      .mockResolvedValueOnce(10) // loginCount
      .mockResolvedValueOnce(5)  // EMR_SYNC_COMPLETE
      .mockResolvedValueOnce(3)  // RISK_ASSESSMENT_COMPLETE
      .mockResolvedValueOnce(2)  // CARE_PLAN_COMPLETE
      .mockResolvedValueOnce(1)  // HIGH_RISK_KASAN_ASSESS
      .mockResolvedValueOnce(0)  // NURSING_TRANSCRIPTION
      .mockResolvedValueOnce(4)  // CARE_PLAN_START
      .mockResolvedValueOnce(2); // CARE_PLAN_COMPLETE

    const result = await getUsageSummary(startDate, endDate);

    expect(result.loginCount).toBe(10);
    expect(result.featureUsage.EMR_SYNC_COMPLETE).toBe(5);
    expect(result.featureUsage.RISK_ASSESSMENT_COMPLETE).toBe(3);
    expect(result.carePlanCompletionRate).toBe(0.5);
  });

  it("ケアプラン開始が0件の場合、完了率は0を返す", async () => {
    mockCount.mockResolvedValue(0);

    const result = await getUsageSummary(startDate, endDate);

    expect(result.carePlanCompletionRate).toBe(0);
  });
});

describe("getClinicalSummary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("臨床指標を正しく集計する", async () => {
    // EMR同期: 10, リスク評価: 8, ケアプラン完了: 6
    mockCount
      .mockResolvedValueOnce(10) // EMR_SYNC_COMPLETE
      .mockResolvedValueOnce(8)  // RISK_ASSESSMENT_COMPLETE
      .mockResolvedValueOnce(6); // CARE_PLAN_COMPLETE

    // ケアプランステップ完了ログ
    mockFindMany.mockResolvedValue([
      { details: { category: "MEDICATION" } },
      { details: { category: "MEDICATION" } },
      { details: { category: "MEDICATION" } },
      { details: { category: "PAIN" } },
      { details: { category: "PAIN" } },
      { details: { category: "DEHYDRATION" } },
    ]);

    const result = await getClinicalSummary(startDate, endDate);

    expect(result.riskAssessmentRate).toBe(0.8);
    expect(result.carePlanCreationRate).toBe(0.75);
    expect(result.itemCreationRates.MEDICATION).toBe(0.5);
    expect(result.itemCreationRates.PAIN).toBeCloseTo(0.333, 2);
  });

  it("データが0件の場合、すべての率が0を返す", async () => {
    mockCount.mockResolvedValue(0);

    const result = await getClinicalSummary(startDate, endDate);

    expect(result.riskAssessmentRate).toBe(0);
    expect(result.carePlanCreationRate).toBe(0);
    expect(result.itemCreationRates.MEDICATION).toBe(0);
    expect(result.itemCreationRates.SLEEP).toBe(0);
  });
});

describe("getDashboardSummary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("利用状況と臨床指標の両方のサマリーを返す", async () => {
    mockCount.mockResolvedValue(0);
    mockFindMany.mockResolvedValue([]);

    const result = await getDashboardSummary(startDate, endDate);

    expect(result).toHaveProperty("usage");
    expect(result).toHaveProperty("clinical");
    expect(result).toHaveProperty("period");
    expect(result.period.startDate).toBe("2026-01-01");
    expect(result.period.endDate).toBe("2026-01-31");
  });
});
