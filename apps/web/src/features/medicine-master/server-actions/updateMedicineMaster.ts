"use server";

import { prisma } from "@delispect/db";
import { authorizeServerAction } from "@/lib/auth";
import type { Result } from "@/shared/types";
import type { MedicineMasterItem } from "../types";
import { medicineMasterSchema, type MedicineMasterInput } from "../schemata";

/**
 * 薬剤マスタを更新する
 *
 * システム管理者・全権管理者のみ実行可能。
 * MedicineMasterレコードとMedicineNameSettingレコードを同時に更新する。
 */
export async function updateMedicineMaster(
  id: number,
  input: MedicineMasterInput,
): Promise<Result<MedicineMasterItem>> {
  // 認証・認可チェック
  const authResult = await authorizeServerAction(["SYSTEM_ADMIN", "SUPER_ADMIN"]);
  if (!authResult.success) {
    return authResult;
  }

  // バリデーション
  const parsed = medicineMasterSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      value: { code: "INVALID_INPUT", cause: parsed.error.flatten() },
    };
  }

  const { medicinesCode, categoryId, riskFactorFlg, displayName, hospitalCode } = parsed.data;

  try {
    // 対象レコードの存在確認
    const existing = await prisma.medicineMaster.findUnique({
      where: { id },
    });

    if (!existing) {
      return {
        success: false,
        value: { code: "NOT_FOUND", cause: "指定された薬剤マスタが見つかりません" },
      };
    }

    // 薬剤コード重複チェック（自身以外）
    if (medicinesCode !== existing.medicinesCode) {
      const duplicate = await prisma.medicineMaster.findUnique({
        where: { medicinesCode },
      });

      if (duplicate) {
        return {
          success: false,
          value: {
            code: "MEDICINE_UPDATE_DUPLICATE",
            cause: "この薬剤コードは既に登録されています",
          },
        };
      }
    }

    // トランザクションで更新
    const updated = await prisma.$transaction(async (tx) => {
      await tx.medicineMaster.update({
        where: { id },
        data: {
          medicinesCode,
          categoryId,
          riskFactorFlg,
        },
      });

      // 既存の薬剤名設定を更新（upsert）
      await tx.medicineNameSetting.upsert({
        where: {
          medicineMasterId_hospitalCode: {
            medicineMasterId: id,
            hospitalCode,
          },
        },
        update: {
          displayName,
        },
        create: {
          medicineMasterId: id,
          hospitalCode,
          displayName,
        },
      });

      return tx.medicineMaster.findUniqueOrThrow({
        where: { id },
        include: {
          medicineNameSettings: {
            select: { id: true, hospitalCode: true, displayName: true },
          },
        },
      });
    });

    return {
      success: true,
      value: {
        id: updated.id,
        categoryId: updated.categoryId,
        medicinesCode: updated.medicinesCode,
        riskFactorFlg: updated.riskFactorFlg,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
        medicineNameSettings: updated.medicineNameSettings.map((ns) => ({
          id: ns.id,
          hospitalCode: ns.hospitalCode,
          displayName: ns.displayName,
        })),
      },
    };
  } catch {
    return {
      success: false,
      value: { code: "UPDATE_ERROR", cause: "薬剤マスタの更新に失敗しました" },
    };
  }
}
