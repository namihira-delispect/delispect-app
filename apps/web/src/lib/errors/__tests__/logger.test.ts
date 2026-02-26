import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { logger, maskSensitiveData } from "../logger";

describe("logger", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "info").mockImplementation(() => {});
    vi.spyOn(console, "debug").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  describe("maskSensitiveData", () => {
    it("パスワードをマスキングする", () => {
      const result = maskSensitiveData({
        userId: "123",
        password: "secret123",
      });

      expect(result.userId).toBe("123");
      expect(result.password).toBe("[MASKED]");
    });

    it("トークン情報をマスキングする", () => {
      const result = maskSensitiveData({
        token: "abc123",
        accessToken: "xyz789",
        refreshToken: "refresh_token",
      });

      expect(result.token).toBe("[MASKED]");
      expect(result.accessToken).toBe("[MASKED]");
      expect(result.refreshToken).toBe("[MASKED]");
    });

    it("患者の個人情報をマスキングする", () => {
      const result = maskSensitiveData({
        patientId: "P001",
        patientName: "山田太郎",
        patientAddress: "東京都千代田区",
        phoneNumber: "090-1234-5678",
        email: "test@example.com",
        birthDate: "1990-01-01",
      });

      expect(result.patientId).toBe("P001");
      expect(result.patientName).toBe("[MASKED]");
      expect(result.patientAddress).toBe("[MASKED]");
      expect(result.phoneNumber).toBe("[MASKED]");
      expect(result.email).toBe("[MASKED]");
      expect(result.birthDate).toBe("[MASKED]");
    });

    it("ネストされたオブジェクト内の機密情報もマスキングする", () => {
      const result = maskSensitiveData({
        user: {
          id: "123",
          password: "secret",
        },
      });

      expect(result.user).toEqual({
        id: "123",
        password: "[MASKED]",
      });
    });

    it("機密でない情報はそのまま保持する", () => {
      const result = maskSensitiveData({
        action: "login",
        timestamp: "2026-01-01T00:00:00Z",
        statusCode: 200,
      });

      expect(result.action).toBe("login");
      expect(result.timestamp).toBe("2026-01-01T00:00:00Z");
      expect(result.statusCode).toBe(200);
    });
  });

  describe("logger.error", () => {
    it("console.errorにJSON形式で出力する", () => {
      logger.error("テストエラー", { code: "TEST_ERROR" });

      expect(console.error).toHaveBeenCalledTimes(1);
      const logEntry = JSON.parse(
        (console.error as ReturnType<typeof vi.fn>).mock.calls[0][0],
      );
      expect(logEntry.level).toBe("error");
      expect(logEntry.message).toBe("テストエラー");
      expect(logEntry.context.code).toBe("TEST_ERROR");
      expect(logEntry.timestamp).toBeDefined();
    });
  });

  describe("logger.warn", () => {
    it("console.warnにJSON形式で出力する", () => {
      logger.warn("警告メッセージ");

      expect(console.warn).toHaveBeenCalledTimes(1);
      const logEntry = JSON.parse(
        (console.warn as ReturnType<typeof vi.fn>).mock.calls[0][0],
      );
      expect(logEntry.level).toBe("warn");
      expect(logEntry.message).toBe("警告メッセージ");
    });
  });

  describe("logger.info", () => {
    it("console.infoにJSON形式で出力する", () => {
      logger.info("情報メッセージ", { userId: "123" });

      expect(console.info).toHaveBeenCalledTimes(1);
      const logEntry = JSON.parse(
        (console.info as ReturnType<typeof vi.fn>).mock.calls[0][0],
      );
      expect(logEntry.level).toBe("info");
      expect(logEntry.message).toBe("情報メッセージ");
      expect(logEntry.context.userId).toBe("123");
    });
  });

  describe("logger.debug", () => {
    it("開発環境ではconsole.debugに出力する", () => {
      vi.stubEnv("NODE_ENV", "development");
      logger.debug("デバッグメッセージ");

      expect(console.debug).toHaveBeenCalledTimes(1);
    });

    it("本番環境ではconsole.debugに出力しない", () => {
      vi.stubEnv("NODE_ENV", "production");
      logger.debug("デバッグメッセージ");

      expect(console.debug).not.toHaveBeenCalled();
    });
  });

  describe("機密情報のマスキング統合", () => {
    it("ログ出力時に機密情報がマスキングされる", () => {
      logger.info("ユーザーログイン", {
        userId: "123",
        password: "secret123",
      });

      const logEntry = JSON.parse(
        (console.info as ReturnType<typeof vi.fn>).mock.calls[0][0],
      );
      expect(logEntry.context.userId).toBe("123");
      expect(logEntry.context.password).toBe("[MASKED]");
    });
  });
});
