/**
 * ハッシュチェーンによるログ改ざん防止
 *
 * 各監査ログレコードは前のレコードのハッシュ値を含むことで、
 * チェーン構造を形成する。いずれかのレコードが改ざんされると
 * チェーンが破壊され、改ざんを検知できる。
 */

import { createHash } from "crypto";
import type { AuditLogInput } from "./types";

/**
 * 監査ログレコードのハッシュ値を計算する
 *
 * ハッシュ対象は以下のフィールド:
 * - actorId, action, targetType, targetId
 * - beforeData, afterData
 * - occurredAt（ISO8601形式）
 * - prevHash（前レコードのハッシュ、初回はnull）
 *
 * @param input - 監査ログ入力データ
 * @param occurredAt - 操作日時
 * @param prevHash - 前のレコードのハッシュ値（初回はnull）
 * @returns SHA-256 ハッシュ値（64文字の16進文字列）
 */
export function computeAuditLogHash(
  input: AuditLogInput,
  occurredAt: Date,
  prevHash: string | null,
): string {
  const payload = JSON.stringify({
    actorId: input.actorId,
    action: input.action,
    targetType: input.targetType,
    targetId: input.targetId,
    beforeData: input.beforeData ?? null,
    afterData: input.afterData ?? null,
    occurredAt: occurredAt.toISOString(),
    prevHash: prevHash ?? null,
  });

  return createHash("sha256").update(payload).digest("hex");
}

/**
 * 既存レコードのハッシュ値を再計算し、改ざんがないか検証する
 *
 * @param record - 検証対象のレコードデータ
 * @param prevHash - 前のレコードのハッシュ値
 * @returns 検証結果（true = 改ざんなし）
 */
export function verifyAuditLogHash(
  record: {
    actorId: number;
    action: string;
    targetType: string;
    targetId: string;
    beforeData: Record<string, unknown> | null;
    afterData: Record<string, unknown> | null;
    occurredAt: Date;
    hash: string;
  },
  prevHash: string | null,
): boolean {
  const payload = JSON.stringify({
    actorId: record.actorId,
    action: record.action,
    targetType: record.targetType,
    targetId: record.targetId,
    beforeData: record.beforeData ?? null,
    afterData: record.afterData ?? null,
    occurredAt: record.occurredAt.toISOString(),
    prevHash: prevHash ?? null,
  });

  const expectedHash = createHash("sha256").update(payload).digest("hex");
  return record.hash === expectedHash;
}
