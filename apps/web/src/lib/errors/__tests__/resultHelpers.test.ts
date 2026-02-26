import { describe, it, expect } from "vitest";
import { ok, err, mapResult, flatMapResult, tryCatch } from "../resultHelpers";

describe("resultHelpers", () => {
  describe("ok", () => {
    it("成功のResult型を生成する", () => {
      const result = ok({ id: 1, name: "テスト" });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toEqual({ id: 1, name: "テスト" });
      }
    });

    it("nullでも成功のResult型を生成できる", () => {
      const result = ok(null);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBeNull();
      }
    });
  });

  describe("err", () => {
    it("失敗のResult型を生成する", () => {
      const result = err("NOT_FOUND", "リソースが見つかりません");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.value.code).toBe("NOT_FOUND");
        expect(result.value.cause).toBe("リソースが見つかりません");
      }
    });

    it("Errorオブジェクトをcauseに設定できる", () => {
      const error = new Error("DB接続エラー");
      const result = err("DB_ERROR", error);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.value.code).toBe("DB_ERROR");
        expect(result.value.cause).toBe(error);
      }
    });
  });

  describe("mapResult", () => {
    it("成功時に値を変換する", () => {
      const original = ok(5);
      const mapped = mapResult(original, (v) => v * 2);

      expect(mapped.success).toBe(true);
      if (mapped.success) {
        expect(mapped.value).toBe(10);
      }
    });

    it("失敗時はそのまま返す", () => {
      const original = err<number>("ERROR", "テストエラー");
      const mapped = mapResult(original, (v) => v * 2);

      expect(mapped.success).toBe(false);
      if (!mapped.success) {
        expect(mapped.value.code).toBe("ERROR");
      }
    });
  });

  describe("flatMapResult", () => {
    it("成功時に別のResultを返す関数を適用する", async () => {
      const original = ok(5);
      const result = await flatMapResult(original, async (v) =>
        ok(String(v)),
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe("5");
      }
    });

    it("最初が失敗の場合は関数を実行せずそのまま返す", async () => {
      const original = err<number>("ERROR", "テストエラー");
      const result = await flatMapResult(original, async (v) =>
        ok(String(v)),
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.value.code).toBe("ERROR");
      }
    });

    it("適用した関数が失敗を返す場合はその失敗を返す", async () => {
      const original = ok(5);
      const result = await flatMapResult(original, async () =>
        err<string>("SECOND_ERROR", "2番目のエラー"),
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.value.code).toBe("SECOND_ERROR");
      }
    });
  });

  describe("tryCatch", () => {
    it("正常実行時は成功のResultを返す", async () => {
      const result = await tryCatch(
        async () => ({ id: 1, name: "テスト" }),
        "ERROR",
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toEqual({ id: 1, name: "テスト" });
      }
    });

    it("例外発生時は失敗のResultを返す", async () => {
      const error = new Error("テストエラー");
      const result = await tryCatch(async () => {
        throw error;
      }, "DB_ERROR");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.value.code).toBe("DB_ERROR");
        expect(result.value.cause).toBe(error);
      }
    });
  });
});
