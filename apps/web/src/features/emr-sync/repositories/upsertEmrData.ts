/**
 * 電子カルテデータのアップサートリポジトリ
 *
 * 電子カルテAPIから取得したデータをDBにアップサート（登録・更新）する。
 * 患者情報、入院情報、バイタルサイン、検査値、処方データを一括処理する。
 */

import { prisma } from "@delispect/db";
import type { EmrPatientDataResponse } from "../types";
import type { Result } from "@/shared/types";

/** Prisma Gender型と互換の文字列リテラル型 */
type GenderValue = "MALE" | "FEMALE" | "OTHER" | "UNKNOWN";

/** Prisma LabItemCode型と互換の文字列リテラル型 */
type LabItemCodeValue =
  | "WBC" | "RBC" | "HGB" | "HCT" | "PLT"
  | "CRP" | "ALB" | "BUN" | "CRE" | "NA"
  | "K" | "CL" | "AST" | "ALT" | "LDH" | "GGT" | "TBIL" | "GLU";

/** Prisma PrescriptionType型と互換の文字列リテラル型 */
type PrescriptionTypeValue = "ORAL" | "INJECTION" | "EXTERNAL";

/** 有効な検査項目コード一覧 */
const VALID_LAB_ITEM_CODES: string[] = [
  "WBC", "RBC", "HGB", "HCT", "PLT",
  "CRP", "ALB", "BUN", "CRE", "NA",
  "K", "CL", "AST", "ALT", "LDH", "GGT", "TBIL", "GLU",
];

/** アップサート結果 */
export interface UpsertResult {
  admissionId: string;
  vitalSignCount: number;
  labResultCount: number;
  prescriptionCount: number;
}

/**
 * 性別文字列をPrisma Gender型に変換
 */
function toGender(sex: string): GenderValue {
  switch (sex.toUpperCase()) {
    case "MALE":
    case "M":
      return "MALE";
    case "FEMALE":
    case "F":
      return "FEMALE";
    case "OTHER":
      return "OTHER";
    default:
      return "UNKNOWN";
  }
}

/**
 * 処方種別文字列をPrisma PrescriptionType型に変換
 */
function toPrescriptionType(type: string): PrescriptionTypeValue {
  switch (type.toUpperCase()) {
    case "ORAL":
      return "ORAL";
    case "INJECTION":
      return "INJECTION";
    case "EXTERNAL":
      return "EXTERNAL";
    default:
      return "ORAL";
  }
}

/**
 * 検査項目コードが有効かチェック
 */
function isValidLabItemCode(code: string): code is LabItemCodeValue {
  return VALID_LAB_ITEM_CODES.includes(code);
}

/**
 * 1件の入院データをアップサートする
 */
export async function upsertSingleAdmission(
  data: EmrPatientDataResponse,
): Promise<Result<UpsertResult>> {
  const { admission, vitalSigns, labResults, prescriptions } = data;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. 患者のアップサート
      const patient = await tx.patient.upsert({
        where: { patientId: admission.patientId },
        create: {
          patientId: admission.patientId,
          lastName: admission.lastName,
          firstName: admission.firstName,
          lastNameKana: admission.lastNameKana,
          firstNameKana: admission.firstNameKana,
          birthday: new Date(admission.birthday),
          sex: toGender(admission.sex),
        },
        update: {
          lastName: admission.lastName,
          firstName: admission.firstName,
          lastNameKana: admission.lastNameKana,
          firstNameKana: admission.firstNameKana,
          birthday: new Date(admission.birthday),
          sex: toGender(admission.sex),
        },
      });

      // 2. 入院のアップサート
      const admissionRecord = await tx.admission.upsert({
        where: { externalAdmissionId: admission.externalAdmissionId },
        create: {
          patientId: patient.id,
          externalAdmissionId: admission.externalAdmissionId,
          admissionDate: new Date(admission.admissionDate),
          admissionTime: admission.admissionTime
            ? new Date(`1970-01-01T${admission.admissionTime}:00`)
            : null,
          ageAtAdmission: admission.ageAtAdmission,
          height: admission.height,
          weight: admission.weight,
          ward: admission.ward,
          room: admission.room,
        },
        update: {
          admissionDate: new Date(admission.admissionDate),
          admissionTime: admission.admissionTime
            ? new Date(`1970-01-01T${admission.admissionTime}:00`)
            : null,
          ageAtAdmission: admission.ageAtAdmission,
          height: admission.height,
          weight: admission.weight,
          ward: admission.ward,
          room: admission.room,
        },
      });

      // 3. バイタルサインのアップサート
      let vitalSignCount = 0;
      for (const vs of vitalSigns) {
        await tx.vitalSign.upsert({
          where: {
            admissionId_measuredAt: {
              admissionId: admissionRecord.id,
              measuredAt: new Date(vs.measuredAt),
            },
          },
          create: {
            admissionId: admissionRecord.id,
            bodyTemperature: vs.bodyTemperature,
            pulse: vs.pulse,
            systolicBp: vs.systolicBp,
            diastolicBp: vs.diastolicBp,
            spo2: vs.spo2,
            respiratoryRate: vs.respiratoryRate,
            measuredAt: new Date(vs.measuredAt),
          },
          update: {
            bodyTemperature: vs.bodyTemperature,
            pulse: vs.pulse,
            systolicBp: vs.systolicBp,
            diastolicBp: vs.diastolicBp,
            spo2: vs.spo2,
            respiratoryRate: vs.respiratoryRate,
          },
        });
        vitalSignCount++;
      }

      // 4. 検査値のアップサート
      let labResultCount = 0;
      for (const lr of labResults) {
        if (!isValidLabItemCode(lr.itemCode)) continue;

        await tx.labResult.upsert({
          where: {
            admissionId_itemCode_measuredAt: {
              admissionId: admissionRecord.id,
              itemCode: lr.itemCode as LabItemCodeValue,
              measuredAt: new Date(lr.measuredAt),
            },
          },
          create: {
            admissionId: admissionRecord.id,
            itemCode: lr.itemCode as LabItemCodeValue,
            value: lr.value,
            measuredAt: new Date(lr.measuredAt),
          },
          update: {
            value: lr.value,
          },
        });
        labResultCount++;
      }

      // 5. 処方のアップサート（既存データを削除して再作成）
      await tx.prescription.deleteMany({
        where: { admissionId: admissionRecord.id },
      });

      let prescriptionCount = 0;
      for (const rx of prescriptions) {
        await tx.prescription.create({
          data: {
            admissionId: admissionRecord.id,
            yjCode: rx.yjCode,
            drugName: rx.drugName,
            prescriptionType: toPrescriptionType(rx.prescriptionType),
            prescribedAt: new Date(rx.prescribedAt),
          },
        });
        prescriptionCount++;
      }

      return {
        admissionId: admission.externalAdmissionId,
        vitalSignCount,
        labResultCount,
        prescriptionCount,
      };
    });

    return { success: true, value: result };
  } catch (error) {
    console.error(`[EmrSync] 入院データのアップサートに失敗: ${admission.externalAdmissionId}`, {
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      success: false,
      value: {
        code: "UPSERT_ERROR",
        cause: `入院ID ${admission.externalAdmissionId} のデータ更新に失敗しました`,
      },
    };
  }
}
