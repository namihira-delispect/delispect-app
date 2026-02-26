"use server";

import { prisma } from "@delispect/db";
import { authorizeServerAction } from "@/lib/auth";
import type { Result } from "@/shared/types";
import type { SystemSettingsData } from "../types";
import {
  SYSTEM_SETTING_KEYS,
  SYSTEM_SETTING_DEFAULTS,
} from "../types";

/**
 * システム設定を取得する
 *
 * システム管理者または全権管理者のみアクセス可能。
 * DBに設定値が存在しない場合はデフォルト値を返す。
 */
export async function getSystemSettingsAction(): Promise<Result<SystemSettingsData>> {
  // 認証・認可チェック（SYSTEM_ADMIN or SUPER_ADMIN）
  const authResult = await authorizeServerAction(["SYSTEM_ADMIN", "SUPER_ADMIN"]);
  if (!authResult.success) {
    return authResult;
  }

  try {
    const settings = await prisma.systemSetting.findMany({
      where: {
        key: {
          in: Object.values(SYSTEM_SETTING_KEYS),
        },
      },
    });

    const settingsMap = new Map(settings.map((s) => [s.key, s.value]));

    const batchImportTime =
      settingsMap.get(SYSTEM_SETTING_KEYS.BATCH_IMPORT_TIME) ??
      SYSTEM_SETTING_DEFAULTS[SYSTEM_SETTING_KEYS.BATCH_IMPORT_TIME];

    const batchImportDateRangeDays = parseInt(
      settingsMap.get(SYSTEM_SETTING_KEYS.BATCH_IMPORT_DATE_RANGE_DAYS) ??
        SYSTEM_SETTING_DEFAULTS[SYSTEM_SETTING_KEYS.BATCH_IMPORT_DATE_RANGE_DAYS],
      10,
    );

    return {
      success: true,
      value: {
        batchImportTime,
        batchImportDateRangeDays,
      },
    };
  } catch {
    return {
      success: false,
      value: {
        code: "INTERNAL_ERROR",
        cause: "システム設定の取得に失敗しました",
      },
    };
  }
}
