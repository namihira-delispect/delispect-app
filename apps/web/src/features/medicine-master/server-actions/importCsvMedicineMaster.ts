"use server";

import { prisma } from "@delispect/db";
import { authorizeServerAction } from "@/lib/auth";
import type { Result } from "@/shared/types";
import type { CsvImportPreview, CsvImportRow, CsvImportError } from "../types";
import { csvRowSchema, CSV_EXPECTED_HEADERS } from "../schemata";

/**
 * CSVテキストをパースして行の配列に変換する
 */
function parseCsvText(csvText: string): string[][] {
  const lines = csvText.trim().split(/\r?\n/);
  return lines.map((line) => line.split(",").map((cell) => cell.trim()));
}

/**
 * CSVヘッダーを検証する
 */
function validateHeaders(headers: string[]): string | null {
  const normalizedHeaders = headers.map((h) => h.trim().toLowerCase());

  for (const expected of CSV_EXPECTED_HEADERS) {
    if (!normalizedHeaders.includes(expected)) {
      return `必須ヘッダー「${expected}」が見つかりません`;
    }
  }

  return null;
}

/**
 * CSVファイルから薬剤マスタのプレビューを生成する
 *
 * CSVをパースし、バリデーションを実行した上で、
 * 追加・変更・削除される件数をプレビューとして返す。
 */
export async function previewCsvImport(csvText: string): Promise<Result<CsvImportPreview>> {
  // 認証・認可チェック
  const authResult = await authorizeServerAction(["SYSTEM_ADMIN", "SUPER_ADMIN"]);
  if (!authResult.success) {
    return authResult;
  }

  try {
    const lines = parseCsvText(csvText);

    if (lines.length < 2) {
      return {
        success: false,
        value: { code: "IMPORT_PARSE_ERROR", cause: "CSVファイルにデータ行がありません" },
      };
    }

    const headers = lines[0];
    const headerError = validateHeaders(headers);
    if (headerError) {
      return {
        success: false,
        value: { code: "IMPORT_PARSE_ERROR", cause: headerError },
      };
    }

    const normalizedHeaders = headers.map((h) => h.trim().toLowerCase());
    const errors: CsvImportError[] = [];
    const rows: CsvImportRow[] = [];

    // ヘッダーのインデックスマッピング
    const colIndex = {
      medicines_code: normalizedHeaders.indexOf("medicines_code"),
      category_id: normalizedHeaders.indexOf("category_id"),
      risk_factor_flg: normalizedHeaders.indexOf("risk_factor_flg"),
      display_name: normalizedHeaders.indexOf("display_name"),
      hospital_code: normalizedHeaders.indexOf("hospital_code"),
    };

    // データ行のバリデーション
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (line.length === 1 && line[0] === "") continue; // 空行スキップ

      const rowData = {
        medicines_code: line[colIndex.medicines_code] ?? "",
        category_id: line[colIndex.category_id] ?? "",
        risk_factor_flg: line[colIndex.risk_factor_flg] ?? "",
        display_name: line[colIndex.display_name] ?? "",
        hospital_code: line[colIndex.hospital_code] ?? "",
      };

      const parsed = csvRowSchema.safeParse(rowData);

      if (!parsed.success) {
        const fieldErrors = parsed.error.flatten().fieldErrors;
        for (const [field, messages] of Object.entries(fieldErrors)) {
          if (messages) {
            for (const message of messages) {
              errors.push({ row: i + 1, column: field, message });
            }
          }
        }
        continue;
      }

      const riskFlg = parsed.data.risk_factor_flg === "1" || parsed.data.risk_factor_flg === "true";

      rows.push({
        rowNumber: i + 1,
        medicinesCode: parsed.data.medicines_code,
        categoryId: Number(parsed.data.category_id),
        riskFactorFlg: riskFlg,
        displayName: parsed.data.display_name,
        hospitalCode: parsed.data.hospital_code,
        changeType: "unchanged", // 後で判定
      });
    }

    if (errors.length > 0) {
      return {
        success: true,
        value: { addCount: 0, updateCount: 0, deleteCount: 0, errors, rows: [] },
      };
    }

    // 既存データとの差分計算
    const existingMasters = await prisma.medicineMaster.findMany({
      include: {
        medicineNameSettings: true,
      },
    });

    const existingMap = new Map(existingMasters.map((m) => [m.medicinesCode, m]));

    const csvCodes = new Set(rows.map((r) => r.medicinesCode));

    let addCount = 0;
    let updateCount = 0;
    let deleteCount = 0;

    // CSVにあるデータの差分判定
    for (const row of rows) {
      const existing = existingMap.get(row.medicinesCode);

      if (!existing) {
        row.changeType = "add";
        addCount++;
      } else {
        const existingNameSetting = existing.medicineNameSettings.find(
          (ns) => ns.hospitalCode === row.hospitalCode,
        );

        const hasChanges =
          existing.categoryId !== row.categoryId ||
          existing.riskFactorFlg !== row.riskFactorFlg ||
          !existingNameSetting ||
          existingNameSetting.displayName !== row.displayName;

        if (hasChanges) {
          row.changeType = "update";
          updateCount++;
        } else {
          row.changeType = "unchanged";
        }
      }
    }

    // CSVにないが既存DBにあるデータは削除対象
    for (const [code] of existingMap) {
      if (!csvCodes.has(code)) {
        deleteCount++;
      }
    }

    return {
      success: true,
      value: { addCount, updateCount, deleteCount, errors, rows },
    };
  } catch {
    return {
      success: false,
      value: { code: "IMPORT_PARSE_ERROR", cause: "CSVの解析に失敗しました" },
    };
  }
}

