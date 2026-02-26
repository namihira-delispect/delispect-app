/**
 * CSVエクスポート機能
 *
 * 解析用操作ログをCSV形式にエクスポートする。
 * エクスポートデータには匿名化IDのみが含まれ、個人情報は含まれない。
 */

import type { ResearchLogItem, CsvExportOptions } from "./types";
import { getResearchLogsForExport } from "./queries";

/** CSVヘッダー */
const CSV_HEADERS = [
  "id",
  "anonymized_id",
  "action_type",
  "details",
  "occurred_at",
] as const;

/**
 * 操作ログをCSV文字列に変換する
 *
 * @param options - エクスポートオプション（期間・フィルター）
 * @returns CSV文字列
 */
export async function exportResearchLogsCsv(
  options: CsvExportOptions,
): Promise<string> {
  const items = await getResearchLogsForExport(
    options.startDate,
    options.endDate,
    options.actionType,
  );

  return formatCsv(items);
}

/**
 * ログアイテムの配列をCSV文字列にフォーマットする
 *
 * @param items - ログアイテムの配列
 * @returns CSV文字列（BOM付きUTF-8）
 */
export function formatCsv(items: ResearchLogItem[]): string {
  const BOM = "\uFEFF";
  const headerLine = CSV_HEADERS.join(",");

  const rows = items.map((item) => {
    const detailsStr = item.details ? JSON.stringify(item.details) : "";
    return [
      item.id.toString(),
      item.anonymizedId,
      item.actionType,
      escapeCsvField(detailsStr),
      item.occurredAt.toISOString(),
    ].join(",");
  });

  return BOM + [headerLine, ...rows].join("\n");
}

/**
 * CSVフィールドのエスケープ処理
 *
 * ダブルクォート・カンマ・改行を含む場合、
 * フィールド全体をダブルクォートで囲み、内部のダブルクォートをエスケープする。
 */
function escapeCsvField(value: string): string {
  if (
    value.includes(",") ||
    value.includes('"') ||
    value.includes("\n") ||
    value.includes("\r")
  ) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
