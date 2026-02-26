import { describe, it, expect } from "vitest";
import {
  MAX_DATE_RANGE_DAYS,
  IMPORT_LOCK_KEY,
  LOCK_EXPIRY_MS,
  DEFAULT_BATCH_CONFIG,
} from "../types";

describe("電子カルテ同期の定数", () => {
  it("最大日付範囲が7日間である", () => {
    expect(MAX_DATE_RANGE_DAYS).toBe(7);
  });

  it("インポートロックキーが定義されている", () => {
    expect(IMPORT_LOCK_KEY).toBe("emr_sync");
  });

  it("ロック有効期間が30分（ミリ秒）である", () => {
    expect(LOCK_EXPIRY_MS).toBe(30 * 60 * 1000);
  });

  it("バッチインポートのデフォルト設定が正しい", () => {
    expect(DEFAULT_BATCH_CONFIG).toEqual({
      executionTime: "03:00",
      daysBack: 2,
      maxRetries: 3,
    });
  });
});
