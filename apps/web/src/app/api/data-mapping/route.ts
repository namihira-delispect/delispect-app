import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@delispect/db";
import type { PrismaDataMappingType } from "@delispect/db";
import { authorizeServerAction } from "@/lib/auth";
import { recordAuditLog, AUDIT_ACTIONS, AUDIT_TARGET_TYPES } from "@/lib/audit";
import { dataMappingSchema } from "@/features/data-mapping/schemata";

/**
 * GET /api/data-mapping - データマッピング一覧の取得
 *
 * クエリパラメータ:
 * - mappingType: マッピング種別でフィルタ（省略時は全件取得）
 *
 * システム管理者・全権管理者のみアクセス可能。
 */
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const mappingType = searchParams.get("mappingType");

    const whereClause = mappingType
      ? { mappingType: mappingType as PrismaDataMappingType }
      : {};

    const items = await prisma.dataMapping.findMany({
      where: whereClause,
      orderBy: [
        { mappingType: "asc" },
        { targetCode: "asc" },
        { priority: "asc" },
      ],
    });

    const mappedItems = items.map((item) => ({
      id: item.id,
      mappingType: item.mappingType,
      sourceCode: item.sourceCode,
      targetCode: item.targetCode,
      priority: item.priority,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      value: {
        items: mappedItems,
        totalCount: mappedItems.length,
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

/**
 * POST /api/data-mapping - データマッピングの登録・更新
 *
 * リクエストボディ: { mappingType, sourceCode, targetCode, priority }
 *
 * 同一mappingType+sourceCodeの組み合わせが既に存在する場合は更新する。
 * システム管理者・全権管理者のみ実行可能。
 */
export async function POST(request: NextRequest) {
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
    const parsed = dataMappingSchema.safeParse(body);
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

    const { mappingType, sourceCode, targetCode, priority } = parsed.data;
    const prismaMappingType = mappingType as PrismaDataMappingType;

    // 重複チェック
    const duplicateSource = await prisma.dataMapping.findFirst({
      where: {
        mappingType: prismaMappingType,
        sourceCode,
        targetCode: { not: targetCode },
      },
    });

    if (duplicateSource) {
      return NextResponse.json(
        {
          success: false,
          value: {
            code: "DUPLICATE_SOURCE_CODE",
            cause: `病院側コード「${sourceCode}」は既に別のシステム項目にマッピングされています`,
          },
        },
        { status: 409 },
      );
    }

    // Upsert
    const existing = await prisma.dataMapping.findFirst({
      where: {
        mappingType: prismaMappingType,
        sourceCode,
      },
    });

    let record;
    if (existing) {
      record = await prisma.dataMapping.update({
        where: { id: existing.id },
        data: { targetCode, priority },
      });

      await recordAuditLog({
        actorId: authResult.value.id,
        action: AUDIT_ACTIONS.UPDATE,
        targetType: AUDIT_TARGET_TYPES.DATA_MAPPING,
        targetId: String(record.id),
        beforeData: {
          mappingType: existing.mappingType,
          sourceCode: existing.sourceCode,
          targetCode: existing.targetCode,
          priority: existing.priority,
        },
        afterData: {
          mappingType: record.mappingType,
          sourceCode: record.sourceCode,
          targetCode: record.targetCode,
          priority: record.priority,
        },
      });
    } else {
      record = await prisma.dataMapping.create({
        data: {
          mappingType: prismaMappingType,
          sourceCode,
          targetCode,
          priority,
        },
      });

      await recordAuditLog({
        actorId: authResult.value.id,
        action: AUDIT_ACTIONS.CREATE,
        targetType: AUDIT_TARGET_TYPES.DATA_MAPPING,
        targetId: String(record.id),
        afterData: {
          mappingType: record.mappingType,
          sourceCode: record.sourceCode,
          targetCode: record.targetCode,
          priority: record.priority,
        },
      });
    }

    return NextResponse.json({
      success: true,
      value: {
        id: record.id,
        mappingType: record.mappingType,
        sourceCode: record.sourceCode,
        targetCode: record.targetCode,
        priority: record.priority,
        createdAt: record.createdAt.toISOString(),
        updatedAt: record.updatedAt.toISOString(),
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

/**
 * DELETE /api/data-mapping - データマッピングの削除
 *
 * クエリパラメータ:
 * - id: 削除対象のマッピングID
 *
 * システム管理者・全権管理者のみ実行可能。
 */
export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const idStr = searchParams.get("id");
    if (!idStr) {
      return NextResponse.json(
        {
          success: false,
          value: { code: "VALIDATION_ERROR", cause: "idパラメータが必要です" },
        },
        { status: 400 },
      );
    }

    const id = parseInt(idStr, 10);
    if (isNaN(id)) {
      return NextResponse.json(
        {
          success: false,
          value: { code: "VALIDATION_ERROR", cause: "idは数値で指定してください" },
        },
        { status: 400 },
      );
    }

    const existing = await prisma.dataMapping.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          value: {
            code: "NOT_FOUND",
            cause: "指定されたデータマッピングが見つかりません",
          },
        },
        { status: 404 },
      );
    }

    await prisma.dataMapping.delete({ where: { id } });

    await recordAuditLog({
      actorId: authResult.value.id,
      action: AUDIT_ACTIONS.DELETE,
      targetType: AUDIT_TARGET_TYPES.DATA_MAPPING,
      targetId: String(id),
      beforeData: {
        mappingType: existing.mappingType,
        sourceCode: existing.sourceCode,
        targetCode: existing.targetCode,
        priority: existing.priority,
      },
    });

    return NextResponse.json({
      success: true,
      value: { id },
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
