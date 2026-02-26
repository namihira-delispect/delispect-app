import { describe, it, expect } from "vitest";
import {
  evaluateLabDeviation,
  calculateDehydrationRiskScore,
  determineRiskLevel,
  generateDehydrationProposals,
  generateInstructions,
  assessDehydration,
} from "../assessDehydration";
import type { DehydrationDetails, LabValueAnswer } from "../types";
import { EMPTY_DEHYDRATION_DETAILS } from "../types";

describe("脱水ケアプラン: アセスメントロジック", () => {
  describe("evaluateLabDeviation", () => {
    it("nullの場合はNO_DATAを返す", () => {
      expect(evaluateLabDeviation(null)).toBe("NO_DATA");
    });

    it("値がnullの場合はNO_DATAを返す", () => {
      const lab: LabValueAnswer = {
        value: null,
        lowerLimit: 38,
        upperLimit: 48,
        unit: "%",
        deviationStatus: "NO_DATA",
      };
      expect(evaluateLabDeviation(lab)).toBe("NO_DATA");
    });

    it("基準値内の場合はNORMALを返す", () => {
      const lab: LabValueAnswer = {
        value: 42,
        lowerLimit: 38,
        upperLimit: 48,
        unit: "%",
        deviationStatus: "NORMAL",
      };
      expect(evaluateLabDeviation(lab)).toBe("NORMAL");
    });

    it("上限超過の場合はHIGHを返す", () => {
      const lab: LabValueAnswer = {
        value: 55,
        lowerLimit: 38,
        upperLimit: 48,
        unit: "%",
        deviationStatus: "HIGH",
      };
      expect(evaluateLabDeviation(lab)).toBe("HIGH");
    });

    it("下限未満の場合はLOWを返す", () => {
      const lab: LabValueAnswer = {
        value: 30,
        lowerLimit: 38,
        upperLimit: 48,
        unit: "%",
        deviationStatus: "LOW",
      };
      expect(evaluateLabDeviation(lab)).toBe("LOW");
    });

    it("上限がnullの場合はLOWまたはNORMALを返す", () => {
      const lab: LabValueAnswer = {
        value: 30,
        lowerLimit: 38,
        upperLimit: null,
        unit: "%",
        deviationStatus: "LOW",
      };
      expect(evaluateLabDeviation(lab)).toBe("LOW");
    });

    it("下限がnullの場合はHIGHまたはNORMALを返す", () => {
      const lab: LabValueAnswer = {
        value: 55,
        lowerLimit: null,
        upperLimit: 48,
        unit: "%",
        deviationStatus: "HIGH",
      };
      expect(evaluateLabDeviation(lab)).toBe("HIGH");
    });
  });

  describe("calculateDehydrationRiskScore", () => {
    it("全てnullの場合はスコア0を返す", () => {
      expect(calculateDehydrationRiskScore(EMPTY_DEHYDRATION_DETAILS)).toBe(0);
    });

    it("Ht高値の場合にスコアが加算される", () => {
      const details: DehydrationDetails = {
        ...EMPTY_DEHYDRATION_DETAILS,
        labHt: {
          value: 55,
          lowerLimit: 38,
          upperLimit: 48,
          unit: "%",
          deviationStatus: "HIGH",
        },
      };
      expect(calculateDehydrationRiskScore(details)).toBe(3);
    });

    it("頻脈（100bpm超）の場合にスコアが加算される", () => {
      const details: DehydrationDetails = {
        ...EMPTY_DEHYDRATION_DETAILS,
        vitalPulse: 110,
      };
      expect(calculateDehydrationRiskScore(details)).toBe(2);
    });

    it("軽度頻脈（90-100bpm）の場合にスコア1が加算される", () => {
      const details: DehydrationDetails = {
        ...EMPTY_DEHYDRATION_DETAILS,
        vitalPulse: 95,
      };
      expect(calculateDehydrationRiskScore(details)).toBe(1);
    });

    it("低血圧（<90mmHg）の場合にスコア3が加算される", () => {
      const details: DehydrationDetails = {
        ...EMPTY_DEHYDRATION_DETAILS,
        vitalSystolicBp: 85,
      };
      expect(calculateDehydrationRiskScore(details)).toBe(3);
    });

    it("目視確認SEVEREの場合にスコア2が加算される", () => {
      const details: DehydrationDetails = {
        ...EMPTY_DEHYDRATION_DETAILS,
        visualSkin: "SEVERE",
      };
      expect(calculateDehydrationRiskScore(details)).toBe(2);
    });

    it("目視確認MILDの場合にスコア1が加算される", () => {
      const details: DehydrationDetails = {
        ...EMPTY_DEHYDRATION_DETAILS,
        visualOral: "MILD",
      };
      expect(calculateDehydrationRiskScore(details)).toBe(1);
    });

    it("水分摂取頻度RAREの場合にスコア3が加算される", () => {
      const details: DehydrationDetails = {
        ...EMPTY_DEHYDRATION_DETAILS,
        intakeFrequency: "RARE",
      };
      expect(calculateDehydrationRiskScore(details)).toBe(3);
    });

    it("水分摂取量500ml未満の場合にスコア3が加算される", () => {
      const details: DehydrationDetails = {
        ...EMPTY_DEHYDRATION_DETAILS,
        intakeAmount: 400,
      };
      expect(calculateDehydrationRiskScore(details)).toBe(3);
    });

    it("水分摂取量500-1000mlの場合にスコア2が加算される", () => {
      const details: DehydrationDetails = {
        ...EMPTY_DEHYDRATION_DETAILS,
        intakeAmount: 800,
      };
      expect(calculateDehydrationRiskScore(details)).toBe(2);
    });

    it("水分摂取量1000-1500mlの場合にスコア1が加算される", () => {
      const details: DehydrationDetails = {
        ...EMPTY_DEHYDRATION_DETAILS,
        intakeAmount: 1200,
      };
      expect(calculateDehydrationRiskScore(details)).toBe(1);
    });

    it("複合的な異常の場合にスコアが累積される", () => {
      const details: DehydrationDetails = {
        ...EMPTY_DEHYDRATION_DETAILS,
        labHt: {
          value: 55,
          lowerLimit: 38,
          upperLimit: 48,
          unit: "%",
          deviationStatus: "HIGH",
        },
        vitalPulse: 110,
        vitalSystolicBp: 85,
        visualSkin: "SEVERE",
        intakeFrequency: "RARE",
        intakeAmount: 300,
      };
      // Ht高値(3) + 頻脈(2) + 低血圧(3) + 皮膚SEVERE(2) + 摂取頻度RARE(3) + 摂取量<500(3) = 16
      expect(calculateDehydrationRiskScore(details)).toBe(16);
    });
  });

  describe("determineRiskLevel", () => {
    it("スコア10以上でHIGHを返す", () => {
      expect(determineRiskLevel(10)).toBe("HIGH");
      expect(determineRiskLevel(15)).toBe("HIGH");
    });

    it("スコア5-9でMODERATEを返す", () => {
      expect(determineRiskLevel(5)).toBe("MODERATE");
      expect(determineRiskLevel(9)).toBe("MODERATE");
    });

    it("スコア1-4でLOWを返す", () => {
      expect(determineRiskLevel(1)).toBe("LOW");
      expect(determineRiskLevel(4)).toBe("LOW");
    });

    it("スコア0でNONEを返す", () => {
      expect(determineRiskLevel(0)).toBe("NONE");
    });
  });

  describe("generateDehydrationProposals", () => {
    it("正常値の場合は提案が少ない", () => {
      const details: DehydrationDetails = {
        ...EMPTY_DEHYDRATION_DETAILS,
        labHt: {
          value: 42,
          lowerLimit: 38,
          upperLimit: 48,
          unit: "%",
          deviationStatus: "NORMAL",
        },
        labHb: {
          value: 14,
          lowerLimit: 12,
          upperLimit: 17,
          unit: "g/dL",
          deviationStatus: "NORMAL",
        },
        vitalPulse: 72,
        vitalSystolicBp: 120,
        visualSkin: "NORMAL",
        visualOral: "NORMAL",
        visualDizziness: "NORMAL",
        visualUrine: "NORMAL",
        intakeFrequency: "FREQUENT",
        intakeAmount: 2000,
      };
      const proposals = generateDehydrationProposals(details);
      expect(proposals.length).toBe(0);
    });

    it("Ht高値の場合に採血結果の提案が含まれる", () => {
      const details: DehydrationDetails = {
        ...EMPTY_DEHYDRATION_DETAILS,
        labHt: {
          value: 55,
          lowerLimit: 38,
          upperLimit: 48,
          unit: "%",
          deviationStatus: "HIGH",
        },
      };
      const proposals = generateDehydrationProposals(details);
      expect(proposals.some((p) => p.id === "dehydration_lab_high")).toBe(true);
    });

    it("低血圧の場合に血圧の提案が含まれる", () => {
      const details: DehydrationDetails = {
        ...EMPTY_DEHYDRATION_DETAILS,
        vitalSystolicBp: 85,
      };
      const proposals = generateDehydrationProposals(details);
      expect(proposals.some((p) => p.id === "dehydration_bp_low")).toBe(true);
    });

    it("頻脈の場合に脈拍の提案が含まれる", () => {
      const details: DehydrationDetails = {
        ...EMPTY_DEHYDRATION_DETAILS,
        vitalPulse: 110,
      };
      const proposals = generateDehydrationProposals(details);
      expect(proposals.some((p) => p.id === "dehydration_pulse_high")).toBe(true);
    });

    it("皮膚SEVERE+口腔SEVEREの場合に重度の提案が含まれる", () => {
      const details: DehydrationDetails = {
        ...EMPTY_DEHYDRATION_DETAILS,
        visualSkin: "SEVERE",
        visualOral: "SEVERE",
      };
      const proposals = generateDehydrationProposals(details);
      expect(proposals.some((p) => p.id === "dehydration_visual_severe")).toBe(true);
    });

    it("水分摂取量が非常に少ない場合に強い警告が含まれる", () => {
      const details: DehydrationDetails = {
        ...EMPTY_DEHYDRATION_DETAILS,
        intakeAmount: 300,
      };
      const proposals = generateDehydrationProposals(details);
      expect(proposals.some((p) => p.id === "intake_amount_very_low")).toBe(true);
    });

    it("提案が優先度順にソートされている", () => {
      const details: DehydrationDetails = {
        ...EMPTY_DEHYDRATION_DETAILS,
        vitalPulse: 110,
        visualSkin: "MILD",
        intakeFrequency: "RARE",
        intakeAmount: 300,
      };
      const proposals = generateDehydrationProposals(details);
      for (let i = 1; i < proposals.length; i++) {
        expect(proposals[i].priority).toBeGreaterThanOrEqual(proposals[i - 1].priority);
      }
    });
  });

  describe("generateInstructions", () => {
    it("リスクレベルのラベルが含まれる", () => {
      const instructions = generateInstructions("HIGH", []);
      expect(instructions).toContain("脱水リスク高");
    });

    it("提案がない場合は経過観察のメッセージが含まれる", () => {
      const instructions = generateInstructions("NONE", []);
      expect(instructions).toContain("特別な対処は不要");
    });

    it("提案がある場合は対処提案セクションが含まれる", () => {
      const instructions = generateInstructions("HIGH", [
        {
          id: "test",
          category: "dehydration",
          message: "テスト提案",
          priority: 1,
        },
      ]);
      expect(instructions).toContain("対処提案");
      expect(instructions).toContain("テスト提案");
    });
  });

  describe("assessDehydration", () => {
    it("全て正常の場合はNONEリスクを返す", () => {
      const result = assessDehydration(EMPTY_DEHYDRATION_DETAILS);
      expect(result.riskLevel).toBe("NONE");
      expect(result.riskLevelLabel).toBe("脱水リスクなし");
    });

    it("複合的な異常の場合はHIGHリスクを返す", () => {
      const details: DehydrationDetails = {
        ...EMPTY_DEHYDRATION_DETAILS,
        labHt: {
          value: 55,
          lowerLimit: 38,
          upperLimit: 48,
          unit: "%",
          deviationStatus: "HIGH",
        },
        vitalPulse: 110,
        vitalSystolicBp: 85,
        visualSkin: "SEVERE",
        intakeFrequency: "RARE",
        intakeAmount: 300,
      };
      const result = assessDehydration(details);
      expect(result.riskLevel).toBe("HIGH");
      expect(result.proposals.length).toBeGreaterThan(0);
      expect(result.instructions).toContain("脱水リスク高");
    });

    it("instructionsフィールドが空でない文字列である", () => {
      const result = assessDehydration(EMPTY_DEHYDRATION_DETAILS);
      expect(result.instructions).toBeTruthy();
      expect(typeof result.instructions).toBe("string");
    });
  });
});
