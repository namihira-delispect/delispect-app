import { describe, it, expect } from "vitest";
import {
  medicationCarePlanParamsSchema,
  selectedAlternativeSchema,
  saveMedicationCarePlanSchema,
} from "../schemata";

describe("medicationCarePlanParamsSchema", () => {
  describe("正常系", () => {
    it("正の整数admissionIdを受け付ける", () => {
      const result = medicationCarePlanParamsSchema.safeParse({ admissionId: 1 });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.admissionId).toBe(1);
      }
    });

    it("文字列のadmissionIdを数値に変換する", () => {
      const result = medicationCarePlanParamsSchema.safeParse({ admissionId: "42" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.admissionId).toBe(42);
      }
    });

    it("大きな数値のadmissionIdを受け付ける", () => {
      const result = medicationCarePlanParamsSchema.safeParse({ admissionId: 999999 });
      expect(result.success).toBe(true);
    });
  });

  describe("バリデーションエラー", () => {
    it("admissionIdが0の場合にエラーを返す", () => {
      const result = medicationCarePlanParamsSchema.safeParse({ admissionId: 0 });
      expect(result.success).toBe(false);
    });

    it("admissionIdが負の数値の場合にエラーを返す", () => {
      const result = medicationCarePlanParamsSchema.safeParse({ admissionId: -1 });
      expect(result.success).toBe(false);
    });

    it("admissionIdが小数の場合にエラーを返す", () => {
      const result = medicationCarePlanParamsSchema.safeParse({ admissionId: 1.5 });
      expect(result.success).toBe(false);
    });

    it("admissionIdが未指定の場合にエラーを返す", () => {
      const result = medicationCarePlanParamsSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });
});

describe("selectedAlternativeSchema", () => {
  describe("正常系", () => {
    it("有効な代替薬剤データを受け付ける", () => {
      const result = selectedAlternativeSchema.safeParse({
        originalPrescriptionId: 1,
        originalDrugName: "ジアゼパム",
        alternativeDrugName: "ラメルテオン（ロゼレム）",
        changeReason: "ベンゾジアゼピン系のためせん妄リスクが高い",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.originalPrescriptionId).toBe(1);
        expect(result.data.originalDrugName).toBe("ジアゼパム");
      }
    });

    it("文字列のoriginalPrescriptionIdを数値に変換する", () => {
      const result = selectedAlternativeSchema.safeParse({
        originalPrescriptionId: "5",
        originalDrugName: "テスト薬剤",
        alternativeDrugName: "代替薬剤",
        changeReason: "理由",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.originalPrescriptionId).toBe(5);
      }
    });
  });

  describe("バリデーションエラー", () => {
    it("originalPrescriptionIdが0の場合にエラーを返す", () => {
      const result = selectedAlternativeSchema.safeParse({
        originalPrescriptionId: 0,
        originalDrugName: "テスト",
        alternativeDrugName: "代替",
        changeReason: "理由",
      });
      expect(result.success).toBe(false);
    });

    it("originalDrugNameが空文字の場合にエラーを返す", () => {
      const result = selectedAlternativeSchema.safeParse({
        originalPrescriptionId: 1,
        originalDrugName: "",
        alternativeDrugName: "代替",
        changeReason: "理由",
      });
      expect(result.success).toBe(false);
    });

    it("alternativeDrugNameが空文字の場合にエラーを返す", () => {
      const result = selectedAlternativeSchema.safeParse({
        originalPrescriptionId: 1,
        originalDrugName: "テスト",
        alternativeDrugName: "",
        changeReason: "理由",
      });
      expect(result.success).toBe(false);
    });

    it("changeReasonが空文字の場合にエラーを返す", () => {
      const result = selectedAlternativeSchema.safeParse({
        originalPrescriptionId: 1,
        originalDrugName: "テスト",
        alternativeDrugName: "代替",
        changeReason: "",
      });
      expect(result.success).toBe(false);
    });

    it("必須フィールドが未指定の場合にエラーを返す", () => {
      const result = selectedAlternativeSchema.safeParse({
        originalPrescriptionId: 1,
      });
      expect(result.success).toBe(false);
    });
  });
});

