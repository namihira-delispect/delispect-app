import { describe, it, expect } from "vitest";
import {
  DEHYDRATION_QUESTION_ORDER,
  DEHYDRATION_QUESTIONS,
  DEHYDRATION_GROUP_LABELS,
  VISUAL_CONDITION_LABELS,
  INTAKE_FREQUENCY_LABELS,
  DEHYDRATION_RISK_LEVEL_LABELS,
  EMPTY_DEHYDRATION_DETAILS,
} from "../types";

describe("脱水ケアプラン: 型定義・定数", () => {
  describe("DEHYDRATION_QUESTION_ORDER", () => {
    it("質問が10項目ある", () => {
      expect(DEHYDRATION_QUESTION_ORDER).toHaveLength(10);
    });

    it("正しい順序で質問が定義されている", () => {
      expect(DEHYDRATION_QUESTION_ORDER).toEqual([
        "lab_ht",
        "lab_hb",
        "vital_pulse",
        "vital_bp",
        "visual_skin",
        "visual_oral",
        "visual_dizziness",
        "visual_urine",
        "intake_frequency",
        "intake_amount",
      ]);
    });
  });

  describe("DEHYDRATION_QUESTIONS", () => {
    it("全質問のメタデータが定義されている", () => {
      for (const questionId of DEHYDRATION_QUESTION_ORDER) {
        const meta = DEHYDRATION_QUESTIONS[questionId];
        expect(meta).toBeDefined();
        expect(meta.id).toBe(questionId);
        expect(meta.title).toBeTruthy();
        expect(meta.description).toBeTruthy();
        expect(["lab", "vital", "visual", "intake"]).toContain(meta.group);
        expect(["lab_value", "vital_value", "select", "number"]).toContain(meta.inputType);
      }
    });

    it("採血結果の質問が2つある", () => {
      const labQuestions = DEHYDRATION_QUESTION_ORDER.filter(
        (q) => DEHYDRATION_QUESTIONS[q].group === "lab",
      );
      expect(labQuestions).toHaveLength(2);
    });

    it("バイタルの質問が2つある", () => {
      const vitalQuestions = DEHYDRATION_QUESTION_ORDER.filter(
        (q) => DEHYDRATION_QUESTIONS[q].group === "vital",
      );
      expect(vitalQuestions).toHaveLength(2);
    });

    it("目視確認の質問が4つある", () => {
      const visualQuestions = DEHYDRATION_QUESTION_ORDER.filter(
        (q) => DEHYDRATION_QUESTIONS[q].group === "visual",
      );
      expect(visualQuestions).toHaveLength(4);
    });

    it("水分摂取の質問が2つある", () => {
      const intakeQuestions = DEHYDRATION_QUESTION_ORDER.filter(
        (q) => DEHYDRATION_QUESTIONS[q].group === "intake",
      );
      expect(intakeQuestions).toHaveLength(2);
    });
  });

  describe("DEHYDRATION_GROUP_LABELS", () => {
    it("全グループのラベルが定義されている", () => {
      expect(DEHYDRATION_GROUP_LABELS.lab).toBe("採血結果の確認");
      expect(DEHYDRATION_GROUP_LABELS.vital).toBe("脈拍・血圧の確認");
      expect(DEHYDRATION_GROUP_LABELS.visual).toBe("目視確認");
      expect(DEHYDRATION_GROUP_LABELS.intake).toBe("水分摂取確認");
    });
  });

  describe("VISUAL_CONDITION_LABELS", () => {
    it("3段階の目視状態ラベルが定義されている", () => {
      expect(VISUAL_CONDITION_LABELS.NORMAL).toBe("正常");
      expect(VISUAL_CONDITION_LABELS.MILD).toBe("軽度異常");
      expect(VISUAL_CONDITION_LABELS.SEVERE).toBe("重度異常");
    });
  });

  describe("INTAKE_FREQUENCY_LABELS", () => {
    it("3段階の摂取頻度ラベルが定義されている", () => {
      expect(INTAKE_FREQUENCY_LABELS.FREQUENT).toContain("十分");
      expect(INTAKE_FREQUENCY_LABELS.MODERATE).toContain("普通");
      expect(INTAKE_FREQUENCY_LABELS.RARE).toContain("少ない");
    });
  });

  describe("DEHYDRATION_RISK_LEVEL_LABELS", () => {
    it("4段階のリスクレベルラベルが定義されている", () => {
      expect(DEHYDRATION_RISK_LEVEL_LABELS.HIGH).toBe("脱水リスク高");
      expect(DEHYDRATION_RISK_LEVEL_LABELS.MODERATE).toBe("脱水リスク中");
      expect(DEHYDRATION_RISK_LEVEL_LABELS.LOW).toBe("脱水リスク低");
      expect(DEHYDRATION_RISK_LEVEL_LABELS.NONE).toBe("脱水リスクなし");
    });
  });

  describe("EMPTY_DEHYDRATION_DETAILS", () => {
    it("全フィールドがnullで初期化されている", () => {
      expect(EMPTY_DEHYDRATION_DETAILS.labHt).toBeNull();
      expect(EMPTY_DEHYDRATION_DETAILS.labHb).toBeNull();
      expect(EMPTY_DEHYDRATION_DETAILS.vitalPulse).toBeNull();
      expect(EMPTY_DEHYDRATION_DETAILS.vitalSystolicBp).toBeNull();
      expect(EMPTY_DEHYDRATION_DETAILS.vitalDiastolicBp).toBeNull();
      expect(EMPTY_DEHYDRATION_DETAILS.visualSkin).toBeNull();
      expect(EMPTY_DEHYDRATION_DETAILS.visualOral).toBeNull();
      expect(EMPTY_DEHYDRATION_DETAILS.visualDizziness).toBeNull();
      expect(EMPTY_DEHYDRATION_DETAILS.visualUrine).toBeNull();
      expect(EMPTY_DEHYDRATION_DETAILS.intakeFrequency).toBeNull();
      expect(EMPTY_DEHYDRATION_DETAILS.intakeAmount).toBeNull();
    });
  });
});
