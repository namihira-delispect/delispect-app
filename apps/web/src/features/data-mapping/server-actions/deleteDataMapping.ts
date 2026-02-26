"use server";

import { prisma } from "@delispect/db";
import { authorizeServerAction } from "@/lib/auth";
import { recordAuditLog, AUDIT_ACTIONS, AUDIT_TARGET_TYPES } from "@/lib/audit";
import type { Result } from "@/shared/types";
import type { DataMappingType } from "../types";

/**
 * データマッピングを削除する
 *
 * システム管理者・全権管理者のみ実行可能。
 */
export async function deleteDataMapping(
  id: number,
): Promise<Result<{ id: number }>> {
  // 認証・認可チェック
  const authResult = await authorizeServerAction(["SYSTEM_ADMIN", "SUPER_ADMIN"]);
  if (!authResult.success) {
    return authResult;
  }

  try {
    // 対象レコードの存在確認
    const existing = await prisma.dataMapping.findUnique({
      where: { id },
    });

    if (!existing) {
      return {
        success: false,
        value: { code: "NOT_FOUND", cause: "指定されたデータマッピングが見つかりません" },
      };
    }

    // 削除実行
    await prisma.dataMapping.delete({
      where: { id },
    });

    // 監査ログ記録
    await recordAuditLog({
      actorId: authResult.value.id,
      action: AUDIT_ACTIONS.DELETE,
      targetType: AUDIT_TARGET_TYPES.DATA_MAPPING,
      targetId: String(id),
      beforeData: {
        mappingType: existing.mappingType as DataMappingType,
        sourceCode: existing.sourceCode,
        targetCode: existing.targetCode,
        priority: existing.priority,
      },
    });

    return {
      success: true,
      value: { id },
    };
  } catch {
    return {
      success: false,
      value: { code: "DELETE_ERROR", cause: "データマッピングの削除に失敗しました" },
    };
  }
}
