"use server";

import { prisma } from "@delispect/db";
import { authorizeServerAction } from "@/lib/auth";
import { recordAuditLog, AUDIT_ACTIONS, AUDIT_TARGET_TYPES } from "@/lib/audit";
import type { Result } from "@/shared/types";
import { updateReferenceValueSchema } from "../schemata";
import type { Gender, ReferenceValue } from "../types";

/** Prisma生成型にgenderが含まれるレコード型 */
interface ReferenceValueMasterRecord {
  id: number;
  itemCode: string;
  itemName: string;
  unit: string | null;
  lowerLimit: { toString(): string } | null;
  upperLimit: { toString(): string } | null;
  gender: Gender | null;
}

/**
 * 基準値マスタを更新する
 *
 * システム管理者・全権管理者のみ実行可能。
 * 更新内容は監査ログに記録される。
 */
export async function updateReferenceValueAction(
  input: unknown,
): Promise<Result<ReferenceValue>> {
  // 認可チェック
  const authResult = await authorizeServerAction([
    "SYSTEM_ADMIN",
    "SUPER_ADMIN",
  ]);
  if (!authResult.success) {
    return authResult;
  }

  // バリデーション
  const parsed = updateReferenceValueSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      value: {
        code: "INVALID_INPUT",
        cause: parsed.error.flatten().fieldErrors,
      },
    };
  }

  try {
    // 既存レコードの取得（監査ログ用）
    const existing = await prisma.referenceValueMaster.findUnique({
      where: { id: parsed.data.id },
    });

    if (!existing) {
      return {
        success: false,
        value: {
          code: "NOT_FOUND",
          cause: "指定された基準値が見つかりません",
        },
      };
    }

    // 更新（Prisma Decimal型は文字列を直接受け付ける）
    const updated = (await prisma.referenceValueMaster.update({
      where: { id: parsed.data.id },
      data: {
        lowerLimit: parsed.data.lowerLimit ?? null,
        upperLimit: parsed.data.upperLimit ?? null,
      },
    })) as unknown as ReferenceValueMasterRecord;

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

    return {
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
    };
  } catch {
    return {
      success: false,
      value: {
        code: "INTERNAL_ERROR",
        cause: "基準値の更新に失敗しました",
      },
    };
  }
}
