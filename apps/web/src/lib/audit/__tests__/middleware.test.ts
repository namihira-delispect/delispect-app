import { describe, it, expect, vi, beforeEach } from "vitest";
import { withAuditLog, logAudit } from "../middleware";
import * as auditLogger from "../auditLogger";

// recordAuditLogをモック
vi.mock("../auditLogger", () => ({
  recordAuditLog: vi.fn().mockResolvedValue(null),
}));

const mockRecordAuditLog = vi.mocked(auditLogger.recordAuditLog);

describe("withAuditLog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("業務処理の結果をそのまま返す", async () => {
    const operation = vi.fn().mockResolvedValue({ id: 1, name: "テスト" });

    const result = await withAuditLog(
      {
        actorId: 1,
        action: "CREATE",
        targetType: "PATIENT",
        targetId: "123",
      },
      operation,
    );

    expect(result).toEqual({ id: 1, name: "テスト" });
    expect(operation).toHaveBeenCalledOnce();
  });

  it("業務処理の成功後に監査ログを記録する", async () => {
    const operation = vi.fn().mockResolvedValue({ id: 1 });

    await withAuditLog(
      {
        actorId: 1,
        action: "CREATE",
        targetType: "PATIENT",
        targetId: "123",
      },
      operation,
    );

    // recordAuditLogが呼ばれるまで少し待つ（非同期処理のため）
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(mockRecordAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        actorId: 1,
        action: "CREATE",
        targetType: "PATIENT",
        targetId: "123",
      }),
    );
  });

  it("業務処理が失敗した場合はエラーをそのままスローする", async () => {
    const operation = vi.fn().mockRejectedValue(new Error("業務処理エラー"));

    await expect(
      withAuditLog(
        {
          actorId: 1,
          action: "CREATE",
          targetType: "PATIENT",
          targetId: "123",
        },
        operation,
      ),
    ).rejects.toThrow("業務処理エラー");
  });

  it("getBeforeDataで操作前データを取得する", async () => {
    const beforeData = { name: "変更前の名前" };
    const operation = vi.fn().mockResolvedValue({ id: 1 });

    await withAuditLog(
      {
        actorId: 1,
        action: "UPDATE",
        targetType: "PATIENT",
        targetId: "123",
        getBeforeData: async () => beforeData,
      },
      operation,
    );

    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(mockRecordAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        beforeData,
      }),
    );
  });

  it("getAfterDataで操作後データを結果から取得する", async () => {
    const operationResult = { id: 1, name: "新しい名前" };
    const operation = vi.fn().mockResolvedValue(operationResult);

    await withAuditLog(
      {
        actorId: 1,
        action: "CREATE",
        targetType: "PATIENT",
        targetId: "123",
        getAfterData: (result) => ({ name: (result as { name: string }).name }),
      },
      operation,
    );

    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(mockRecordAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        afterData: { name: "新しい名前" },
      }),
    );
  });

  it("IPアドレスを監査ログに含める", async () => {
    const operation = vi.fn().mockResolvedValue({ id: 1 });

    await withAuditLog(
      {
        actorId: 1,
        action: "LOGIN",
        targetType: "SESSION",
        targetId: "session-1",
        ipAddress: "192.168.1.100",
      },
      operation,
    );

    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(mockRecordAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        ipAddress: "192.168.1.100",
      }),
    );
  });

  it("監査ログ記録の失敗は業務処理に影響しない", async () => {
    mockRecordAuditLog.mockRejectedValue(new Error("DB error"));
    const operation = vi.fn().mockResolvedValue({ id: 1, name: "成功" });

    const result = await withAuditLog(
      {
        actorId: 1,
        action: "CREATE",
        targetType: "PATIENT",
        targetId: "123",
      },
      operation,
    );

    expect(result).toEqual({ id: 1, name: "成功" });
  });

  it("getBeforeDataの失敗は業務処理に影響しない", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const operation = vi.fn().mockResolvedValue({ id: 1 });

    const result = await withAuditLog(
      {
        actorId: 1,
        action: "UPDATE",
        targetType: "PATIENT",
        targetId: "123",
        getBeforeData: async () => {
          throw new Error("beforeData取得失敗");
        },
      },
      operation,
    );

    expect(result).toEqual({ id: 1 });
    expect(operation).toHaveBeenCalledOnce();

    consoleSpy.mockRestore();
  });
});

describe("logAudit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("監査ログ入力データでrecordAuditLogを呼び出す", async () => {
    await logAudit({
      actorId: 1,
      action: "VIEW",
      targetType: "PATIENT",
      targetId: "123",
    });

    expect(mockRecordAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        actorId: 1,
        action: "VIEW",
        targetType: "PATIENT",
        targetId: "123",
      }),
    );
  });

  it("beforeDataとafterDataを渡せる", async () => {
    await logAudit({
      actorId: 1,
      action: "UPDATE",
      targetType: "PATIENT",
      targetId: "123",
      beforeData: { name: "変更前" },
      afterData: { name: "変更後" },
    });

    expect(mockRecordAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        beforeData: { name: "変更前" },
        afterData: { name: "変更後" },
      }),
    );
  });

  it("recordAuditLogが失敗してもエラーをスローしない", async () => {
    mockRecordAuditLog.mockRejectedValue(new Error("DB error"));

    await expect(
      logAudit({
        actorId: 1,
        action: "VIEW",
        targetType: "PATIENT",
        targetId: "123",
      }),
    ).resolves.toBeUndefined();
  });
});
