"use server";

import { prisma } from "@delispect/db";
import { authorizeServerAction } from "@/lib/auth";
import { logAudit, AUDIT_ACTIONS, AUDIT_TARGET_TYPES } from "@/lib/audit";
import { updateSystemSettingsSchema } from "../schemata";
import type { SystemSettingsFormState } from "../types";
import { SYSTEM_SETTING_KEYS, SYSTEM_SETTING_DEFAULTS } from "../types";

/**
 * システム設定を更新する Server Action
 *
 * システム管理者または全権管理者のみ実行可能。
 * 設定変更時に監査ログを記録する。
 */
export async function updateSystemSettingsAction(
  _prevState: SystemSettingsFormState,
  formData: FormData,
): Promise<SystemSettingsFormState> {
  // 認証・認可チェック（SYSTEM_ADMIN or SUPER_ADMIN）
  const authResult = await authorizeServerAction(["SYSTEM_ADMIN", "SUPER_ADMIN"]);
  if (!authResult.success) {
    return {
      success: false,
      message: authResult.value.code === "UNAUTHORIZED"
        ? "認証が必要です。再度ログインしてください。"
        : "この操作を実行する権限がありません。",
    };
  }

  const rawInput = {
    batchImportTime: formData.get("batchImportTime") as string,
    batchImportDateRangeDays: Number(formData.get("batchImportDateRangeDays")),
  };

  // バリデーション
  const parsed = updateSystemSettingsSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    // 変更前の設定値を取得
    const beforeSettings = await prisma.systemSetting.findMany({
      where: {
        key: { in: Object.values(SYSTEM_SETTING_KEYS) },
      },
    });

    const beforeMap = new Map(beforeSettings.map((s) => [s.key, s.value]));
    const beforeData: Record<string, unknown> = {
      batchImportTime:
        beforeMap.get(SYSTEM_SETTING_KEYS.BATCH_IMPORT_TIME) ??
        SYSTEM_SETTING_DEFAULTS[SYSTEM_SETTING_KEYS.BATCH_IMPORT_TIME],
      batchImportDateRangeDays:
        beforeMap.get(SYSTEM_SETTING_KEYS.BATCH_IMPORT_DATE_RANGE_DAYS) ??
        SYSTEM_SETTING_DEFAULTS[SYSTEM_SETTING_KEYS.BATCH_IMPORT_DATE_RANGE_DAYS],
    };

    // 設定値の保存（upsert）
    await prisma.$transaction([
      prisma.systemSetting.upsert({
        where: { key: SYSTEM_SETTING_KEYS.BATCH_IMPORT_TIME },
        update: { value: parsed.data.batchImportTime },
        create: {
          key: SYSTEM_SETTING_KEYS.BATCH_IMPORT_TIME,
          value: parsed.data.batchImportTime,
        },
      }),
      prisma.systemSetting.upsert({
        where: { key: SYSTEM_SETTING_KEYS.BATCH_IMPORT_DATE_RANGE_DAYS },
        update: { value: String(parsed.data.batchImportDateRangeDays) },
        create: {
          key: SYSTEM_SETTING_KEYS.BATCH_IMPORT_DATE_RANGE_DAYS,
          value: String(parsed.data.batchImportDateRangeDays),
        },
      }),
    ]);

    // 監査ログ記録
    const afterData: Record<string, unknown> = {
      batchImportTime: parsed.data.batchImportTime,
      batchImportDateRangeDays: String(parsed.data.batchImportDateRangeDays),
    };

    await logAudit({
      actorId: authResult.value.id,
      action: AUDIT_ACTIONS.SETTINGS_CHANGE,
      targetType: AUDIT_TARGET_TYPES.SYSTEM_SETTING,
      targetId: "system_settings",
      beforeData,
      afterData,
    });

    return {
      success: true,
      message: "システム設定を更新しました。次回バッチ実行時から適用されます。",
    };
  } catch {
    return {
      success: false,
      message: "システム設定の更新に失敗しました。しばらく経ってから再度お試しください。",
    };
  }
}
