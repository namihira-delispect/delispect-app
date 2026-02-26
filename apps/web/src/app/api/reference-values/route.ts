import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@delispect/db";
import { authorizeServerAction } from "@/lib/auth";
import { recordAuditLog, AUDIT_ACTIONS, AUDIT_TARGET_TYPES } from "@/lib/audit";
import { updateReferenceValueSchema } from "@/features/reference-values/schemata";

/** Prisma生成型にgenderが含まれるレコード型 */
interface ReferenceValueRecord {
  id: number;
  itemCode: string;
  itemName: string;
  unit: string | null;
  lowerLimit: { toString(): string } | null;
  upperLimit: { toString(): string } | null;
  gender: string | null;
}

/**
 * GET /api/reference-values - 基準値マスタ一覧の取得
 *
 * システム管理者・全権管理者のみアクセス可能。
 */
export async function GET() {
  try {
    const authResult = await authorizeServerAction([
      "SYSTEM_ADMIN",
      "SUPER_ADMIN",
    ]);
    if (!authResult.success) {
      const status = authResult.value.code === "UNAUTHORIZED" ? 401 : 403;
      return NextResponse.json(
        { success: false, value: authResult.value },
        { status },
      );
    }

    const records = (await prisma.referenceValueMaster.findMany({
      orderBy: [{ itemCode: "asc" }],
    })) as unknown as ReferenceValueRecord[];

    const values = records.map((record) => ({
      id: record.id,
      itemCode: record.itemCode,
      itemName: record.itemName,
      unit: record.unit,
      lowerLimit: record.lowerLimit?.toString() ?? null,
      upperLimit: record.upperLimit?.toString() ?? null,
      gender: record.gender,
    }));

    return NextResponse.json({ success: true, value: values });
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
 * PUT /api/reference-values - 基準値マスタの更新
 *
 * システム管理者・全権管理者のみ実行可能。
 * リクエストボディ: { id, lowerLimit, upperLimit }
 */
export async function PUT(request: NextRequest) {
  try {
    const authResult = await authorizeServerAction([
      "SYSTEM_ADMIN",
      "SUPER_ADMIN",
    ]);
    if (!authResult.success) {
      const status = authResult.value.code === "UNAUTHORIZED" ? 401 : 403;
      return NextResponse.json(
        { success: false, value: authResult.value },
        { status },
      );
    }

    const body = await request.json();

    // バリデーション
    const parsed = updateReferenceValueSchema.safeParse(body);
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

    // 既存レコードの取得
    const existing = await prisma.referenceValueMaster.findUnique({
      where: { id: parsed.data.id },
    });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          value: {
            code: "NOT_FOUND",
            cause: "指定された基準値が見つかりません",
          },
        },
        { status: 404 },
      );
    }

    // 更新（Prisma Decimal型は文字列を直接受け付ける）
    const updated = (await prisma.referenceValueMaster.update({
      where: { id: parsed.data.id },
      data: {
        lowerLimit: parsed.data.lowerLimit ?? null,
        upperLimit: parsed.data.upperLimit ?? null,
      },
    })) as unknown as ReferenceValueRecord;

    // 監査ログ記録
    await recordAuditLog({
      actorId: authResult.value.id,
      action: AUDIT_ACTIONS.UPDATE,
      targetType: AUDIT_TARGET_TYPES.SYSTEM_SETTING,
      targetId: String(updated.id),
      beforeData: {
        lowerLimit: existing.lowerLimit?.toString() ?? null,
        upperLimit: existing.upperLimit?.toString() ?? null,
      },
      afterData: {
        lowerLimit: updated.lowerLimit?.toString() ?? null,
        upperLimit: updated.upperLimit?.toString() ?? null,
      },
    });

    return NextResponse.json({
      success: true,
      value: {
        id: updated.id,
        itemCode: updated.itemCode,
        itemName: updated.itemName,
        unit: updated.unit,
        lowerLimit: updated.lowerLimit?.toString() ?? null,
        upperLimit: updated.upperLimit?.toString() ?? null,
        gender: updated.gender,
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
