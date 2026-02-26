import { describe, it, expect, vi, beforeEach } from "vitest";

// Prisma をモック
vi.mock("@delispect/db", () => ({
  prisma: {
    session: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

import { prisma } from "@delispect/db";
import {
  createSession,
  validateSession,
  invalidateSession,
  invalidateUserSessions,
  regenerateSessionId,
} from "./session";

const mockPrisma = vi.mocked(prisma);

describe("セッション管理", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createSession", () => {
    it("新規セッションを作成し、既存セッションを無効化する", async () => {
      mockPrisma.session.deleteMany.mockResolvedValue({ count: 1 });
      mockPrisma.session.create.mockResolvedValue({
        id: "new-session-id",
        userId: 1,
        expiresAt: new Date(),
        ipAddress: "127.0.0.1",
        createdAt: new Date(),
      });

      const result = await createSession(1, "user001", "127.0.0.1");

      expect(mockPrisma.session.deleteMany).toHaveBeenCalledWith({
        where: { userId: 1 },
      });
      expect(mockPrisma.session.create).toHaveBeenCalled();
      expect(result.userId).toBe(1);
      expect(result.username).toBe("user001");
      expect(result.sessionId).toBeDefined();
      expect(result.expiresAt).toBeDefined();
    });
  });

  describe("validateSession", () => {
    it("有効なセッションの場合はセッション情報を返す", async () => {
      const futureDate = new Date();
      futureDate.setMinutes(futureDate.getMinutes() + 30);

      mockPrisma.session.findUnique.mockResolvedValue({
        id: "session-id",
        userId: 1,
        expiresAt: futureDate,
        ipAddress: null,
        createdAt: new Date(),
        user: { username: "user001" },
      } as never);
      mockPrisma.session.update.mockResolvedValue({} as never);

      const result = await validateSession("session-id");

      expect(result).not.toBeNull();
      expect(result?.userId).toBe(1);
      expect(result?.username).toBe("user001");
    });

    it("存在しないセッションの場合はnullを返す", async () => {
      mockPrisma.session.findUnique.mockResolvedValue(null);

      const result = await validateSession("nonexistent");
      expect(result).toBeNull();
    });

    it("期限切れセッションの場合はnullを返し、セッションを削除する", async () => {
      const pastDate = new Date();
      pastDate.setMinutes(pastDate.getMinutes() - 1);

      mockPrisma.session.findUnique.mockResolvedValue({
        id: "expired-session",
        userId: 1,
        expiresAt: pastDate,
        ipAddress: null,
        createdAt: new Date(),
        user: { username: "user001" },
      } as never);
      mockPrisma.session.delete.mockResolvedValue({} as never);

      const result = await validateSession("expired-session");
      expect(result).toBeNull();
      expect(mockPrisma.session.delete).toHaveBeenCalled();
    });
  });

  describe("invalidateSession", () => {
    it("セッションを削除する", async () => {
      mockPrisma.session.delete.mockResolvedValue({} as never);

      await invalidateSession("session-id");
      expect(mockPrisma.session.delete).toHaveBeenCalledWith({
        where: { id: "session-id" },
      });
    });

    it("存在しないセッションでもエラーにならない", async () => {
      mockPrisma.session.delete.mockRejectedValue(new Error("Not found"));

      await expect(invalidateSession("nonexistent")).resolves.not.toThrow();
    });
  });

  describe("invalidateUserSessions", () => {
    it("ユーザーの全セッションを削除する", async () => {
      mockPrisma.session.deleteMany.mockResolvedValue({ count: 3 });

      await invalidateUserSessions(1);
      expect(mockPrisma.session.deleteMany).toHaveBeenCalledWith({
        where: { userId: 1 },
      });
    });
  });

  describe("regenerateSessionId", () => {
    it("セッションIDを再生成する", async () => {
      mockPrisma.session.findUnique.mockResolvedValue({
        id: "old-session",
        userId: 1,
        expiresAt: new Date(),
        ipAddress: "127.0.0.1",
        createdAt: new Date(),
      });
      mockPrisma.$transaction.mockResolvedValue([{}, {}]);

      const newId = await regenerateSessionId("old-session");
      expect(newId).toBeDefined();
      expect(newId).not.toBe("old-session");
    });

    it("存在しないセッションの場合はnullを返す", async () => {
      mockPrisma.session.findUnique.mockResolvedValue(null);

      const result = await regenerateSessionId("nonexistent");
      expect(result).toBeNull();
    });
  });
});
