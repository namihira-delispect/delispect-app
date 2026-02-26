import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@delispect/db";
import { authorizeServerAction } from "@/lib/auth";
import { logAudit, AUDIT_ACTIONS, AUDIT_TARGET_TYPES } from "@/lib/audit";
import { updateSystemSettingsSchema } from "@/features/system-settings/schemata";
import {
  SYSTEM_SETTING_KEYS,
  SYSTEM_SETTING_DEFAULTS,
} from "@/features/system-settings/types";

/**
 * GET /api/system-settings - システム設定の取得
 */
export async function GET() {
  try {
    // 認証・認可チェック（SYSTEM_ADMIN or SUPER_ADMIN）
    const authResult = await authorizeServerAction(["SYSTEM_ADMIN", "SUPER_ADMIN"]);
    if (!authResult.success) {
      const status = authResult.value.code === "UNAUTHORIZED" ? 401 : 403;
      return NextResponse.json(
        { success: false, value: authResult.value },
        { status },
      );
    }

    const settings = await prisma.systemSetting.findMany({
      where: {
        key: { in: Object.values(SYSTEM_SETTING_KEYS) },
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

    return NextResponse.json({
      success: true,
      value: { batchImportTime, batchImportDateRangeDays },
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        value: { code: "INTERNAL_ERROR", cause: "内部エラーが発生しました" },
      },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/system-settings - システム設定の更新
 */
export async function PUT(request: NextRequest) {
  try {
    // 認証・認可チェック（SYSTEM_ADMIN or SUPER_ADMIN）
    const authResult = await authorizeServerAction(["SYSTEM_ADMIN", "SUPER_ADMIN"]);
    if (!authResult.success) {
      const status = authResult.value.code === "UNAUTHORIZED" ? 401 : 403;
      return NextResponse.json(
        { success: false, value: authResult.value },
        { status },
      );
    }

    const body = await request.json();

    // バリデーション
    const parsed = updateSystemSettingsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          value: {
            code: "VALIDATION_ERROR",
            cause: parsed.error.flatten().fieldErrors,
          },
        },
        { status: 400 },
      );
    }

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

    return NextResponse.json({
      success: true,
      value: {
        batchImportTime: parsed.data.batchImportTime,
        batchImportDateRangeDays: parsed.data.batchImportDateRangeDays,
      },
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        value: { code: "INTERNAL_ERROR", cause: "内部エラーが発生しました" },
      },
      { status: 500 },
    );
  }
}
