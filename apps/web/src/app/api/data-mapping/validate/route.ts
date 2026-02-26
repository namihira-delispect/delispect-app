import { NextResponse } from "next/server";
import { prisma } from "@delispect/db";
import type { PrismaDataMappingType } from "@delispect/db";
import { authorizeServerAction } from "@/lib/auth";
import type { SystemTargetItem } from "@/features/data-mapping/types";
import {
  LAB_ITEM_TARGETS,
  VITAL_SIGN_TARGETS,
  ADMISSION_INFO_TARGETS,
} from "@/features/data-mapping/types";

/**
 * マッピンググループの検証ヘルパー
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
 * GET /api/data-mapping/validate - マッピング検証
 *
 * 電子カルテ同期に必要な項目がすべてマッピング済みかを検証する。
 * システム管理者・全権管理者のみアクセス可能。
 */
export async function GET() {
  try {
    const authResult = await authorizeServerAction([
      "SYSTEM_ADMIN",
      "SUPER_ADMIN",
    ]);
    if (!authResult.success) {
      const status = authResult.value.code === "UNAUTHORIZED" ? 401 : 403;
      return NextResponse.json(
        { success: false, value: authResult.value },
        { status },
      );
    }

    const labResult = await validateMappingGroup(LAB_ITEM_TARGETS, "LAB_ITEM");
    const vitalResult = await validateMappingGroup(VITAL_SIGN_TARGETS, "VITAL_SIGN");
    const wardResult = await validateMappingGroup(
      ADMISSION_INFO_TARGETS.filter((t) => t.code === "WARD"),
      "WARD",
    );
    const roomResult = await validateMappingGroup(
      ADMISSION_INFO_TARGETS.filter((t) => t.code === "ROOM"),
      "ROOM",
    );

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

    return NextResponse.json({
      success: true,
      value: {
        isValid: unmappedItems.length === 0,
        totalRequired,
        mappedCount,
        unmappedItems,
      },
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        value: { code: "INTERNAL_ERROR", cause: "マッピング検証に失敗しました" },
      },
      { status: 500 },
    );
  }
}
