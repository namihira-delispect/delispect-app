import { describe, it, expect } from "vitest";
import {
  COMMON_ERROR_CODES,
  getErrorMessage,
  isRetryableError,
} from "../errorCodes";

describe("errorCodes", () => {
  describe("COMMON_ERROR_CODES", () => {
    it("共通エラーコードが定義されている", () => {
      expect(COMMON_ERROR_CODES.NOT_FOUND).toBe("NOT_FOUND");
      expect(COMMON_ERROR_CODES.INVALID_INPUT).toBe("INVALID_INPUT");
      expect(COMMON_ERROR_CODES.UNAUTHORIZED).toBe("UNAUTHORIZED");
      expect(COMMON_ERROR_CODES.FORBIDDEN).toBe("FORBIDDEN");
      expect(COMMON_ERROR_CODES.INTERNAL_ERROR).toBe("INTERNAL_ERROR");
      expect(COMMON_ERROR_CODES.DB_ERROR).toBe("DB_ERROR");
      expect(COMMON_ERROR_CODES.EXTERNAL_SERVICE_ERROR).toBe(
        "EXTERNAL_SERVICE_ERROR",
      );
      expect(COMMON_ERROR_CODES.TIMEOUT).toBe("TIMEOUT");
      expect(COMMON_ERROR_CODES.UNKNOWN).toBe("UNKNOWN");
    });
  });

  describe("getErrorMessage", () => {
    it("NOT_FOUNDのメッセージを返す", () => {
      const message = getErrorMessage(COMMON_ERROR_CODES.NOT_FOUND);
      expect(message).toContain("見つかりません");
    });

    it("INVALID_INPUTのメッセージを返す", () => {
      const message = getErrorMessage(COMMON_ERROR_CODES.INVALID_INPUT);
      expect(message).toContain("入力内容");
    });

    it("UNAUTHORIZEDのメッセージを返す", () => {
      const message = getErrorMessage(COMMON_ERROR_CODES.UNAUTHORIZED);
      expect(message).toContain("ログイン");
    });

    it("FORBIDDENのメッセージを返す", () => {
      const message = getErrorMessage(COMMON_ERROR_CODES.FORBIDDEN);
      expect(message).toContain("権限");
    });

    it("INTERNAL_ERRORのメッセージを返す", () => {
      const message = getErrorMessage(COMMON_ERROR_CODES.INTERNAL_ERROR);
      expect(message).toContain("システムエラー");
    });

    it("DB_ERRORのメッセージを返す", () => {
      const message = getErrorMessage(COMMON_ERROR_CODES.DB_ERROR);
      expect(message).toContain("データベースエラー");
    });

    it("未知のエラーコードにはデフォルトメッセージを返す", () => {
      const message = getErrorMessage("UNKNOWN_CODE_XYZ");
      expect(message).toContain("予期しないエラー");
    });
  });

  describe("isRetryableError", () => {
    it("INTERNAL_ERRORはリトライ可能", () => {
      expect(isRetryableError(COMMON_ERROR_CODES.INTERNAL_ERROR)).toBe(true);
    });

    it("DB_ERRORはリトライ可能", () => {
      expect(isRetryableError(COMMON_ERROR_CODES.DB_ERROR)).toBe(true);
    });

    it("EXTERNAL_SERVICE_ERRORはリトライ可能", () => {
      expect(isRetryableError(COMMON_ERROR_CODES.EXTERNAL_SERVICE_ERROR)).toBe(
        true,
      );
    });

    it("TIMEOUTはリトライ可能", () => {
      expect(isRetryableError(COMMON_ERROR_CODES.TIMEOUT)).toBe(true);
    });

    it("UNKNOWNはリトライ可能", () => {
      expect(isRetryableError(COMMON_ERROR_CODES.UNKNOWN)).toBe(true);
    });

    it("NOT_FOUNDはリトライ不可", () => {
      expect(isRetryableError(COMMON_ERROR_CODES.NOT_FOUND)).toBe(false);
    });

    it("INVALID_INPUTはリトライ不可", () => {
      expect(isRetryableError(COMMON_ERROR_CODES.INVALID_INPUT)).toBe(false);
    });

    it("UNAUTHORIZEDはリトライ不可", () => {
      expect(isRetryableError(COMMON_ERROR_CODES.UNAUTHORIZED)).toBe(false);
    });

    it("FORBIDDENはリトライ不可", () => {
      expect(isRetryableError(COMMON_ERROR_CODES.FORBIDDEN)).toBe(false);
    });
  });
});
