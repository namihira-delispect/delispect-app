import { describe, it, expect } from "vitest";
import {
  dashboardFilterSchema,
  csvExportSchema,
  logListFilterSchema,
} from "../schemata";

describe("dashboardFilterSchema", () => {
  it("有効な日付範囲を受け入れる", () => {
    const result = dashboardFilterSchema.safeParse({
      startDate: "2026-01-01",
      endDate: "2026-01-31",
    });
    expect(result.success).toBe(true);
  });

  it("空の開始日を拒否する", () => {
    const result = dashboardFilterSchema.safeParse({
      startDate: "",
      endDate: "2026-01-31",
    });
    expect(result.success).toBe(false);
  });

  it("空の終了日を拒否する", () => {
    const result = dashboardFilterSchema.safeParse({
      startDate: "2026-01-01",
      endDate: "",
    });
    expect(result.success).toBe(false);
  });

  it("不正な日付形式を拒否する", () => {
    const result = dashboardFilterSchema.safeParse({
      startDate: "2026/01/01",
      endDate: "2026-01-31",
    });
    expect(result.success).toBe(false);
  });
});

describe("csvExportSchema", () => {
  it("有効な日付範囲を受け入れる", () => {
    const result = csvExportSchema.safeParse({
      startDate: "2026-01-01",
      endDate: "2026-01-31",
    });
    expect(result.success).toBe(true);
  });

  it("actionTypeをオプションとして受け入れる", () => {
    const result = csvExportSchema.safeParse({
      startDate: "2026-01-01",
      endDate: "2026-01-31",
      actionType: "USER_LOGIN",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.actionType).toBe("USER_LOGIN");
    }
  });

  it("actionTypeなしでも有効とする", () => {
    const result = csvExportSchema.safeParse({
      startDate: "2026-01-01",
      endDate: "2026-01-31",
    });
    expect(result.success).toBe(true);
  });
});

describe("logListFilterSchema", () => {
  it("すべてのフィールドが省略可能", () => {
    const result = logListFilterSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("ページ番号を数値に変換する", () => {
    const result = logListFilterSchema.safeParse({ page: "3" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
    }
  });

  it("ページサイズが100を超える場合を拒否する", () => {
    const result = logListFilterSchema.safeParse({ pageSize: "101" });
    expect(result.success).toBe(false);
  });

  it("ページ番号が0以下の場合を拒否する", () => {
    const result = logListFilterSchema.safeParse({ page: "0" });
    expect(result.success).toBe(false);
  });

  it("不正な日付形式を拒否する", () => {
    const result = logListFilterSchema.safeParse({
      startDate: "invalid",
    });
    expect(result.success).toBe(false);
  });
});
