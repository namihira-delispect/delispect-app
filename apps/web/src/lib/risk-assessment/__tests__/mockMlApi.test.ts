import { describe, it, expect } from "vitest";
import { assessRiskLevel, detectMissingFields, predictRisk } from "../mockMlApi";
import type { MlInputFeatures } from "@/features/risk-assessment/types";

/** テスト用のデフォルト特徴量を生成する */
function createDefaultFeatures(overrides: Partial<MlInputFeatures> = {}): MlInputFeatures {
  return {
    admissionId: 1,
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
    labResults: {
      CRP: 0.1,
      WBC: 6000,
      ALB: 4.0,
    },
    riskDrugCount: 0,
    totalDrugCount: 2,
    ...overrides,
  };
}

describe("detectMissingFields（不足項目検出）", () => {
  it("全項目が揃っている場合は空配列を返す", () => {
    const features = createDefaultFeatures();
    const result = detectMissingFields(features);
    expect(result).toEqual([]);
  });

  it("年齢がnullの場合は「年齢」を不足項目として返す", () => {
    const features = createDefaultFeatures({ age: null });
    const result = detectMissingFields(features);
    expect(result).toContain("年齢");
  });

  it("既往歴がnullの場合は「既往歴」を不足項目として返す", () => {
    const features = createDefaultFeatures({ medicalHistory: null });
    const result = detectMissingFields(features);
    expect(result).toContain("既往歴");
  });

  it("バイタルサインがnullの場合は「バイタルサイン」を不足項目として返す", () => {
    const features = createDefaultFeatures({ vitalSigns: null });
    const result = detectMissingFields(features);
    expect(result).toContain("バイタルサイン");
  });

  it("複数項目が不足している場合はすべて返す", () => {
    const features = createDefaultFeatures({
      age: null,
      medicalHistory: null,
      vitalSigns: null,
    });
    const result = detectMissingFields(features);
    expect(result).toHaveLength(3);
    expect(result).toContain("年齢");
    expect(result).toContain("既往歴");
    expect(result).toContain("バイタルサイン");
  });
});

