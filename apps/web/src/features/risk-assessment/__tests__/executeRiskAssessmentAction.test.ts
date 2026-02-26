import { describe, it, expect, vi, beforeEach } from "vitest";

// モック設定
vi.mock("@/lib/auth", () => ({
  authorizeServerAction: vi.fn(),
}));

vi.mock("@delispect/db", () => ({
  prisma: {
    admission: {
      findMany: vi.fn(),
    },
    riskAssessment: {
      updateMany: vi.fn(),
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock("@/lib/risk-assessment", () => ({
  extractFeatures: vi.fn(),
  predictRisk: vi.fn(),
}));

import { executeRiskAssessmentAction } from "../server-actions/executeRiskAssessmentAction";
import { authorizeServerAction } from "@/lib/auth";
import { prisma } from "@delispect/db";
import { extractFeatures, predictRisk } from "@/lib/risk-assessment";
import type { MlInputFeatures } from "../types";

const mockedAuth = vi.mocked(authorizeServerAction);
const mockedFindMany = vi.mocked(prisma.admission.findMany);
const mockedExtractFeatures = vi.mocked(extractFeatures);
const mockedPredictRisk = vi.mocked(predictRisk);
const mockedTransaction = vi.mocked(prisma.$transaction);

/** テスト用デフォルトML入力 */
function createMockMlInput(admissionId: number): MlInputFeatures {
  return {
    admissionId,
    age: 65,
    gender: "MALE",
    height: 170,
    weight: 65,
    medicalHistory: {
      hasDementia: false,
      hasOrganicBrainDamage: false,
      isHeavyAlcohol: false,
      hasDeliriumHistory: false,
      usesPsychotropicDrugs: false,
      hasGeneralAnesthesia: false,
      hasEmergencySurgery: false,
      hasScheduledSurgery: false,
      hasHeadNeckSurgery: false,
      hasChestSurgery: false,
      hasAbdominalSurgery: false,
      hasAdmissionOxygenUse: false,
      oxygenLevel: null,
    },
    vitalSigns: {
      bodyTemperature: 36.5,
      pulse: 72,
      systolicBp: 120,
      diastolicBp: 80,
      spo2: 98,
      respiratoryRate: 16,
    },
    labResults: { CRP: 0.1 },
    riskDrugCount: 0,
    totalDrugCount: 2,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("executeRiskAssessmentAction（リスク評価実行）", () => {
  describe("認証・認可チェック", () => {
    it("未認証の場合はUNAUTHORIZEDエラーを返す", async () => {
      mockedAuth.mockResolvedValue({
        success: false,
        value: { code: "UNAUTHORIZED", cause: "認証が必要です" },
      });

      const result = await executeRiskAssessmentAction({ admissionIds: [1] });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.value.code).toBe("UNAUTHORIZED");
      }
    });

    it("権限不足の場合はFORBIDDENエラーを返す", async () => {
      mockedAuth.mockResolvedValue({
        success: false,
        value: { code: "FORBIDDEN", cause: "権限が不足しています" },
      });

      const result = await executeRiskAssessmentAction({ admissionIds: [1] });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.value.code).toBe("FORBIDDEN");
      }
    });
  });

  describe("バリデーションチェック", () => {
    it("空の入院IDリストの場合はINVALID_INPUTエラーを返す", async () => {
      mockedAuth.mockResolvedValue({
        success: true,
        value: { id: 1, username: "admin", email: "admin@example.com", roles: ["SYSTEM_ADMIN"] },
      });

      const result = await executeRiskAssessmentAction({ admissionIds: [] });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.value.code).toBe("INVALID_INPUT");
      }
    });

    it("51件以上の入院IDリストの場合はINVALID_INPUTエラーを返す", async () => {
      mockedAuth.mockResolvedValue({
        success: true,
        value: { id: 1, username: "admin", email: "admin@example.com", roles: ["SYSTEM_ADMIN"] },
      });

      const ids = Array.from({ length: 51 }, (_, i) => i + 1);
      const result = await executeRiskAssessmentAction({ admissionIds: ids });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.value.code).toBe("INVALID_INPUT");
      }
    });
  });

  describe("正常系", () => {
    beforeEach(() => {
      mockedAuth.mockResolvedValue({
        success: true,
        value: { id: 1, username: "admin", email: "admin@example.com", roles: ["SYSTEM_ADMIN"] },
      });
    });

    it("単一入院IDに対して評価を実行し成功を返す", async () => {
      mockedFindMany.mockResolvedValue([{ id: 1 }] as never);
      mockedExtractFeatures.mockResolvedValue([createMockMlInput(1)]);
      mockedPredictRisk.mockResolvedValue({
        results: [
          {
            admissionId: 1,
            riskLevel: "LOW",
            riskFactors: {},
            mlInputSnapshot: createMockMlInput(1),
          },
        ],
      });
      mockedTransaction.mockImplementation(async (fn) => {
        if (typeof fn === "function") {
          return fn({
            riskAssessment: {
              updateMany: vi.fn().mockResolvedValue({ count: 0 }),
              create: vi.fn().mockResolvedValue({}),
            },
          } as never);
        }
      });

      const result = await executeRiskAssessmentAction({ admissionIds: [1] });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.successCount).toBe(1);
        expect(result.value.failureCount).toBe(0);
        expect(result.value.results).toHaveLength(1);
        expect(result.value.results[0].riskLevel).toBe("LOW");
      }
    });

    it("複数入院IDに対して一括評価を実行する", async () => {
      mockedFindMany.mockResolvedValue([{ id: 1 }, { id: 2 }] as never);
      mockedExtractFeatures.mockResolvedValue([createMockMlInput(1), createMockMlInput(2)]);
      mockedPredictRisk.mockResolvedValue({
        results: [
          {
            admissionId: 1,
            riskLevel: "HIGH",
            riskFactors: { isOver70: true },
            mlInputSnapshot: createMockMlInput(1),
          },
          {
            admissionId: 2,
            riskLevel: "LOW",
            riskFactors: {},
            mlInputSnapshot: createMockMlInput(2),
          },
        ],
      });
      mockedTransaction.mockImplementation(async (fn) => {
        if (typeof fn === "function") {
          return fn({
            riskAssessment: {
              updateMany: vi.fn().mockResolvedValue({ count: 0 }),
              create: vi.fn().mockResolvedValue({}),
            },
          } as never);
        }
      });

      const result = await executeRiskAssessmentAction({ admissionIds: [1, 2] });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.successCount).toBe(2);
        expect(result.value.failureCount).toBe(0);
        expect(result.value.results).toHaveLength(2);
      }
    });

    it("判定不能の場合はindeterminateCountに計上される", async () => {
      mockedFindMany.mockResolvedValue([{ id: 1 }] as never);
      mockedExtractFeatures.mockResolvedValue([createMockMlInput(1)]);
      mockedPredictRisk.mockResolvedValue({
        results: [
          {
            admissionId: 1,
            riskLevel: "INDETERMINATE",
            riskFactors: {},
            mlInputSnapshot: createMockMlInput(1),
            missingFields: ["年齢"],
          },
        ],
      });
      mockedTransaction.mockImplementation(async (fn) => {
        if (typeof fn === "function") {
          return fn({
            riskAssessment: {
              updateMany: vi.fn().mockResolvedValue({ count: 0 }),
              create: vi.fn().mockResolvedValue({}),
            },
          } as never);
        }
      });

      const result = await executeRiskAssessmentAction({ admissionIds: [1] });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.indeterminateCount).toBe(1);
        expect(result.value.results[0].missingFields).toContain("年齢");
      }
    });
  });

  describe("異常系", () => {
    beforeEach(() => {
      mockedAuth.mockResolvedValue({
        success: true,
        value: { id: 1, username: "admin", email: "admin@example.com", roles: ["SYSTEM_ADMIN"] },
      });
    });

    it("存在しない入院IDの場合はエラー結果を返す", async () => {
      mockedFindMany.mockResolvedValue([] as never);

      const result = await executeRiskAssessmentAction({ admissionIds: [999] });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.successCount).toBe(0);
        expect(result.value.failureCount).toBe(1);
        expect(result.value.results[0].success).toBe(false);
        expect(result.value.results[0].error).toContain("見つかりません");
      }
    });

    it("一部の入院IDが存在しない場合は存在するもののみ処理する", async () => {
      mockedFindMany.mockResolvedValue([{ id: 1 }] as never);
      mockedExtractFeatures.mockResolvedValue([createMockMlInput(1)]);
      mockedPredictRisk.mockResolvedValue({
        results: [
          {
            admissionId: 1,
            riskLevel: "LOW",
            riskFactors: {},
            mlInputSnapshot: createMockMlInput(1),
          },
        ],
      });
      mockedTransaction.mockImplementation(async (fn) => {
        if (typeof fn === "function") {
          return fn({
            riskAssessment: {
              updateMany: vi.fn().mockResolvedValue({ count: 0 }),
              create: vi.fn().mockResolvedValue({}),
            },
          } as never);
        }
      });

      const result = await executeRiskAssessmentAction({ admissionIds: [1, 999] });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.successCount).toBe(1);
        expect(result.value.failureCount).toBe(1);
        expect(result.value.results).toHaveLength(2);
      }
    });

    it("特徴量抽出でエラーが発生した場合はエラーを返す", async () => {
      mockedFindMany.mockResolvedValue([{ id: 1 }] as never);
      mockedExtractFeatures.mockRejectedValue(new Error("DB接続エラー"));

      const result = await executeRiskAssessmentAction({ admissionIds: [1] });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.value.code).toBe("RISK_ASSESSMENT_ERROR");
      }
    });

    it("ML API呼び出しでエラーが発生した場合はエラーを返す", async () => {
      mockedFindMany.mockResolvedValue([{ id: 1 }] as never);
      mockedExtractFeatures.mockResolvedValue([createMockMlInput(1)]);
      mockedPredictRisk.mockRejectedValue(new Error("ML APIエラー"));

      const result = await executeRiskAssessmentAction({ admissionIds: [1] });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.value.code).toBe("RISK_ASSESSMENT_ERROR");
      }
    });

    it("DB保存でエラーが発生した場合は個別の失敗として返す", async () => {
      mockedFindMany.mockResolvedValue([{ id: 1 }] as never);
      mockedExtractFeatures.mockResolvedValue([createMockMlInput(1)]);
      mockedPredictRisk.mockResolvedValue({
        results: [
          {
            admissionId: 1,
            riskLevel: "LOW",
            riskFactors: {},
            mlInputSnapshot: createMockMlInput(1),
          },
        ],
      });
      mockedTransaction.mockRejectedValue(new Error("DB保存エラー"));

      const result = await executeRiskAssessmentAction({ admissionIds: [1] });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.failureCount).toBe(1);
        expect(result.value.results[0].success).toBe(false);
        expect(result.value.results[0].error).toContain("保存に失敗");
      }
    });
  });
});