describe("saveMedicationCarePlanSchema", () => {
  const validInput = {
    carePlanItemId: 1,
    currentQuestionId: "risk_drug_review" as const,
    details: {
      riskDrugMatches: [],
      opioidDrugs: [],
      selectedAlternatives: [],
      instructions: "テスト指示",
    },
    status: "IN_PROGRESS" as const,
  };

  describe("正常系", () => {
    it("有効なIN_PROGRESSリクエストを受け付ける", () => {
      const result = saveMedicationCarePlanSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe("IN_PROGRESS");
      }
    });

    it("有効なCOMPLETEDリクエストを受け付ける", () => {
      const result = saveMedicationCarePlanSchema.safeParse({
        ...validInput,
        currentQuestionId: "confirmation",
        status: "COMPLETED",
        details: {
          ...validInput.details,
          completedAt: "2026-02-27T00:00:00.000Z",
        },
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe("COMPLETED");
      }
    });

    it("全ての質問IDを受け付ける", () => {
      const questionIds = [
        "risk_drug_review",
        "opioid_review",
        "alternative_selection",
        "confirmation",
      ];
      for (const qid of questionIds) {
        const result = saveMedicationCarePlanSchema.safeParse({
          ...validInput,
          currentQuestionId: qid,
        });
        expect(result.success).toBe(true);
      }
    });

    it("代替薬剤情報を含むリクエストを受け付ける", () => {
      const result = saveMedicationCarePlanSchema.safeParse({
        ...validInput,
        details: {
          ...validInput.details,
          selectedAlternatives: [
            {
              originalPrescriptionId: 1,
              originalDrugName: "ジアゼパム",
              alternativeDrugName: "ラメルテオン",
              changeReason: "せん妄リスク軽減",
            },
          ],
        },
      });
      expect(result.success).toBe(true);
    });

    it("文字列のcarePlanItemIdを数値に変換する", () => {
      const result = saveMedicationCarePlanSchema.safeParse({
        ...validInput,
        carePlanItemId: "10",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.carePlanItemId).toBe(10);
      }
    });
  });

  describe("バリデーションエラー", () => {
    it("carePlanItemIdが0の場合にエラーを返す", () => {
      const result = saveMedicationCarePlanSchema.safeParse({
        ...validInput,
        carePlanItemId: 0,
      });
      expect(result.success).toBe(false);
    });

    it("carePlanItemIdが負の場合にエラーを返す", () => {
      const result = saveMedicationCarePlanSchema.safeParse({
        ...validInput,
        carePlanItemId: -1,
      });
      expect(result.success).toBe(false);
    });

    it("currentQuestionIdが無効な値の場合にエラーを返す", () => {
      const result = saveMedicationCarePlanSchema.safeParse({
        ...validInput,
        currentQuestionId: "invalid_step",
      });
      expect(result.success).toBe(false);
    });

    it("statusがNOT_STARTEDの場合にエラーを返す", () => {
      const result = saveMedicationCarePlanSchema.safeParse({
        ...validInput,
        status: "NOT_STARTED",
      });
      expect(result.success).toBe(false);
    });

    it("statusが無効な値の場合にエラーを返す", () => {
      const result = saveMedicationCarePlanSchema.safeParse({
        ...validInput,
        status: "INVALID",
      });
      expect(result.success).toBe(false);
    });

    it("detailsが未指定の場合にエラーを返す", () => {
      const result = saveMedicationCarePlanSchema.safeParse({
        carePlanItemId: 1,
        currentQuestionId: "risk_drug_review",
        status: "IN_PROGRESS",
      });
      expect(result.success).toBe(false);
    });

    it("代替薬剤の必須フィールドが不足している場合にエラーを返す", () => {
      const result = saveMedicationCarePlanSchema.safeParse({
        ...validInput,
        details: {
          ...validInput.details,
          selectedAlternatives: [
            {
              originalPrescriptionId: 1,
              // originalDrugName missing
            },
          ],
        },
      });
      expect(result.success).toBe(false);
    });
  });
});
