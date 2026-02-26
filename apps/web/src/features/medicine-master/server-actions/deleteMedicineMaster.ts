"use server";

import { prisma } from "@delispect/db";
import { authorizeServerAction } from "@/lib/auth";
import type { Result } from "@/shared/types";

/**
 * 薬剤マスタを削除する
 *
 * システム管理者・全権管理者のみ実行可能。
 * MedicineNameSettingを先に削除してからMedicineMasterを削除する。
 */
export async function deleteMedicineMaster(id: number): Promise<Result<{ id: number }>> {
  // 認証・認可チェック
  const authResult = await authorizeServerAction(["SYSTEM_ADMIN", "SUPER_ADMIN"]);
  if (!authResult.success) {
    return authResult;
  }

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

    // 処方データとの関連チェック
    const prescriptionCount = await prisma.prescription.count({
      where: { yjCode: existing.medicinesCode },
    });

    if (prescriptionCount > 0) {
      return {
        success: false,
        value: {
          code: "MEDICINE_DELETE_IN_USE",
          cause: "この薬剤は処方データで使用されているため削除できません",
        },
      };
    }

    // トランザクションで削除
    await prisma.$transaction(async (tx) => {
      await tx.medicineNameSetting.deleteMany({
        where: { medicineMasterId: id },
      });

      await tx.medicineMaster.delete({
        where: { id },
      });
    });

    return { success: true, value: { id } };
  } catch {
    return {
      success: false,
      value: { code: "DELETE_ERROR", cause: "薬剤マスタの削除に失敗しました" },
    };
  }
}
