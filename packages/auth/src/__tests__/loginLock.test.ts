import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  checkLoginLock,
  incrementFailedAttempts,
  resetFailedAttempts,
  MAX_FAILED_ATTEMPTS,
  LOCK_DURATION_HOURS,
} from "../loginLock";

describe("ログインロック機能", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("MAX_FAILED_ATTEMPTSは5回", () => {
    expect(MAX_FAILED_ATTEMPTS).toBe(5);
  });

  it("LOCK_DURATION_HOURSは24時間", () => {
    expect(LOCK_DURATION_HOURS).toBe(24);
  });

  describe("checkLoginLock", () => {
    it("ロックされていないユーザーはロック状態でない", () => {
      const result = checkLoginLock({
        failedLoginAttempts: 0,
        lockedUntil: null,
      });
      expect(result.isLocked).toBe(false);
    });

    it("ロック時刻が未来のユーザーはロック状態", () => {
      const futureDate = new Date(Date.now() + 1000 * 60 * 60); // 1 hour from now
      const result = checkLoginLock({
        failedLoginAttempts: 5,
        lockedUntil: futureDate,
      });
      expect(result.isLocked).toBe(true);
    });

    it("ロック時刻が過去のユーザーはロック解除", () => {
      const pastDate = new Date(Date.now() - 1000 * 60); // 1 minute ago
      const result = checkLoginLock({
        failedLoginAttempts: 5,
        lockedUntil: pastDate,
      });
      expect(result.isLocked).toBe(false);
    });
  });

  describe("incrementFailedAttempts", () => {
    it("失敗回数が1増加する", () => {
      const result = incrementFailedAttempts(0);
      expect(result.failedLoginAttempts).toBe(1);
      expect(result.lockedUntil).toBeNull();
    });

    it("5回目の失敗でロックされる", () => {
      const now = new Date("2026-01-01T00:00:00Z");
      vi.setSystemTime(now);

      const result = incrementFailedAttempts(4);
      expect(result.failedLoginAttempts).toBe(5);
      expect(result.lockedUntil).not.toBeNull();

      if (result.lockedUntil) {
        const expectedLockUntil = new Date(
          now.getTime() + LOCK_DURATION_HOURS * 60 * 60 * 1000
        );
        expect(result.lockedUntil.getTime()).toBe(expectedLockUntil.getTime());
      }
    });

    it("4回目の失敗ではロックされない", () => {
      const result = incrementFailedAttempts(3);
      expect(result.failedLoginAttempts).toBe(4);
      expect(result.lockedUntil).toBeNull();
    });
  });

  describe("resetFailedAttempts", () => {
    it("失敗回数が0にリセットされる", () => {
      const result = resetFailedAttempts();
      expect(result.failedLoginAttempts).toBe(0);
      expect(result.lockedUntil).toBeNull();
    });
  });
});
