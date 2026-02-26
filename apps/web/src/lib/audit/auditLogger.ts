/**
 * 監査ログ記録ユーティリティ
 *
 * 医療情報セキュリティガイドラインに準拠した監査ログの記録機能を提供する。
 * - ハッシュチェーンによる改ざん防止
 * - ログ記録失敗時の安全なフォールバック（業務操作に影響を与えない）
 * - タイムゾーン付き時刻情報の記録
 */

import { prisma } from "@delispect/db";
import type { AuditLogInput, AuditLogRecord } from "./types";
import { computeAuditLogHash } from "./hashChain";

/** Prisma JSONフィールド用の型キャスト（@prisma/clientのInputJsonValueと互換） */
function toJsonValue(data: Record<string, unknown> | null | undefined): object | undefined {
  if (data == null) return undefined;
  // Prisma InputJsonValue は string | number | boolean | object | array を受け付ける
  // Record<string, unknown> を object としてキャストする
  return data as object;
}

/**
 * 監査ログを記録する
 *
 * ハッシュチェーンの整合性を維持するため、前のレコードのハッシュ値を
 * 取得し、新しいレコードのハッシュ計算に使用する。
 *
 * ログ記録に失敗しても業務操作に影響を与えないよう、
 * エラーをコンソールに出力して処理を続行する。
 *
 * @param input - 監査ログ入力データ
 * @returns 記録されたログレコード、失敗時はnull
 */
export async function recordAuditLog(input: AuditLogInput): Promise<AuditLogRecord | null> {
  try {
    const occurredAt = new Date();

    // 前のレコードのハッシュを取得（チェーン構造の維持）
    const lastLog = await prisma.auditLog.findFirst({
      orderBy: { id: "desc" },
      select: { hash: true },
    });

    const prevHash = lastLog?.hash ?? null;

    // ハッシュ値の計算
    const hash = computeAuditLogHash(input, occurredAt, prevHash);

    // afterDataにIPアドレス情報を付加（アクセス情報の記録）
    const afterData = input.afterData ? { ...input.afterData } : ({} as Record<string, unknown>);
    if (input.ipAddress) {
      afterData.ipAddress = input.ipAddress;
    }

    // DB保存
    const record = await prisma.auditLog.create({
      data: {
        actorId: input.actorId,
        action: input.action,
        targetType: input.targetType,
        targetId: input.targetId,
        beforeData: toJsonValue(input.beforeData),
        afterData: Object.keys(afterData).length > 0 ? toJsonValue(afterData) : undefined,
        hash,
        prevHash,
        occurredAt,
      },
    });

    return {
      id: record.id,
      actorId: record.actorId,
      action: record.action,
      targetType: record.targetType,
      targetId: record.targetId,
      beforeData: record.beforeData as Record<string, unknown> | null,
      afterData: record.afterData as Record<string, unknown> | null,
      hash: record.hash,
      prevHash: record.prevHash,
      occurredAt: record.occurredAt,
    };
  } catch (error) {
    // ログ記録失敗時は業務操作に影響を与えない
    // ログ記録失敗自体をシステムログに記録する
    console.error("[AuditLog] ログ記録に失敗しました", {
      input: {
        actorId: input.actorId,
        action: input.action,
        targetType: input.targetType,
        targetId: input.targetId,
      },
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

/**
 * バッチで複数の監査ログを記録する
 *
 * トランザクション内で複数のログレコードを順次記録し、
 * ハッシュチェーンの整合性を維持する。
 *
 * @param inputs - 監査ログ入力データの配列
 * @returns 記録されたログレコードの配列、失敗時は空配列
 */
export async function recordAuditLogBatch(inputs: AuditLogInput[]): Promise<AuditLogRecord[]> {
  if (inputs.length === 0) return [];

  try {
    const results: AuditLogRecord[] = [];

    await prisma.$transaction(async (tx) => {
      // 前のレコードのハッシュを取得
      const lastLog = await tx.auditLog.findFirst({
        orderBy: { id: "desc" },
        select: { hash: true },
      });

      let prevHash = lastLog?.hash ?? null;

      for (const input of inputs) {
        const occurredAt = new Date();
        const hash = computeAuditLogHash(input, occurredAt, prevHash);

        const afterData = input.afterData
          ? { ...input.afterData }
          : ({} as Record<string, unknown>);
        if (input.ipAddress) {
          afterData.ipAddress = input.ipAddress;
        }

        const record = await tx.auditLog.create({
          data: {
            actorId: input.actorId,
            action: input.action,
            targetType: input.targetType,
            targetId: input.targetId,
            beforeData: toJsonValue(input.beforeData),
            afterData: Object.keys(afterData).length > 0 ? toJsonValue(afterData) : undefined,
            hash,
            prevHash,
            occurredAt,
          },
        });

        results.push({
          id: record.id,
          actorId: record.actorId,
          action: record.action,
          targetType: record.targetType,
          targetId: record.targetId,
          beforeData: record.beforeData as Record<string, unknown> | null,
          afterData: record.afterData as Record<string, unknown> | null,
          hash: record.hash,
          prevHash: record.prevHash,
          occurredAt: record.occurredAt,
        });

        prevHash = hash;
      }
    });

    return results;
  } catch (error) {
    console.error("[AuditLog] バッチログ記録に失敗しました", {
      count: inputs.length,
      error: error instanceof Error ? error.message : String(error),
    });
    return [];
  }
}
