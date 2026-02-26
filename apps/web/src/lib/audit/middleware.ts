/**
 * API Route / Server Action 用の監査ログミドルウェア
 *
 * Server Actions やAPI Routeから監査ログ記録を簡潔に呼び出すための
 * ラッパー関数を提供する。業務処理の前後で監査ログを記録し、
 * ログ記録の失敗が業務処理に影響しないことを保証する。
 */

import { recordAuditLog } from "./auditLogger";
import type { AuditAction, AuditLogInput, AuditTargetType } from "./types";

/** withAuditLog のオプション */
export interface WithAuditLogOptions<T> {
  /** 操作を行ったユーザーのID */
  actorId: number;
  /** 操作種別 */
  action: AuditAction;
  /** 操作対象の種別 */
  targetType: AuditTargetType;
  /** 操作対象のID */
  targetId: string;
  /** アクセス元IPアドレス */
  ipAddress?: string;
  /** 操作前のデータを取得する関数（更新・削除時） */
  getBeforeData?: () => Promise<Record<string, unknown> | null>;
  /** 操作後のデータを結果から抽出する関数 */
  getAfterData?: (result: T) => Record<string, unknown> | null;
}

/**
 * 業務処理を監査ログ付きで実行するラッパー
 *
 * 業務処理の前後で監査ログを記録する。
 * - 業務処理が成功した場合: 監査ログを記録する
 * - 業務処理が失敗した場合: 監査ログは記録しない（業務エラーは監査対象外）
 * - 監査ログの記録に失敗した場合: 業務処理の結果はそのまま返却する
 *
 * @param options - 監査ログオプション
 * @param operation - 業務処理関数
 * @returns 業務処理の結果
 */
export async function withAuditLog<T>(
  options: WithAuditLogOptions<T>,
  operation: () => Promise<T>,
): Promise<T> {
  // 操作前データの取得（指定されている場合）
  let beforeData: Record<string, unknown> | null = null;
  if (options.getBeforeData) {
    try {
      beforeData = await options.getBeforeData();
    } catch {
      // beforeDataの取得失敗は無視して業務処理を続行
      console.error("[AuditLog] beforeDataの取得に失敗しました");
    }
  }

  // 業務処理の実行
  const result = await operation();

  // 操作後データの取得
  let afterData: Record<string, unknown> | null = null;
  if (options.getAfterData) {
    try {
      afterData = options.getAfterData(result);
    } catch {
      // afterDataの取得失敗は無視
      console.error("[AuditLog] afterDataの取得に失敗しました");
    }
  }

  // 監査ログの記録（非同期・失敗しても業務処理に影響なし）
  const logInput: AuditLogInput = {
    actorId: options.actorId,
    action: options.action,
    targetType: options.targetType,
    targetId: options.targetId,
    beforeData,
    afterData,
    ipAddress: options.ipAddress,
  };

  // 非同期で記録（awaitしない = 業務レスポンスに影響しない）
  // ただし、テスト容易性のためPromiseを返す
  recordAuditLog(logInput).catch(() => {
    // recordAuditLog内で既にエラーログ出力済み
  });

  return result;
}

/**
 * 監査ログ記録のためのヘルパー関数
 *
 * Server Actionsから簡潔に呼び出すための関数。
 * ログ記録の失敗は業務処理に影響しない。
 *
 * @param input - 監査ログ入力データ
 */
export async function logAudit(
  input: Omit<AuditLogInput, "beforeData" | "afterData"> & {
    beforeData?: Record<string, unknown> | null;
    afterData?: Record<string, unknown> | null;
  },
): Promise<void> {
  try {
    await recordAuditLog(input);
  } catch {
    // recordAuditLog内で既にエラーログ出力済み
  }
}