describe("assessRiskLevel（リスクレベル判定）", () => {
  describe("判定不能（INDETERMINATE）", () => {
    it("必須データが不足している場合はINDETERMINATEを返す", () => {
      const features = createDefaultFeatures({ age: null });
      const result = assessRiskLevel(features);
      expect(result.riskLevel).toBe("INDETERMINATE");
      expect(result.missingFields).toBeDefined();
      expect(result.missingFields!.length).toBeGreaterThan(0);
    });

    it("判定不能時はリスク因子が空である", () => {
      const features = createDefaultFeatures({ medicalHistory: null });
      const result = assessRiskLevel(features);
      expect(result.riskLevel).toBe("INDETERMINATE");
      expect(Object.keys(result.riskFactors)).toHaveLength(0);
    });
  });

  describe("高リスク（HIGH）", () => {
    it("70歳以上の場合はHIGHを返す", () => {
      const features = createDefaultFeatures({ age: 75 });
      const result = assessRiskLevel(features);
      expect(result.riskLevel).toBe("HIGH");
      expect(result.riskFactors["isOver70"]).toBe(true);
    });

    it("認知症ありの場合はHIGHを返す", () => {
      const features = createDefaultFeatures();
      features.medicalHistory!.hasDementia = true;
      const result = assessRiskLevel(features);
      expect(result.riskLevel).toBe("HIGH");
      expect(result.riskFactors["hasDementia"]).toBe(true);
    });

    it("せん妄既往ありの場合はHIGHを返す", () => {
      const features = createDefaultFeatures();
      features.medicalHistory!.hasDeliriumHistory = true;
      const result = assessRiskLevel(features);
      expect(result.riskLevel).toBe("HIGH");
      expect(result.riskFactors["hasDeliriumHistory"]).toBe(true);
    });

    it("リスク薬剤2剤以上の場合はHIGHを返す", () => {
      const features = createDefaultFeatures({ riskDrugCount: 3 });
      const result = assessRiskLevel(features);
      expect(result.riskLevel).toBe("HIGH");
      expect(result.riskFactors["hasMultipleRiskDrugs"]).toBe(true);
    });

    it("CRP > 5.0の場合はHIGHを返す", () => {
      const features = createDefaultFeatures();
      features.labResults["CRP"] = 8.5;
      const result = assessRiskLevel(features);
      expect(result.riskLevel).toBe("HIGH");
      expect(result.riskFactors["highCrp"]).toBe(true);
    });

    it("複数のリスク因子がある場合はすべて記録される", () => {
      const features = createDefaultFeatures({ age: 72, riskDrugCount: 2 });
      features.medicalHistory!.hasDementia = true;
      const result = assessRiskLevel(features);
      expect(result.riskLevel).toBe("HIGH");
      expect(result.riskFactors["isOver70"]).toBe(true);
      expect(result.riskFactors["hasDementia"]).toBe(true);
      expect(result.riskFactors["hasMultipleRiskDrugs"]).toBe(true);
    });

    it("脳器質的障害ありの場合はHIGHを返す", () => {
      const features = createDefaultFeatures();
      features.medicalHistory!.hasOrganicBrainDamage = true;
      const result = assessRiskLevel(features);
      expect(result.riskLevel).toBe("HIGH");
      expect(result.riskFactors["hasOrganicBrainDamage"]).toBe(true);
    });

    it("アルコール多飲の場合はHIGHを返す", () => {
      const features = createDefaultFeatures();
      features.medicalHistory!.isHeavyAlcohol = true;
      const result = assessRiskLevel(features);
      expect(result.riskLevel).toBe("HIGH");
      expect(result.riskFactors["isHeavyAlcohol"]).toBe(true);
    });

    it("向精神薬使用の場合はHIGHを返す", () => {
      const features = createDefaultFeatures();
      features.medicalHistory!.usesPsychotropicDrugs = true;
      const result = assessRiskLevel(features);
      expect(result.riskLevel).toBe("HIGH");
      expect(result.riskFactors["usesPsychotropicDrugs"]).toBe(true);
    });

    it("全身麻酔予定の場合はHIGHを返す", () => {
      const features = createDefaultFeatures();
      features.medicalHistory!.hasGeneralAnesthesia = true;
      const result = assessRiskLevel(features);
      expect(result.riskLevel).toBe("HIGH");
      expect(result.riskFactors["hasGeneralAnesthesia"]).toBe(true);
    });

    it("緊急手術予定の場合はHIGHを返す", () => {
      const features = createDefaultFeatures();
      features.medicalHistory!.hasEmergencySurgery = true;
      const result = assessRiskLevel(features);
      expect(result.riskLevel).toBe("HIGH");
      expect(result.riskFactors["hasEmergencySurgery"]).toBe(true);
    });
  });

  describe("低リスク（LOW）", () => {
    it("リスク因子がない場合はLOWを返す", () => {
      const features = createDefaultFeatures();
      const result = assessRiskLevel(features);
      expect(result.riskLevel).toBe("LOW");
      expect(Object.keys(result.riskFactors)).toHaveLength(0);
    });

    it("CRPが5.0以下の場合はリスク因子に含まれない", () => {
      const features = createDefaultFeatures();
      features.labResults["CRP"] = 3.0;
      const result = assessRiskLevel(features);
      expect(result.riskFactors["highCrp"]).toBeUndefined();
    });

    it("リスク薬剤が1剤の場合はリスク因子に含まれない", () => {
      const features = createDefaultFeatures({ riskDrugCount: 1 });
      const result = assessRiskLevel(features);
      expect(result.riskFactors["hasMultipleRiskDrugs"]).toBeUndefined();
    });

    it("69歳の場合は年齢因子に含まれない", () => {
      const features = createDefaultFeatures({ age: 69 });
      const result = assessRiskLevel(features);
      expect(result.riskFactors["isOver70"]).toBeUndefined();
      expect(result.riskLevel).toBe("LOW");
    });
  });

  describe("境界値テスト", () => {
    it("70歳ちょうどの場合はHIGHを返す", () => {
      const features = createDefaultFeatures({ age: 70 });
      const result = assessRiskLevel(features);
      expect(result.riskLevel).toBe("HIGH");
      expect(result.riskFactors["isOver70"]).toBe(true);
    });

    it("CRP = 5.0の場合はLOWを返す（5.0超でなければリスクなし）", () => {
      const features = createDefaultFeatures();
      features.labResults["CRP"] = 5.0;
      const result = assessRiskLevel(features);
      expect(result.riskFactors["highCrp"]).toBeUndefined();
    });

    it("CRP = 5.1の場合はHIGHを返す", () => {
      const features = createDefaultFeatures();
      features.labResults["CRP"] = 5.1;
      const result = assessRiskLevel(features);
      expect(result.riskLevel).toBe("HIGH");
      expect(result.riskFactors["highCrp"]).toBe(true);
    });

    it("リスク薬剤ちょうど2剤の場合はHIGHを返す", () => {
      const features = createDefaultFeatures({ riskDrugCount: 2 });
      const result = assessRiskLevel(features);
      expect(result.riskLevel).toBe("HIGH");
      expect(result.riskFactors["hasMultipleRiskDrugs"]).toBe(true);
    });
  });
});

describe("predictRisk（一括リスク評価）", () => {
  it("複数入力に対して結果を返す", async () => {
    const inputs = [
      createDefaultFeatures({ admissionId: 1 }),
      createDefaultFeatures({ admissionId: 2, age: 75 }),
    ];

    const response = await predictRisk(inputs);
    expect(response.results).toHaveLength(2);
    expect(response.results[0].admissionId).toBe(1);
    expect(response.results[1].admissionId).toBe(2);
  });

  it("各結果にmlInputSnapshotが含まれる", async () => {
    const inputs = [createDefaultFeatures({ admissionId: 1 })];
    const response = await predictRisk(inputs);
    expect(response.results[0].mlInputSnapshot).toBeDefined();
    expect(response.results[0].mlInputSnapshot.admissionId).toBe(1);
  });

  it("HIGH判定の結果にリスク因子が含まれる", async () => {
    const inputs = [createDefaultFeatures({ admissionId: 1, age: 80 })];
    const response = await predictRisk(inputs);
    expect(response.results[0].riskLevel).toBe("HIGH");
    expect(response.results[0].riskFactors["isOver70"]).toBe(true);
  });

  it("INDETERMINATE判定の結果にmissingFieldsが含まれる", async () => {
    const inputs = [createDefaultFeatures({ admissionId: 1, age: null })];
    const response = await predictRisk(inputs);
    expect(response.results[0].riskLevel).toBe("INDETERMINATE");
    expect(response.results[0].missingFields).toBeDefined();
    expect(response.results[0].missingFields!.length).toBeGreaterThan(0);
  });

  it("LOW判定の結果にmissingFieldsが含まれない", async () => {
    const inputs = [createDefaultFeatures({ admissionId: 1 })];
    const response = await predictRisk(inputs);
    expect(response.results[0].riskLevel).toBe("LOW");
    expect(response.results[0].missingFields).toBeUndefined();
  });

  it("空の入力リストの場合は空の結果を返す", async () => {
    const response = await predictRisk([]);
    expect(response.results).toHaveLength(0);
  });
});
