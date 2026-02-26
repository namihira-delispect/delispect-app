"use server";

import { prisma } from "@delispect/db";
import { authorizeServerAction } from "@/lib/auth";
import type { Result } from "@/shared/types";
import type { Gender, ReferenceValue, ReferenceValueGroup } from "../types";

/** Prisma生成型にgenderが含まれるレコード型（DB schemaには存在するが生成型が未反映の場合のヘルパー） */
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
 * 基準値マスタ一覧を取得する
 *
 * システム管理者・全権管理者のみアクセス可能。
 * 項目コードでグループ化し、男性・女性・共通の基準値範囲を返す。
 */
export async function getReferenceValuesAction(): Promise<
  Result<ReferenceValueGroup[]>
> {
  const authResult = await authorizeServerAction([
    "SYSTEM_ADMIN",
    "SUPER_ADMIN",
  ]);
  if (!authResult.success) {
    return authResult;
  }

  try {
    const records = (await prisma.referenceValueMaster.findMany({
      orderBy: [{ itemCode: "asc" }],
    })) as unknown as ReferenceValueMasterRecord[];

    const referenceValues: ReferenceValue[] = records.map((record) => ({
      id: record.id,
      itemCode: record.itemCode,
      itemName: record.itemName,
      unit: record.unit,
      lowerLimit: record.lowerLimit?.toString() ?? null,
      upperLimit: record.upperLimit?.toString() ?? null,
      gender: record.gender,
    }));

    // 項目コードでグループ化
    const groupMap = new Map<string, ReferenceValueGroup>();

    for (const rv of referenceValues) {
      if (!groupMap.has(rv.itemCode)) {
        groupMap.set(rv.itemCode, {
          itemCode: rv.itemCode,
          itemName: rv.itemName,
          unit: rv.unit,
          common: null,
          male: null,
          female: null,
        });
      }

      const group = groupMap.get(rv.itemCode)!;
      const range = {
        id: rv.id,
        lowerLimit: rv.lowerLimit,
        upperLimit: rv.upperLimit,
      };

      if (rv.gender === null) {
        group.common = range;
      } else if (rv.gender === "MALE") {
        group.male = range;
      } else if (rv.gender === "FEMALE") {
        group.female = range;
      }
    }

    return {
      success: true,
      value: Array.from(groupMap.values()),
    };
  } catch {
    return {
      success: false,
      value: {
        code: "INTERNAL_ERROR",
        cause: "基準値マスタの取得に失敗しました",
      },
    };
  }
}
