"use server";

/**
 * 日次バッチインポートの実行Server Action
 *
 * 定時自動実行で直近の入院患者データを取得する。
 * リトライ処理付きで、上限超過時はエラーログを記録する。
 */

import { recordAuditLog, AUDIT_ACTIONS, AUDIT_TARGET_TYPES } from "@/lib/audit";
import { fetchEmrData } from "@/lib/emr";
import { batchImportSchema } from "../schemata";
import { acquireImportLock, releaseImportLock } from "../repositories/importLock";
import { upsertSingleAdmission } from "../repositories/upsertEmrData";
import type { Result } from "@/shared/types";
import type { EmrSyncResult, BatchImportConfig } from "../types";
import { DEFAULT_BATCH_CONFIG } from "../types";

/**
 * バッチインポートを実行する
 *
 * API Route経由で呼び出されることを想定（認証はAPI Route側で処理）。
 * 内部的にはシステムユーザー(userId=1)として実行する。
 *
 * @param config - バッチインポート設定（省略時はデフォルト設定を使用）
 * @param actorId - 実行者のユーザーID（バッチの場合はシステムユーザー）
 */
export async function executeBatchImport(
  config?: Partial<BatchImportConfig>,
  actorId: number = 1,
): Promise<Result<EmrSyncResult>> {
  const mergedConfig = { ...DEFAULT_BATCH_CONFIG, ...config };

  // バリデーション
  const parsed = batchImportSchema.safeParse({
    daysBack: mergedConfig.daysBack,
    maxRetries: mergedConfig.maxRetries,
  });
  if (!parsed.success) {
    return {
      success: false,
      value: { code: "INVALID_INPUT", cause: parsed.error.flatten() },
    };
  }

  // 日付範囲の計算（実行日の N日前 〜 実行日）
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - parsed.data.daysBack);

  const startDateStr = startDate.toISOString().slice(0, 10);
  const endDateStr = today.toISOString().slice(0, 10);

  // リトライ付きで実行
  let lastError: string | null = null;

  for (let attempt = 0; attempt <= parsed.data.maxRetries; attempt++) {
    if (attempt > 0) {
      console.info(`[EmrSync] バッチインポート リトライ ${attempt}/${parsed.data.maxRetries}`);
      // リトライ間隔（指数バックオフ: 1秒, 2秒, 4秒...）
      await new Promise((resolve) =>
        setTimeout(resolve, Math.pow(2, attempt - 1) * 1000),
      );
    }

    // 排他ロック取得
    const lockResult = await acquireImportLock(actorId);
    if (!lockResult.success) {
      lastError = String(lockResult.value.cause);
      continue;
    }

    const lockId = lockResult.value.id;
    const syncStartedAt = new Date();

    try {
      // 電子カルテAPIからデータ取得
      const emrDataList = await fetchEmrData(startDateStr, endDateStr);

      // 各入院データをアップサート
      let successCount = 0;
      let failedCount = 0;
      const failedAdmissionIds: string[] = [];
      let totalVitalSigns = 0;
      let totalLabResults = 0;
      let totalPrescriptions = 0;

      for (const emrData of emrDataList) {
        const result = await upsertSingleAdmission(emrData);
        if (result.success) {
          successCount++;
          totalVitalSigns += result.value.vitalSignCount;
          totalLabResults += result.value.labResultCount;
          totalPrescriptions += result.value.prescriptionCount;
        } else {
          failedCount++;
          failedAdmissionIds.push(emrData.admission.externalAdmissionId);
        }
      }

      const completedAt = new Date();

      const syncResult: EmrSyncResult = {
        totalAdmissions: emrDataList.length,
        successCount,
        failedCount,
        failedAdmissionIds,
        vitalSignCount: totalVitalSigns,
        labResultCount: totalLabResults,
        prescriptionCount: totalPrescriptions,
        startedAt: syncStartedAt.toISOString(),
        completedAt: completedAt.toISOString(),
      };

      // 監査ログ記録
      await recordAuditLog({
        actorId,
        action: AUDIT_ACTIONS.EMR_SYNC,
        targetType: AUDIT_TARGET_TYPES.IMPORT,
        targetId: `batch_${startDateStr}_${endDateStr}`,
        afterData: {
          type: "batch",
          startDate: startDateStr,
          endDate: endDateStr,
          totalAdmissions: syncResult.totalAdmissions,
          successCount: syncResult.successCount,
          failedCount: syncResult.failedCount,
          failedAdmissionIds: syncResult.failedAdmissionIds,
          attempt: attempt + 1,
        },
      });

      return { success: true, value: syncResult };
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
      console.error(`[EmrSync] バッチインポート試行 ${attempt + 1} 失敗`, {
        error: lastError,
      });
    } finally {
      // ロック解放（必ず実行）
      await releaseImportLock(lockId);
    }
  }

  // リトライ上限超過 → エラーログ記録
  console.error("[EmrSync] バッチインポート リトライ上限超過", {
    maxRetries: parsed.data.maxRetries,
    lastError,
  });

  await recordAuditLog({
    actorId,
    action: AUDIT_ACTIONS.EMR_SYNC,
    targetType: AUDIT_TARGET_TYPES.IMPORT,
    targetId: `batch_${startDateStr}_${endDateStr}_failed`,
    afterData: {
      type: "batch",
      status: "failed",
      startDate: startDateStr,
      endDate: endDateStr,
      maxRetries: parsed.data.maxRetries,
      lastError,
    },
  });

  return {
    success: false,
    value: {
      code: "BATCH_IMPORT_FAILED",
      cause: `バッチインポートが${parsed.data.maxRetries + 1}回の試行後に失敗しました: ${lastError}`,
    },
  };
}
