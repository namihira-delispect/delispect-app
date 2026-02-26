"use server";

/**
 * 電子カルテ同期の実行Server Action
 *
 * 手動インポートとバッチインポートの共通ロジック。
 * 排他ロック取得 → データ取得 → アップサート → ロック解放の流れで処理する。
 */

import { authorizeServerAction } from "@/lib/auth";
import { recordAuditLog, AUDIT_ACTIONS, AUDIT_TARGET_TYPES } from "@/lib/audit";
import { fetchEmrData } from "@/lib/emr";
import { manualImportSchema } from "../schemata";
import { acquireImportLock, releaseImportLock } from "../repositories/importLock";
import { upsertSingleAdmission } from "../repositories/upsertEmrData";
import type { Result } from "@/shared/types";
import type { EmrSyncResult, ManualImportInput } from "../types";

/**
 * 手動インポートを実行する
 *
 * 入院日付範囲を指定して電子カルテデータを同期する。
 * システム管理者・全権管理者のみ実行可能。
 */
export async function executeManualImport(
  input: ManualImportInput,
): Promise<Result<EmrSyncResult>> {
  // 認証・認可チェック
  const authResult = await authorizeServerAction(["SYSTEM_ADMIN", "SUPER_ADMIN"]);
  if (!authResult.success) {
    return authResult;
  }

  // バリデーション
  const parsed = manualImportSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      value: { code: "INVALID_INPUT", cause: parsed.error.flatten() },
    };
  }

  const { startDate, endDate } = parsed.data;

  // 排他ロック取得
  const lockResult = await acquireImportLock(authResult.value.id);
  if (!lockResult.success) {
    return lockResult;
  }

  const lockId = lockResult.value.id;
  const syncStartedAt = new Date();

  try {
    // 電子カルテAPIからデータ取得
    const emrDataList = await fetchEmrData(startDate, endDate);

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
      actorId: authResult.value.id,
      action: AUDIT_ACTIONS.EMR_SYNC,
      targetType: AUDIT_TARGET_TYPES.EMR_DATA,
      targetId: `manual_${startDate}_${endDate}`,
      afterData: {
        type: "manual",
        startDate,
        endDate,
        totalAdmissions: syncResult.totalAdmissions,
        successCount: syncResult.successCount,
        failedCount: syncResult.failedCount,
        failedAdmissionIds: syncResult.failedAdmissionIds,
      },
    });

    return { success: true, value: syncResult };
  } catch (error) {
    console.error("[EmrSync] 手動インポートに失敗しました", {
      startDate,
      endDate,
      error: error instanceof Error ? error.message : String(error),
    });

    return {
      success: false,
      value: { code: "SYNC_ERROR", cause: "電子カルテ同期に失敗しました" },
    };
  } finally {
    // ロック解放（必ず実行）
    await releaseImportLock(lockId);
  }
}
