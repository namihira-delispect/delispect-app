"use server";

import { prisma } from "@delispect/db";
import type { PrismaDataMappingType } from "@delispect/db";
import { authorizeServerAction } from "@/lib/auth";
import { recordAuditLog, AUDIT_ACTIONS, AUDIT_TARGET_TYPES } from "@/lib/audit";
import type { Result } from "@/shared/types";
import type { DataMappingItem, DataMappingType } from "../types";
import { dataMappingSchema, type DataMappingInput } from "../schemata";

/**
 * データマッピングを登録・更新する
 *
 * システム管理者・全権管理者のみ実行可能。
 * 同一mappingType+sourceCodeの組み合わせが既に存在する場合は更新する。
 */
export async function upsertDataMapping(
  input: DataMappingInput,
): Promise<Result<DataMappingItem>> {
  // 認証・認可チェック
  const authResult = await authorizeServerAction(["SYSTEM_ADMIN", "SUPER_ADMIN"]);
  if (!authResult.success) {
    return authResult;
  }

  // バリデーション
  const parsed = dataMappingSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      value: { code: "INVALID_INPUT", cause: parsed.error.flatten() },
    };
  }

  const { mappingType, sourceCode, targetCode, priority } = parsed.data;
  const prismaMappingType = mappingType as PrismaDataMappingType;

  try {
    // 同一sourceCodeが別のtargetCodeに割り当てられていないかチェック
    const duplicateSource = await prisma.dataMapping.findFirst({
      where: {
        mappingType: prismaMappingType,
        sourceCode,
        targetCode: { not: targetCode },
      },
    });

    if (duplicateSource) {
      return {
        success: false,
        value: {
          code: "DUPLICATE_SOURCE_CODE",
          cause: `病院側コード「${sourceCode}」は既に別のシステム項目「${duplicateSource.targetCode}」にマッピングされています`,
        },
      };
    }

    // 既存レコードの確認
    const existing = await prisma.dataMapping.findFirst({
      where: {
        mappingType: prismaMappingType,
        sourceCode,
      },
    });

    let record;
    if (existing) {
      // 更新
      record = await prisma.dataMapping.update({
        where: { id: existing.id },
        data: { targetCode, priority },
      });

      // 監査ログ記録
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
      // 新規作成
      record = await prisma.dataMapping.create({
        data: {
          mappingType: prismaMappingType,
          sourceCode,
          targetCode,
          priority,
        },
      });

      // 監査ログ記録
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

    return {
      success: true,
      value: {
        id: record.id,
        mappingType: record.mappingType as DataMappingType,
        sourceCode: record.sourceCode,
        targetCode: record.targetCode,
        priority: record.priority,
        createdAt: record.createdAt.toISOString(),
        updatedAt: record.updatedAt.toISOString(),
      },
    };
  } catch {
    return {
      success: false,
      value: { code: "UPSERT_ERROR", cause: "データマッピングの保存に失敗しました" },
    };
  }
}
