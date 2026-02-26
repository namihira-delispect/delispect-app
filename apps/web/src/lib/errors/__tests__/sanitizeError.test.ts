import { describe, it, expect, vi, afterEach } from "vitest";
import { sanitizeError, getErrorString } from "../sanitizeError";

describe("sanitizeError", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("sanitizeError", () => {
    it("本番環境ではスタックトレースを含まない汎用メッセージを返す", () => {
      vi.stubEnv("NODE_ENV", "production");

      const error = new Error("DBエラー: 接続タイムアウト");
      error.stack = "Error: DBエラー\n    at Object.<anonymous> ...";

      const result = sanitizeError(error);

      expect(result.message).toBe(
        "システムエラーが発生しました。しばらく時間をおいて再度お試しください。",
      );
      expect(result.digest).toBeUndefined();
    });

    it("本番環境では文字列エラーでも汎用メッセージを返す", () => {
      vi.stubEnv("NODE_ENV", "production");

      const result = sanitizeError("パスワード: abc123 で認証失敗");

      expect(result.message).toBe(
        "システムエラーが発生しました。しばらく時間をおいて再度お試しください。",
      );
    });

    it("開発環境ではErrorオブジェクトの詳細を返す", () => {
      vi.stubEnv("NODE_ENV", "development");

      const error = new Error("テストエラー");
      error.stack = "Error: テストエラー\n    at test.ts:10";

      const result = sanitizeError(error);

      expect(result.message).toBe("テストエラー");
      expect(result.digest).toContain("テストエラー");
    });

    it("開発環境では文字列エラーをそのまま返す", () => {
      vi.stubEnv("NODE_ENV", "development");

      const result = sanitizeError("文字列エラー");

      expect(result.message).toBe("文字列エラー");
    });

    it("開発環境で不明な型のエラーを文字列化して返す", () => {
      vi.stubEnv("NODE_ENV", "development");

      const result = sanitizeError(42);

      expect(result.message).toBe("42");
    });
  });

  describe("getErrorString", () => {
    it("Errorオブジェクトからメッセージを取得する", () => {
      const error = new Error("テストエラー");
      expect(getErrorString(error)).toBe("テストエラー");
    });

    it("文字列をそのまま返す", () => {
      expect(getErrorString("文字列エラー")).toBe("文字列エラー");
    });

    it("その他の型は不明なエラーを返す", () => {
      expect(getErrorString(42)).toBe("不明なエラー");
      expect(getErrorString(null)).toBe("不明なエラー");
      expect(getErrorString(undefined)).toBe("不明なエラー");
    });
  });
});
