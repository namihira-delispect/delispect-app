"use server";

import { prisma } from "@delispect/db";
import type { Result } from "@/shared/types";
import type {
  AuditLogListResponse,
  AuditLogSearchParams,
  MaskedAuditLogEntry,
} from "../types";
import { maskUsername, extractAndMaskPatientName } from "../maskingUtils";

/**
 * 監査ログ一覧を検索・取得する
 *
 * 検索条件に基づいてフィルタリング・ソート・ページネーションされた
 * 監査ログ一覧を返す。個人情報はマスキングされた状態で返却する。
 */
export async function getAuditLogs(
  params: AuditLogSearchParams,
): Promise<Result<AuditLogListResponse>> {
  try {
    const {
      startDate,
      endDate,
      username,
      actions,
      patientId,
      ipAddress,
      keyword,
      sortColumn = "occurredAt",
      sortDirection = "desc",
      page = 1,
      pageSize = 20,
    } = params;

    // WHERE条件の構築（型推論に任せる）
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const conditions: any[] = [];

    // 期間指定
    if (startDate || endDate) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const dateFilter: any = {};
      if (startDate) dateFilter.gte = new Date(startDate);
      if (endDate) dateFilter.lte = new Date(endDate);
      conditions.push({ occurredAt: dateFilter });
    }

    // ユーザー名検索（部分一致）- Userテーブルとjoin
    if (username) {
      conditions.push({
        actor: {
          username: { contains: username, mode: "insensitive" },
        },
      });
    }

    // 操作種別検索（複数選択）
    if (actions && actions.length > 0) {
      conditions.push({ action: { in: actions } });
    }

    // 患者ID検索 - targetTypeがPATIENTまたはADMISSIONでtargetIdが一致
    if (patientId) {
      conditions.push({
        OR: [
          {
            targetType: { in: ["PATIENT", "ADMISSION"] },
            targetId: { contains: patientId },
          },
        ],
      });
    }

    // IPアドレス検索 - afterDataのJSONフィールド内を検索
    if (ipAddress) {
      conditions.push({
        afterData: {
          path: ["ipAddress"],
          string_contains: ipAddress,
        },
      });
    }

    // フリーワード検索
    if (keyword) {
      conditions.push({
        OR: [
          { action: { contains: keyword, mode: "insensitive" } },
          { targetType: { contains: keyword, mode: "insensitive" } },
          { targetId: { contains: keyword, mode: "insensitive" } },
          {
            actor: {
              username: { contains: keyword, mode: "insensitive" },
            },
          },
        ],
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (conditions.length > 0) {
      where.AND = conditions;
    }

    // ソート設定
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let orderBy: any;

    switch (sortColumn) {
      case "actorUsername":
        orderBy = { actor: { username: sortDirection } };
        break;
      case "action":
        orderBy = { action: sortDirection };
        break;
      case "occurredAt":
      default:
        orderBy = { occurredAt: sortDirection };
        break;
    }

    // データ取得 + 件数取得
    const [logs, totalCount] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          actor: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    // マスキング済みデータに変換
    const maskedLogs: MaskedAuditLogEntry[] = logs.map((log) => {
      const afterData = log.afterData as Record<string, unknown> | null;
      const beforeData = log.beforeData as Record<string, unknown> | null;

      const maskedPatientFromAfter = extractAndMaskPatientName(afterData);
      const maskedPatientFromBefore = extractAndMaskPatientName(beforeData);

      return {
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
        beforeData,
        afterData,
        maskedActorUsername: maskUsername(log.actor.username),
        maskedPatientName: maskedPatientFromAfter ?? maskedPatientFromBefore,
      };
    });

    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      success: true,
      value: {
        logs: maskedLogs,
        totalCount,
        page,
        pageSize,
        totalPages,
      },
    };
  } catch (error) {
    console.error("[AuditLog] ログ検索に失敗しました", {
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      success: false,
      value: {
        code: "AUDIT_LOG_SEARCH_ERROR",
        cause: "監査ログの検索に失敗しました",
      },
    };
  }
}
