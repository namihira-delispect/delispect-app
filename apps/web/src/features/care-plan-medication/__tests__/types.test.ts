import { describe, it, expect } from "vitest";
import { CARE_PLAN_CATEGORIES, CARE_PLAN_CATEGORY_LABELS } from "@/features/care-plan/types";
import {
  MEDICATION_STEPS,
  RISK_DRUG_CATEGORIES,
  PRESCRIPTION_TYPE_LABELS,
  RISK_DRUG_WARNING_MESSAGES,
  ALTERNATIVE_DRUG_MAP,
  OPIOID_CATEGORY_ID,
} from "../types";
import type {
  PrescriptionEntry,
  RiskDrugMatch,
  MedicationCarePlanDetails,
  SelectedAlternative,
} from "../types";

describe("薬剤ケアプラン型定義", () => {
  describe("MEDICATION_STEPS", () => {
    it("4つのステップが定義されている", () => {
      expect(MEDICATION_STEPS).toHaveLength(4);
    });

    it("ステップ番号が1から順番に振られている", () => {
      MEDICATION_STEPS.forEach((step, index) => {
        expect(step.stepNumber).toBe(index + 1);
      });
    });

    it("全てのステップにIDとタイトルと説明がある", () => {
      MEDICATION_STEPS.forEach((step) => {
        expect(step.id).toBeTruthy();
        expect(step.title).toBeTruthy();
        expect(step.description).toBeTruthy();
      });
    });

    it("ステップIDがユニークである", () => {
      const ids = MEDICATION_STEPS.map((s) => s.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it("最初のステップがリスク薬剤確認である", () => {
      expect(MEDICATION_STEPS[0].id).toBe("risk_drug_review");
    });

    it("最後のステップが確認である", () => {
      expect(MEDICATION_STEPS[MEDICATION_STEPS.length - 1].id).toBe("confirmation");
    });
  });

  describe("RISK_DRUG_CATEGORIES", () => {
    it("複数のリスク薬剤カテゴリが定義されている", () => {
      const keys = Object.keys(RISK_DRUG_CATEGORIES);
      expect(keys.length).toBeGreaterThan(0);
    });

    it("オピオイドカテゴリが含まれている", () => {
      expect(RISK_DRUG_CATEGORIES[OPIOID_CATEGORY_ID]).toBeDefined();
      expect(RISK_DRUG_CATEGORIES[OPIOID_CATEGORY_ID]).toContain("オピオイド");
    });

    it("ベンゾジアゼピン系カテゴリが含まれている", () => {
      expect(RISK_DRUG_CATEGORIES[2]).toBeDefined();
      expect(RISK_DRUG_CATEGORIES[2]).toContain("ベンゾジアゼピン");
    });
  });

  describe("PRESCRIPTION_TYPE_LABELS", () => {
    it("3つの処方種別ラベルが定義されている", () => {
      expect(Object.keys(PRESCRIPTION_TYPE_LABELS)).toHaveLength(3);
    });

    it("内服ラベルが正しい", () => {
      expect(PRESCRIPTION_TYPE_LABELS["ORAL"]).toBe("内服");
    });

    it("注射ラベルが正しい", () => {
      expect(PRESCRIPTION_TYPE_LABELS["INJECTION"]).toBe("注射");
    });

    it("外用ラベルが正しい", () => {
      expect(PRESCRIPTION_TYPE_LABELS["EXTERNAL"]).toBe("外用");
    });
  });

  describe("RISK_DRUG_WARNING_MESSAGES", () => {
    it("全てのリスク薬剤カテゴリに対応するメッセージが定義されている", () => {
      Object.keys(RISK_DRUG_CATEGORIES).forEach((key) => {
        const categoryId = Number(key);
        expect(RISK_DRUG_WARNING_MESSAGES[categoryId]).toBeDefined();
        expect(RISK_DRUG_WARNING_MESSAGES[categoryId].length).toBeGreaterThan(0);
      });
    });

    it("オピオイドの警告メッセージに投与量調整の指示が含まれている", () => {
      expect(RISK_DRUG_WARNING_MESSAGES[OPIOID_CATEGORY_ID]).toContain("投与量");
    });
  });

  describe("ALTERNATIVE_DRUG_MAP", () => {
    it("ベンゾジアゼピン系の代替薬剤が定義されている", () => {
      expect(ALTERNATIVE_DRUG_MAP[2]).toBeDefined();
      expect(ALTERNATIVE_DRUG_MAP[2].length).toBeGreaterThan(0);
    });

    it("H2ブロッカーの代替薬剤にPPIが含まれている", () => {
      const h2Alts = ALTERNATIVE_DRUG_MAP[4];
      expect(h2Alts).toBeDefined();
      const hasPpi = h2Alts.some(
        (alt) => alt.reason.includes("PPI") || alt.reason.includes("プロトンポンプ"),
      );
      expect(hasPpi).toBe(true);
    });

    it("代替薬剤に薬剤名・コード・理由が含まれている", () => {
      Object.values(ALTERNATIVE_DRUG_MAP).forEach((alts) => {
        alts.forEach((alt) => {
          expect(alt.drugName).toBeTruthy();
          expect(alt.medicinesCode).toBeTruthy();
          expect(alt.reason).toBeTruthy();
        });
      });
    });
  });

  describe("MEDICATIONカテゴリがケアプラン一覧に含まれている", () => {
    it("MEDICATIONカテゴリが定義されている", () => {
      expect(CARE_PLAN_CATEGORIES).toContain("MEDICATION");
    });

    it("MEDICATIONカテゴリの表示ラベルが薬剤管理である", () => {
      expect(CARE_PLAN_CATEGORY_LABELS["MEDICATION"]).toBe("薬剤管理");
    });
  });

  describe("型の整合性チェック", () => {
    it("PrescriptionEntry型のオブジェクトを正しく作成できる", () => {
      const entry: PrescriptionEntry = {
        id: 1,
        yjCode: "YJ001",
        drugName: "テスト薬剤",
        prescriptionType: "ORAL",
        prescribedAt: "2026-01-01T00:00:00.000Z",
        isRiskDrug: true,
        isOpioid: false,
        riskCategoryId: 2,
      };
      expect(entry.id).toBe(1);
      expect(entry.isRiskDrug).toBe(true);
    });

    it("RiskDrugMatch型のオブジェクトを正しく作成できる", () => {
      const match: RiskDrugMatch = {
        prescription: {
          id: 1,
          yjCode: "YJ001",
          drugName: "ジアゼパム",
          prescriptionType: "ORAL",
          prescribedAt: "2026-01-01T00:00:00.000Z",
          isRiskDrug: true,
          isOpioid: false,
          riskCategoryId: 2,
        },
        warningMessage: "ベンゾジアゼピン系薬剤です",
        alternatives: [
          { drugName: "ラメルテオン", medicinesCode: "ALT001", reason: "安全性が高い" },
        ],
        changeReason: "せん妄リスクが高い",
      };
      expect(match.alternatives).toHaveLength(1);
    });

    it("MedicationCarePlanDetails型のオブジェクトを正しく作成できる", () => {
      const details: MedicationCarePlanDetails = {
        riskDrugMatches: [],
        opioidDrugs: [],
        selectedAlternatives: [],
        instructions: "薬剤評価完了",
        completedAt: "2026-01-01T00:00:00.000Z",
      };
      expect(details.instructions).toBe("薬剤評価完了");
      expect(details.completedAt).toBeDefined();
    });

    it("SelectedAlternative型のオブジェクトを正しく作成できる", () => {
      const alt: SelectedAlternative = {
        originalPrescriptionId: 1,
        originalDrugName: "ジアゼパム",
        alternativeDrugName: "ラメルテオン",
        changeReason: "せん妄リスク軽減",
      };
      expect(alt.originalPrescriptionId).toBe(1);
    });
  });
});
