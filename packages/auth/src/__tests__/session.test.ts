import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  generateSessionId,
  createSessionData,
  isSessionExpired,
  SESSION_TIMEOUT_MINUTES,
} from "../session";

describe("セッション管理", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("SESSION_TIMEOUT_MINUTESは30分", () => {
    expect(SESSION_TIMEOUT_MINUTES).toBe(30);
  });

  describe("generateSessionId", () => {
    it("セッションIDが生成される", () => {
      const sessionId = generateSessionId();
      expect(sessionId).toBeDefined();
      expect(typeof sessionId).toBe("string");
      expect(sessionId.length).toBeGreaterThan(0);
    });

    it("セッションIDは一意である", () => {
      const id1 = generateSessionId();
      const id2 = generateSessionId();
      expect(id1).not.toBe(id2);
    });
  });

  describe("createSessionData", () => {
    it("セッションデータが正しく作成される", () => {
      const now = new Date("2026-01-01T00:00:00Z");
      vi.setSystemTime(now);

      const session = createSessionData({
        userId: 1,
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0",
      });

      expect(session.userId).toBe(1);
      expect(session.ipAddress).toBe("192.168.1.1");
      expect(session.userAgent).toBe("Mozilla/5.0");
      expect(session.id).toBeDefined();
      expect(session.expiresAt).toBeDefined();

      const expectedExpiry = new Date(
        now.getTime() + SESSION_TIMEOUT_MINUTES * 60 * 1000
      );
      expect(session.expiresAt.getTime()).toBe(expectedExpiry.getTime());
    });
  });

  describe("isSessionExpired", () => {
    it("期限内のセッションは有効", () => {
      const futureDate = new Date(Date.now() + 1000 * 60 * 15); // 15 min from now
      expect(isSessionExpired(futureDate)).toBe(false);
    });

    it("期限切れのセッションは無効", () => {
      const pastDate = new Date(Date.now() - 1000 * 60); // 1 min ago
      expect(isSessionExpired(pastDate)).toBe(true);
    });
  });
});
