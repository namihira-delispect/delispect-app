/**
 * 解析用操作ログ収集サービス
 *
 * 画面操作ログおよび業務フローログの収集を行う。
 * ログ収集の失敗は業務操作に影響を与えない（ログ欠損を許容）。
 */

import { prisma } from "@delispect/db";
import type { ResearchLogInput } from "./types";

/**
 * 操作ログを1件記録する
 *
 * ログ記録に失敗しても業務操作に影響を与えないよう、
 * エラーをコンソールに出力して処理を続行する。
 *
 * @param input - ログ入力データ
 * @returns 記録成功時はtrue、失敗時はfalse
 */
export async function recordResearchLog(input: ResearchLogInput): Promise<boolean> {
  try {
    await prisma.researchLog.create({
      data: {
        anonymizedId: input.anonymizedId,
        actionType: input.actionType,
        details: input.details ? (input.details as object) : undefined,
        occurredAt: new Date(),
      },
    });
    return true;
  } catch (error) {
    console.error("[ResearchLog] ログ記録に失敗しました", {
      actionType: input.actionType,
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

/**
 * 操作ログを複数件一括で記録する
 *
 * @param inputs - ログ入力データの配列
 * @returns 記録成功件数
 */
export async function recordResearchLogBatch(inputs: ResearchLogInput[]): Promise<number> {
  if (inputs.length === 0) return 0;

  try {
    const result = await prisma.researchLog.createMany({
      data: inputs.map((input) => ({
        anonymizedId: input.anonymizedId,
        actionType: input.actionType,
        details: input.details ? (input.details as object) : undefined,
        occurredAt: new Date(),
      })),
    });
    return result.count;
  } catch (error) {
    console.error("[ResearchLog] バッチログ記録に失敗しました", {
      count: inputs.length,
      error: error instanceof Error ? error.message : String(error),
    });
    return 0;
  }
}

/**
 * 業務操作をログ収集付きで実行するラッパー
 *
 * 業務処理の実行後にログを記録する。
 * ログ記録の失敗が業務処理に影響しないことを保証する。
 *
 * @param logInput - ログ入力データ
 * @param operation - 業務処理関数
 * @returns 業務処理の結果
 */
export async function withResearchLog<T>(
  logInput: ResearchLogInput,
  operation: () => Promise<T>,
): Promise<T> {
  const result = await operation();

  // 非同期でログ記録（業務レスポンスに影響しない）
  recordResearchLog(logInput).catch(() => {
    // recordResearchLog内で既にエラーログ出力済み
  });

  return result;
}
