import { describe, it, expect, vi, beforeEach } from "vitest";
import { getResearchLogs, getResearchLogsForExport } from "../queries";

vi.mock("@delispect/db", () => {
  const mockFindMany = vi.fn();
  const mockCount = vi.fn();

  return {
    prisma: {
      researchLog: {
        findMany: mockFindMany,
        count: mockCount,
      },
    },
  };
});

import { prisma } from "@delispect/db";

/* eslint-disable @typescript-eslint/no-explicit-any */
const mockFindMany = prisma.researchLog.findMany as any;
const mockCount = prisma.researchLog.count as any;
/* eslint-enable @typescript-eslint/no-explicit-any */

describe("getResearchLogs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("デフォルトのページネーションでログ一覧を取得する", async () => {
    mockFindMany.mockResolvedValue([
      {
        id: BigInt(1),
        anonymizedId: "hash1",
        actionType: "PAGE_VIEW",
        details: { path: "/patients" },
        occurredAt: new Date("2026-01-15T10:00:00Z"),
      },
    ]);
    mockCount.mockResolvedValue(1);

    const result = await getResearchLogs({});

    expect(result.items).toHaveLength(1);
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(20);
    expect(result.totalCount).toBe(1);
    expect(result.items[0].anonymizedId).toBe("hash1");
  });

  it("ページとページサイズを指定して取得する", async () => {
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(50);

    const result = await getResearchLogs({ page: 3, pageSize: 10 });

    expect(result.page).toBe(3);
    expect(result.pageSize).toBe(10);
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 20,
        take: 10,
      }),
    );
  });

  it("日付範囲フィルターを適用する", async () => {
    const startDate = new Date("2026-01-01");
    const endDate = new Date("2026-01-31");

    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    await getResearchLogs({ startDate, endDate });

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          occurredAt: {
            gte: startDate,
            lte: endDate,
          },
        }),
      }),
    );
  });

  it("アクション種別フィルターを適用する", async () => {
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    await getResearchLogs({ actionType: "USER_LOGIN" });

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          actionType: "USER_LOGIN",
        }),
      }),
    );
  });
});

describe("getResearchLogsForExport", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("指定期間のログをすべて取得する", async () => {
    const startDate = new Date("2026-01-01");
    const endDate = new Date("2026-01-31");

    mockFindMany.mockResolvedValue([
      {
        id: BigInt(1),
        anonymizedId: "hash1",
        actionType: "PAGE_VIEW",
        details: null,
        occurredAt: new Date("2026-01-15T10:00:00Z"),
      },
    ]);

    const result = await getResearchLogsForExport(startDate, endDate);

    expect(result).toHaveLength(1);
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          occurredAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: { occurredAt: "asc" },
      }),
    );
  });

  it("アクション種別フィルター付きで取得する", async () => {
    const startDate = new Date("2026-01-01");
    const endDate = new Date("2026-01-31");

    mockFindMany.mockResolvedValue([]);

    await getResearchLogsForExport(startDate, endDate, "USER_LOGIN");

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          actionType: "USER_LOGIN",
        }),
      }),
    );
  });
});
