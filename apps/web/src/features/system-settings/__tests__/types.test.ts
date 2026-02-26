import { describe, it, expect } from "vitest";
import {
  SYSTEM_SETTING_KEYS,
  SYSTEM_SETTING_DEFAULTS,
} from "../types";

describe("SYSTEM_SETTING_KEYS", () => {
  it("バッチインポート実行時刻のキーが定義されている", () => {
    expect(SYSTEM_SETTING_KEYS.BATCH_IMPORT_TIME).toBe("batch_import_time");
  });

  it("対象入院日付範囲のキーが定義されている", () => {
    expect(SYSTEM_SETTING_KEYS.BATCH_IMPORT_DATE_RANGE_DAYS).toBe(
      "batch_import_date_range_days",
    );
  });
});

describe("SYSTEM_SETTING_DEFAULTS", () => {
  it("バッチインポート実行時刻のデフォルト値が06:00である", () => {
    expect(SYSTEM_SETTING_DEFAULTS[SYSTEM_SETTING_KEYS.BATCH_IMPORT_TIME]).toBe("06:00");
  });

  it("対象入院日付範囲のデフォルト値が2日である", () => {
    expect(
      SYSTEM_SETTING_DEFAULTS[SYSTEM_SETTING_KEYS.BATCH_IMPORT_DATE_RANGE_DAYS],
    ).toBe("2");
  });
});
