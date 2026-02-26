"use server";

import { prisma } from "@delispect/db";
import type { PrismaDataMappingType } from "@delispect/db";
import { authorizeServerAction } from "@/lib/auth";
import type { Result } from "@/shared/types";
import type {
  MappingValidationResult,
  SystemTargetItem,
} from "../types";
import {
  LAB_ITEM_TARGETS,
  VITAL_SIGN_TARGETS,
  ADMISSION_INFO_TARGETS,
} from "../types";

/**
 * マッピングの検証結果を個別に取得するためのヘルパー
 */
async function validateMappingGroup(
  targets: SystemTargetItem[],
  mappingType: PrismaDataMappingType,
): Promise<{ mappedCount: number; unmappedItems: SystemTargetItem[] }> {
  const mappings = await prisma.dataMapping.findMany({
    where: { mappingType },
    select: { targetCode: true },
  });

  const mappedCodes = new Set(mappings.map((m) => m.targetCode));
  const unmappedItems: SystemTargetItem[] = [];
  let mappedCount = 0;

  for (const target of targets) {
    if (mappedCodes.has(target.code)) {
      mappedCount++;
    } else {
      unmappedItems.push(target);
    }
  }

  return { mappedCount, unmappedItems };
}

/**
 * 全マッピングの検証を行う
 *
 * 電子カルテ同期に必要な項目がすべてマッピング済みかを検証する。
 * 未設定の項目がある場合は警告情報を返す。
 *
 * システム管理者・全権管理者のみ実行可能。
 */
export async function validateMappings(): Promise<Result<MappingValidationResult>> {
  // 認証・認可チェック
  const authResult = await authorizeServerAction(["SYSTEM_ADMIN", "SUPER_ADMIN"]);
  if (!authResult.success) {
    return authResult;
  }

  try {
    // 検査値マッピングの検証
    const labResult = await validateMappingGroup(LAB_ITEM_TARGETS, "LAB_ITEM");

    // バイタルサインマッピングの検証
    const vitalResult = await validateMappingGroup(VITAL_SIGN_TARGETS, "VITAL_SIGN");

    // 入院情報マッピングの検証（病棟）
    const wardResult = await validateMappingGroup(
      ADMISSION_INFO_TARGETS.filter((t) => t.code === "WARD"),
      "WARD",
    );

    // 入院情報マッピングの検証（病室）
    const roomResult = await validateMappingGroup(
      ADMISSION_INFO_TARGETS.filter((t) => t.code === "ROOM"),
      "ROOM",
    );

    // 処方マッピングは薬剤マスタとの対応のため、薬剤マスタの件数を基準にしない
    // （処方マッピングの検証は薬剤マスタの存在に依存するため別途扱う）

    const totalRequired =
      LAB_ITEM_TARGETS.length +
      VITAL_SIGN_TARGETS.length +
      ADMISSION_INFO_TARGETS.length;

    const mappedCount =
      labResult.mappedCount +
      vitalResult.mappedCount +
      wardResult.mappedCount +
      roomResult.mappedCount;

    const unmappedItems = [
      ...labResult.unmappedItems,
      ...vitalResult.unmappedItems,
      ...wardResult.unmappedItems,
      ...roomResult.unmappedItems,
    ];

    return {
      success: true,
      value: {
        isValid: unmappedItems.length === 0,
        totalRequired,
        mappedCount,
        unmappedItems,
      },
    };
  } catch {
    return {
      success: false,
      value: { code: "VALIDATION_ERROR", cause: "マッピング検証に失敗しました" },
    };
  }
}
