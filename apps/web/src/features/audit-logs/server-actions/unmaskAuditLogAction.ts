"use server";

import { prisma } from "@delispect/db";
import { authorizeServerAction } from "@/lib/auth";
import type { Result } from "@/shared/types";
import type { AuditLogEntry } from "../types";

/**
 * マスキング解除した監査ログ詳細を取得するServer Action
 *
 * 管理者が調査目的で閲覧する場合のみ使用する。
 * SUPER_ADMINのみ実行可能。
 */
export async function unmaskAuditLogAction(
  logId: string,
): Promise<Result<AuditLogEntry>> {
  // 全権管理者のみマスキング解除可能
  const authResult = await authorizeServerAction(["SUPER_ADMIN"]);
  if (!authResult.success) {
    return authResult;
  }

  try {
    const log = await prisma.auditLog.findUnique({
      where: { id: BigInt(logId) },
      include: {
        actor: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    if (!log) {
      return {
        success: false,
        value: {
          code: "NOT_FOUND",
          cause: "監査ログが見つかりません",
        },
      };
    }

    const afterData = log.afterData as Record<string, unknown> | null;

    return {
      success: true,
      value: {
        id: log.id.toString(),
        actorId: log.actorId,
        actorUsername: log.actor.username,
        action: log.action,
        targetType: log.targetType,
        targetId: log.targetId,
        occurredAt: log.occurredAt.toISOString(),
        ipAddress: afterData?.ipAddress
          ? String(afterData.ipAddress)
          : null,
        beforeData: log.beforeData as Record<string, unknown> | null,
        afterData,
      },
    };
  } catch (error) {
    console.error("[AuditLog] マスキング解除に失敗しました", {
      logId,
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      success: false,
      value: {
        code: "AUDIT_LOG_UNMASK_ERROR",
        cause: "監査ログの取得に失敗しました",
      },
    };
  }
}
