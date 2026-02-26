import { describe, it, expect, vi, beforeEach } from "vitest";
import { recordResearchLog, recordResearchLogBatch, withResearchLog } from "../collector";
import type { ResearchLogInput } from "../types";

vi.mock("@delispect/db", () => {
  const mockCreate = vi.fn();
  const mockCreateMany = vi.fn();

  return {
    prisma: {
      researchLog: {
        create: mockCreate,
        createMany: mockCreateMany,
      },
    },
  };
});

import { prisma } from "@delispect/db";

/* eslint-disable @typescript-eslint/no-explicit-any */
const mockCreate = prisma.researchLog.create as any;
const mockCreateMany = prisma.researchLog.createMany as any;
/* eslint-enable @typescript-eslint/no-explicit-any */

describe("recordResearchLog", () => {
  const baseInput: ResearchLogInput = {
    anonymizedId: "abc123hash",
    actionType: "PAGE_VIEW",
    details: { toPath: "/patients", timestamp: "2026-01-15T10:00:00Z" },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("操作ログを正しく記録する", async () => {
    mockCreate.mockResolvedValue({
      id: BigInt(1),
      anonymizedId: "abc123hash",
      actionType: "PAGE_VIEW",
      details: { toPath: "/patients", timestamp: "2026-01-15T10:00:00Z" },
      occurredAt: new Date(),
    });

    const result = await recordResearchLog(baseInput);

    expect(result).toBe(true);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          anonymizedId: "abc123hash",
          actionType: "PAGE_VIEW",
        }),
      }),
    );
  });

  it("詳細データなしでもログを記録できる", async () => {
    mockCreate.mockResolvedValue({
      id: BigInt(2),
      anonymizedId: "abc123hash",
      actionType: "USER_LOGIN",
      details: null,
      occurredAt: new Date(),
    });

    const result = await recordResearchLog({
      anonymizedId: "abc123hash",
      actionType: "USER_LOGIN",
    });

    expect(result).toBe(true);
  });

  it("記録失敗時はfalseを返し、業務操作に影響を与えない", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockCreate.mockRejectedValue(new Error("DB connection error"));

    const result = await recordResearchLog(baseInput);

    expect(result).toBe(false);
    expect(consoleSpy).toHaveBeenCalledWith(
      "[ResearchLog] ログ記録に失敗しました",
      expect.objectContaining({
        actionType: "PAGE_VIEW",
      }),
    );

    consoleSpy.mockRestore();
  });
});

describe("recordResearchLogBatch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("空配列の場合は0を返す", async () => {
    const result = await recordResearchLogBatch([]);
    expect(result).toBe(0);
    expect(mockCreateMany).not.toHaveBeenCalled();
  });

  it("複数件のログを一括で記録する", async () => {
    mockCreateMany.mockResolvedValue({ count: 3 });

    const inputs: ResearchLogInput[] = [
      { anonymizedId: "a", actionType: "PAGE_VIEW" },
      { anonymizedId: "b", actionType: "BUTTON_CLICK" },
      { anonymizedId: "c", actionType: "USER_LOGIN" },
    ];

    const result = await recordResearchLogBatch(inputs);

    expect(result).toBe(3);
    expect(mockCreateMany).toHaveBeenCalledOnce();
  });

  it("バッチ記録失敗時は0を返す", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockCreateMany.mockRejectedValue(new Error("Batch insert failed"));

    const result = await recordResearchLogBatch([
      { anonymizedId: "a", actionType: "PAGE_VIEW" },
    ]);

    expect(result).toBe(0);
    consoleSpy.mockRestore();
  });
});

describe("withResearchLog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("業務処理を実行してその結果を返す", async () => {
    mockCreate.mockResolvedValue({
      id: BigInt(1),
      anonymizedId: "hash",
      actionType: "CARE_PLAN_COMPLETE",
      details: null,
      occurredAt: new Date(),
    });

    const result = await withResearchLog(
      { anonymizedId: "hash", actionType: "CARE_PLAN_COMPLETE" },
      async () => ({ id: 42, name: "テスト" }),
    );

    expect(result).toEqual({ id: 42, name: "テスト" });
  });

  it("ログ記録の失敗が業務処理の結果に影響しない", async () => {
    mockCreate.mockRejectedValue(new Error("Log failed"));
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await withResearchLog(
      { anonymizedId: "hash", actionType: "CARE_PLAN_COMPLETE" },
      async () => "成功",
    );

    expect(result).toBe("成功");
    consoleSpy.mockRestore();
  });
});
