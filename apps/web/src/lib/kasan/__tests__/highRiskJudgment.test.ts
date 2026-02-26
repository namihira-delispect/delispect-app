import { describe, it, expect } from "vitest";
import {
  judgeHighRiskKasan,
  isPatientOver70,
  hasRiskDrugInPrescriptions,
  type HighRiskJudgmentInput,
} from "../highRiskJudgment";

describe("judgeHighRiskKasan", () => {
  const baseInput: HighRiskJudgmentInput = {
    medicalHistory: {
      hasDementia: false,
      hasOrganicBrainDamage: false,
      isHeavyAlcohol: false,
      hasDeliriumHistory: false,
      hasGeneralAnesthesia: false,
    },
    isOver70: false,
    hasRiskDrug: false,
  };

  describe("加算対象判定", () => {
    it("全項目が非該当の場合、非対象となる", () => {
      const result = judgeHighRiskKasan(baseInput);
      expect(result.isEligible).toBe(false);
      expect(result.applicableItems).toHaveLength(0);
    });

    it("認知症がある場合、加算対象となる", () => {
      const input: HighRiskJudgmentInput = {
        ...baseInput,
        medicalHistory: { ...baseInput.medicalHistory, hasDementia: true },
      };
      const result = judgeHighRiskKasan(input);
      expect(result.isEligible).toBe(true);
      expect(result.applicableItems).toContain("hasDementia");
    });

    it("脳器質的障害がある場合、加算対象となる", () => {
      const input: HighRiskJudgmentInput = {
        ...baseInput,
        medicalHistory: {
          ...baseInput.medicalHistory,
          hasOrganicBrainDamage: true,
        },
      };
      const result = judgeHighRiskKasan(input);
      expect(result.isEligible).toBe(true);
      expect(result.applicableItems).toContain("hasOrganicBrainDamage");
    });

    it("アルコール多飲がある場合、加算対象となる", () => {
      const input: HighRiskJudgmentInput = {
        ...baseInput,
        medicalHistory: { ...baseInput.medicalHistory, isHeavyAlcohol: true },
      };
      const result = judgeHighRiskKasan(input);
      expect(result.isEligible).toBe(true);
      expect(result.applicableItems).toContain("isHeavyAlcohol");
    });

    it("せん妄の既往がある場合、加算対象となる", () => {
      const input: HighRiskJudgmentInput = {
        ...baseInput,
        medicalHistory: {
          ...baseInput.medicalHistory,
          hasDeliriumHistory: true,
        },
      };
      const result = judgeHighRiskKasan(input);
      expect(result.isEligible).toBe(true);
      expect(result.applicableItems).toContain("hasDeliriumHistory");
    });

    it("全身麻酔の予定がある場合、加算対象となる", () => {
      const input: HighRiskJudgmentInput = {
        ...baseInput,
        medicalHistory: {
          ...baseInput.medicalHistory,
          hasGeneralAnesthesia: true,
        },
      };
      const result = judgeHighRiskKasan(input);
      expect(result.isEligible).toBe(true);
      expect(result.applicableItems).toContain("hasGeneralAnesthesia");
    });

    it("70歳以上の場合、加算対象となる", () => {
      const input: HighRiskJudgmentInput = {
        ...baseInput,
        isOver70: true,
      };
      const result = judgeHighRiskKasan(input);
      expect(result.isEligible).toBe(true);
      expect(result.applicableItems).toContain("isOver70");
    });

    it("リスク薬剤がある場合、加算対象となる", () => {
      const input: HighRiskJudgmentInput = {
        ...baseInput,
        hasRiskDrug: true,
      };
      const result = judgeHighRiskKasan(input);
      expect(result.isEligible).toBe(true);
      expect(result.applicableItems).toContain("hasRiskDrug");
    });

    it("複数項目が該当する場合、全ての該当項目が返される", () => {
      const input: HighRiskJudgmentInput = {
        medicalHistory: {
          hasDementia: true,
          hasOrganicBrainDamage: false,
          isHeavyAlcohol: true,
          hasDeliriumHistory: false,
          hasGeneralAnesthesia: false,
        },
        isOver70: true,
        hasRiskDrug: false,
      };
      const result = judgeHighRiskKasan(input);
      expect(result.isEligible).toBe(true);
      expect(result.applicableItems).toHaveLength(3);
      expect(result.applicableItems).toContain("hasDementia");
      expect(result.applicableItems).toContain("isHeavyAlcohol");
      expect(result.applicableItems).toContain("isOver70");
    });
  });

  describe("null値の扱い", () => {
    it("MedicalHistory項目がnullの場合、非該当として扱う", () => {
      const input: HighRiskJudgmentInput = {
        medicalHistory: {
          hasDementia: null,
          hasOrganicBrainDamage: null,
          isHeavyAlcohol: null,
          hasDeliriumHistory: null,
          hasGeneralAnesthesia: null,
        },
        isOver70: false,
        hasRiskDrug: false,
      };
      const result = judgeHighRiskKasan(input);
      expect(result.isEligible).toBe(false);
      expect(result.applicableItems).toHaveLength(0);
    });

    it("一部がnullで一部が該当する場合、該当項目のみ返される", () => {
      const input: HighRiskJudgmentInput = {
        medicalHistory: {
          hasDementia: null,
          hasOrganicBrainDamage: true,
          isHeavyAlcohol: null,
          hasDeliriumHistory: false,
          hasGeneralAnesthesia: null,
        },
        isOver70: false,
        hasRiskDrug: false,
      };
      const result = judgeHighRiskKasan(input);
      expect(result.isEligible).toBe(true);
      expect(result.applicableItems).toEqual(["hasOrganicBrainDamage"]);
    });
  });
});

describe("isPatientOver70", () => {
  it("年齢が70歳の場合、trueを返す", () => {
    expect(isPatientOver70(70)).toBe(true);
  });

  it("年齢が71歳の場合、trueを返す", () => {
    expect(isPatientOver70(71)).toBe(true);
  });

  it("年齢が69歳の場合、falseを返す", () => {
    expect(isPatientOver70(69)).toBe(false);
  });

  it("年齢が0歳の場合、falseを返す", () => {
    expect(isPatientOver70(0)).toBe(false);
  });

  it("年齢がnullの場合、falseを返す", () => {
    expect(isPatientOver70(null)).toBe(false);
  });
});

describe("hasRiskDrugInPrescriptions", () => {
  it("リスク薬剤がある場合、trueを返す", () => {
    const prescriptions = [
      { riskFactorFlg: false },
      { riskFactorFlg: true },
      { riskFactorFlg: false },
    ];
    expect(hasRiskDrugInPrescriptions(prescriptions)).toBe(true);
  });

  it("リスク薬剤がない場合、falseを返す", () => {
    const prescriptions = [{ riskFactorFlg: false }, { riskFactorFlg: false }];
    expect(hasRiskDrugInPrescriptions(prescriptions)).toBe(false);
  });

  it("処方薬剤が空の場合、falseを返す", () => {
    expect(hasRiskDrugInPrescriptions([])).toBe(false);
  });

  it("全てがリスク薬剤の場合、trueを返す", () => {
    const prescriptions = [{ riskFactorFlg: true }, { riskFactorFlg: true }];
    expect(hasRiskDrugInPrescriptions(prescriptions)).toBe(true);
  });
});
