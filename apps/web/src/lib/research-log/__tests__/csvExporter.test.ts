import { describe, it, expect } from "vitest";
import { formatCsv } from "../csvExporter";
import type { ResearchLogItem } from "../types";

describe("formatCsv", () => {
  it("空配列の場合はヘッダーのみを返す", () => {
    const result = formatCsv([]);

    // BOM + ヘッダー
    expect(result).toContain("id,anonymized_id,action_type,details,occurred_at");
    const lines = result.split("\n");
    expect(lines).toHaveLength(1);
  });

  it("ログアイテムをCSV行に変換する", () => {
    const items: ResearchLogItem[] = [
      {
        id: BigInt(1),
        anonymizedId: "hash1",
        actionType: "PAGE_VIEW",
        details: { path: "/patients" },
        occurredAt: new Date("2026-01-15T10:00:00.000Z"),
      },
    ];

    const result = formatCsv(items);
    const lines = result.split("\n");

    expect(lines).toHaveLength(2);
    expect(lines[1]).toContain("1");
    expect(lines[1]).toContain("hash1");
    expect(lines[1]).toContain("PAGE_VIEW");
    expect(lines[1]).toContain("2026-01-15T10:00:00.000Z");
  });

  it("detailsがnullの場合は空文字にする", () => {
    const items: ResearchLogItem[] = [
      {
        id: BigInt(2),
        anonymizedId: "hash2",
        actionType: "USER_LOGIN",
        details: null,
        occurredAt: new Date("2026-01-15T10:00:00.000Z"),
      },
    ];

    const result = formatCsv(items);
    const lines = result.split("\n");

    // details列が空
    expect(lines[1]).toBe("2,hash2,USER_LOGIN,,2026-01-15T10:00:00.000Z");
  });

  it("BOM付きUTF-8で出力する", () => {
    const result = formatCsv([]);
    expect(result.charCodeAt(0)).toBe(0xfeff);
  });

  it("detailsにカンマを含む場合はダブルクォートで囲む", () => {
    const items: ResearchLogItem[] = [
      {
        id: BigInt(3),
        anonymizedId: "hash3",
        actionType: "BUTTON_CLICK",
        details: { label: "保存, 確定" },
        occurredAt: new Date("2026-01-15T10:00:00.000Z"),
      },
    ];

    const result = formatCsv(items);
    const lines = result.split("\n");

    // JSON.stringify結果がカンマを含むので、ダブルクォートで囲まれるはず
    expect(lines[1]).toContain('"');
  });

  it("複数件のアイテムを正しくCSVに変換する", () => {
    const items: ResearchLogItem[] = [
      {
        id: BigInt(1),
        anonymizedId: "hash1",
        actionType: "USER_LOGIN",
        details: null,
        occurredAt: new Date("2026-01-15T09:00:00.000Z"),
      },
      {
        id: BigInt(2),
        anonymizedId: "hash1",
        actionType: "PAGE_VIEW",
        details: { path: "/patients" },
        occurredAt: new Date("2026-01-15T09:01:00.000Z"),
      },
    ];

    const result = formatCsv(items);
    const lines = result.split("\n");

    expect(lines).toHaveLength(3); // ヘッダー + 2行
  });
});
