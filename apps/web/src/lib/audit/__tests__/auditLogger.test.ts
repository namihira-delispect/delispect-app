import { describe, it, expect, vi, beforeEach } from "vitest";
import { recordAuditLog, recordAuditLogBatch } from "../auditLogger";
import type { AuditLogInput } from "../types";

// Prismaクライアントをモック（監査ログのテストではDBアクセスをモックする）
vi.mock("@delispect/db", () => {
  const mockCreate = vi.fn();
  const mockFindFirst = vi.fn();
  const mockTransaction = vi.fn();

  return {
    prisma: {
      auditLog: {
        create: mockCreate,
        findFirst: mockFindFirst,
      },
      $transaction: mockTransaction,
    },
  };
});

// モック後にインポート
import { prisma } from "@delispect/db";

/* eslint-disable @typescript-eslint/no-explicit-any */
const mockCreate = prisma.auditLog.create as any;
const mockFindFirst = prisma.auditLog.findFirst as any;
const mockTransaction = prisma.$transaction as any;
/* eslint-enable @typescript-eslint/no-explicit-any */

describe("recordAuditLog", () => {
  const baseInput: AuditLogInput = {
    actorId: 1,
    action: "CREATE",
    targetType: "PATIENT",
    targetId: "123",
    afterData: { name: "テスト患者" },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("監査ログレコードを正しく作成する", async () => {
    mockFindFirst.mockResolvedValue(null);
    mockCreate.mockResolvedValue({
      id: BigInt(1),
      actorId: 1,
      action: "CREATE",
      targetType: "PATIENT",
      targetId: "123",
      beforeData: null,
      afterData: { name: "テスト患者" },
      hash: "abc123",
      prevHash: null,
      occurredAt: new Date("2026-01-15T10:00:00.000Z"),
    });

    const result = await recordAuditLog(baseInput);

    expect(result).not.toBeNull();
    expect(result!.actorId).toBe(1);
    expect(result!.action).toBe("CREATE");
    expect(result!.targetType).toBe("PATIENT");
    expect(result!.targetId).toBe("123");
    expect(mockCreate).toHaveBeenCalledOnce();
  });

  it("前のレコードのハッシュ値をprevHashとして使用する", async () => {
    mockFindFirst.mockResolvedValue({ hash: "previous_hash_value" });
    mockCreate.mockResolvedValue({
      id: BigInt(2),
      actorId: 1,
      action: "CREATE",
      targetType: "PATIENT",
      targetId: "123",
      beforeData: null,
      afterData: { name: "テスト患者" },
      hash: "new_hash",
      prevHash: "previous_hash_value",
      occurredAt: new Date(),
    });

    await recordAuditLog(baseInput);

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          prevHash: "previous_hash_value",
        }),
      }),
    );
  });

  it("IPアドレスをafterDataに含める", async () => {
    mockFindFirst.mockResolvedValue(null);
    mockCreate.mockResolvedValue({
      id: BigInt(1),
      actorId: 1,
      action: "LOGIN",
      targetType: "SESSION",
      targetId: "session-1",
      beforeData: null,
      afterData: { ipAddress: "192.168.1.1" },
      hash: "abc",
      prevHash: null,
      occurredAt: new Date(),
    });

    const inputWithIp: AuditLogInput = {
      actorId: 1,
      action: "LOGIN",
      targetType: "SESSION",
      targetId: "session-1",
      ipAddress: "192.168.1.1",
    };

    await recordAuditLog(inputWithIp);

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          afterData: expect.objectContaining({
            ipAddress: "192.168.1.1",
          }),
        }),
      }),
    );
  });

  it("ログ記録失敗時はnullを返し、業務操作に影響を与えない", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockFindFirst.mockRejectedValue(new Error("DB connection error"));

    const result = await recordAuditLog(baseInput);

    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith(
      "[AuditLog] ログ記録に失敗しました",
      expect.objectContaining({
        input: expect.objectContaining({
          actorId: 1,
          action: "CREATE",
        }),
      }),
    );

    consoleSpy.mockRestore();
  });

  it("hashフィールドが64文字の16進文字列で記録される", async () => {
    mockFindFirst.mockResolvedValue(null);
    mockCreate.mockImplementation(async (args: { data: Record<string, unknown> }) => {
      const data = args.data;
      return {
        id: BigInt(1),
        actorId: data.actorId as number,
        action: data.action as string,
        targetType: data.targetType as string,
        targetId: data.targetId as string,
        beforeData: null,
        afterData: null,
        hash: data.hash as string,
        prevHash: data.prevHash as string | null,
        occurredAt: data.occurredAt as Date,
      };
    });

    const result = await recordAuditLog({
      actorId: 1,
      action: "VIEW",
      targetType: "PATIENT",
      targetId: "123",
    });

    expect(result).not.toBeNull();
    expect(result!.hash).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe("recordAuditLogBatch", () => {
  const inputs: AuditLogInput[] = [
    {
      actorId: 1,
      action: "LOGIN",
      targetType: "SESSION",
      targetId: "session-1",
    },
    {
      actorId: 1,
      action: "VIEW",
      targetType: "PATIENT",
      targetId: "patient-1",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("空配列の場合は空配列を返す", async () => {
    const result = await recordAuditLogBatch([]);

    expect(result).toEqual([]);
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it("複数のログをトランザクション内で順次記録する", async () => {
    let callCount = 0;
    mockTransaction.mockImplementation(async (fn: (tx: unknown) => Promise<void>) => {
      const txClient = {
        auditLog: {
          findFirst: vi.fn().mockResolvedValue(null),
          create: vi.fn().mockImplementation(async () => {
            callCount++;
            return {
              id: BigInt(callCount),
              actorId: 1,
              action: callCount === 1 ? "LOGIN" : "VIEW",
              targetType: callCount === 1 ? "SESSION" : "PATIENT",
              targetId: callCount === 1 ? "session-1" : "patient-1",
              beforeData: null,
              afterData: null,
              hash: `hash_${callCount}`,
              prevHash: callCount === 1 ? null : `hash_${callCount - 1}`,
              occurredAt: new Date(),
            };
          }),
        },
      };
      return fn(txClient);
    });

    const results = await recordAuditLogBatch(inputs);

    expect(results).toHaveLength(2);
    expect(mockTransaction).toHaveBeenCalledOnce();
  });

  it("バッチ記録失敗時は空配列を返し、業務操作に影響を与えない", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockTransaction.mockRejectedValue(new Error("Transaction failed"));

    const results = await recordAuditLogBatch(inputs);

    expect(results).toEqual([]);
    expect(consoleSpy).toHaveBeenCalledWith(
      "[AuditLog] バッチログ記録に失敗しました",
      expect.objectContaining({
        count: 2,
      }),
    );

    consoleSpy.mockRestore();
  });
});
