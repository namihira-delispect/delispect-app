"use server";

import { prisma } from "@delispect/db";
import { authorizeServerAction } from "@/lib/auth";
import type { Result } from "@/shared/types";
import type { MedicineMasterItem } from "../types";
import { medicineMasterSchema, type MedicineMasterInput } from "../schemata";

/**
 * 薬剤マスタを新規登録する
 *
 * システム管理者・全権管理者のみ実行可能。
 * MedicineMasterレコードとMedicineNameSettingレコードを同時に作成する。
 */
export async function createMedicineMaster(
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
    // 薬剤コード重複チェック
    const existing = await prisma.medicineMaster.findUnique({
      where: { medicinesCode },
    });

    if (existing) {
      return {
        success: false,
        value: { code: "MEDICINE_CREATE_DUPLICATE", cause: "この薬剤コードは既に登録されています" },
      };
    }

    // トランザクションで作成
    const created = await prisma.$transaction(async (tx) => {
      const master = await tx.medicineMaster.create({
        data: {
          medicinesCode,
          categoryId,
          riskFactorFlg,
        },
      });

      await tx.medicineNameSetting.create({
        data: {
          medicineMasterId: master.id,
          hospitalCode,
          displayName,
        },
      });

      return tx.medicineMaster.findUniqueOrThrow({
        where: { id: master.id },
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
        id: created.id,
        categoryId: created.categoryId,
        medicinesCode: created.medicinesCode,
        riskFactorFlg: created.riskFactorFlg,
        createdAt: created.createdAt.toISOString(),
        updatedAt: created.updatedAt.toISOString(),
        medicineNameSettings: created.medicineNameSettings.map((ns) => ({
          id: ns.id,
          hospitalCode: ns.hospitalCode,
          displayName: ns.displayName,
        })),
      },
    };
  } catch {
    return {
      success: false,
      value: { code: "CREATE_ERROR", cause: "薬剤マスタの登録に失敗しました" },
    };
  }
}