/**
 * CSVインポートを実行する
 *
 * プレビュー済みのCSVデータを実際にDBに反映する。
 * エラー発生時はロールバックする。
 */
export async function executeCsvImport(
  csvText: string,
): Promise<Result<{ importedCount: number }>> {
  // 認証・認可チェック
  const authResult = await authorizeServerAction(["SYSTEM_ADMIN", "SUPER_ADMIN"]);
  if (!authResult.success) {
    return authResult;
  }

  try {
    // まずプレビューを再実行してバリデーション
    const previewResult = await previewCsvImport(csvText);
    if (!previewResult.success) {
      return previewResult;
    }

    const { errors, rows } = previewResult.value;

    if (errors.length > 0) {
      return {
        success: false,
        value: { code: "IMPORT_VALIDATION_ERROR", cause: "CSVにバリデーションエラーがあります" },
      };
    }

    // 既存データの取得
    const existingMasters = await prisma.medicineMaster.findMany({
      include: { medicineNameSettings: true },
    });
    const existingMap = new Map(existingMasters.map((m) => [m.medicinesCode, m]));
    const csvCodes = new Set(rows.map((r) => r.medicinesCode));

    // トランザクションで一括更新
    let importedCount = 0;

    await prisma.$transaction(async (tx) => {
      // CSV にないデータを削除
      for (const [code, master] of existingMap) {
        if (!csvCodes.has(code)) {
          // 処方データとの関連チェック
          const prescriptionCount = await tx.prescription.count({
            where: { yjCode: code },
          });

          if (prescriptionCount === 0) {
            await tx.medicineNameSetting.deleteMany({
              where: { medicineMasterId: master.id },
            });
            await tx.medicineMaster.delete({
              where: { id: master.id },
            });
          }
        }
      }

      // CSVデータの追加・更新
      for (const row of rows) {
        if (row.changeType === "add") {
          const created = await tx.medicineMaster.create({
            data: {
              medicinesCode: row.medicinesCode,
              categoryId: row.categoryId,
              riskFactorFlg: row.riskFactorFlg,
            },
          });

          await tx.medicineNameSetting.create({
            data: {
              medicineMasterId: created.id,
              hospitalCode: row.hospitalCode,
              displayName: row.displayName,
            },
          });

          importedCount++;
        } else if (row.changeType === "update") {
          const existing = existingMap.get(row.medicinesCode);
          if (existing) {
            await tx.medicineMaster.update({
              where: { id: existing.id },
              data: {
                categoryId: row.categoryId,
                riskFactorFlg: row.riskFactorFlg,
              },
            });

            await tx.medicineNameSetting.upsert({
              where: {
                medicineMasterId_hospitalCode: {
                  medicineMasterId: existing.id,
                  hospitalCode: row.hospitalCode,
                },
              },
              update: {
                displayName: row.displayName,
              },
              create: {
                medicineMasterId: existing.id,
                hospitalCode: row.hospitalCode,
                displayName: row.displayName,
              },
            });

            importedCount++;
          }
        }
      }
    });

    return {
      success: true,
      value: { importedCount },
    };
  } catch {
    return {
      success: false,
      value: {
        code: "IMPORT_ERROR",
        cause: "CSVインポートの実行に失敗しました。ロールバックしました。",
      },
    };
  }
}
