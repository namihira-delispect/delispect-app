import { describe, it, expect } from "vitest";
import {
  dehydrationDetailsSchema,
  saveDehydrationSchema,
  completeDehydrationSchema,
  getDehydrationParamsSchema,
  visualConditionEnum,
  intakeFrequencyEnum,
} from "../schemata";

describe("脱水ケアプラン: バリデーションスキーマ", () => {
  describe("visualConditionEnum", () => {
    it("NORMAL, MILD, SEVEREを受け付ける", () => {
      expect(visualConditionEnum.safeParse("NORMAL").success).toBe(true);
      expect(visualConditionEnum.safeParse("MILD").success).toBe(true);
      expect(visualConditionEnum.safeParse("SEVERE").success).toBe(true);
    });

    it("無効な値を拒否する", () => {
      expect(visualConditionEnum.safeParse("INVALID").success).toBe(false);
      expect(visualConditionEnum.safeParse("").success).toBe(false);
    });
  });

  describe("intakeFrequencyEnum", () => {
    it("FREQUENT, MODERATE, RAREを受け付ける", () => {
      expect(intakeFrequencyEnum.safeParse("FREQUENT").success).toBe(true);
      expect(intakeFrequencyEnum.safeParse("MODERATE").success).toBe(true);
      expect(intakeFrequencyEnum.safeParse("RARE").success).toBe(true);
    });

    it("無効な値を拒否する", () => {
      expect(intakeFrequencyEnum.safeParse("INVALID").success).toBe(false);
    });
  });

  describe("dehydrationDetailsSchema", () => {
    it("全フィールドがnullの場合に受け付ける", () => {
      const input = {
        labHt: null,
        labHb: null,
        vitalPulse: null,
        vitalSystolicBp: null,
        vitalDiastolicBp: null,
        visualSkin: null,
        visualOral: null,
        visualDizziness: null,
        visualUrine: null,
        intakeFrequency: null,
        intakeAmount: null,
      };
      const result = dehydrationDetailsSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("有効な完全データを受け付ける", () => {
      const input = {
        labHt: {
          value: 45.0,
          lowerLimit: 38.0,
          upperLimit: 48.0,
          unit: "%",
          deviationStatus: "NORMAL",
        },
        labHb: {
          value: 15.0,
          lowerLimit: 12.0,
          upperLimit: 17.0,
          unit: "g/dL",
          deviationStatus: "NORMAL",
        },
        vitalPulse: 72,
        vitalSystolicBp: 120,
        vitalDiastolicBp: 80,
        visualSkin: "NORMAL",
        visualOral: "MILD",
        visualDizziness: "NORMAL",
        visualUrine: "SEVERE",
        intakeFrequency: "MODERATE",
        intakeAmount: 1200,
      };
      const result = dehydrationDetailsSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("vitalPulseが範囲外の場合にエラーを返す", () => {
      const input = {
        labHt: null,
        labHb: null,
        vitalPulse: 301,
        vitalSystolicBp: null,
        vitalDiastolicBp: null,
        visualSkin: null,
        visualOral: null,
        visualDizziness: null,
        visualUrine: null,
        intakeFrequency: null,
        intakeAmount: null,
      };
      const result = dehydrationDetailsSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("intakeAmountが負の値の場合にエラーを返す", () => {
      const input = {
        labHt: null,
        labHb: null,
        vitalPulse: null,
        vitalSystolicBp: null,
        vitalDiastolicBp: null,
        visualSkin: null,
        visualOral: null,
        visualDizziness: null,
        visualUrine: null,
        intakeFrequency: null,
        intakeAmount: -100,
      };
      const result = dehydrationDetailsSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("無効なvisualConditionを拒否する", () => {
      const input = {
        labHt: null,
        labHb: null,
        vitalPulse: null,
        vitalSystolicBp: null,
        vitalDiastolicBp: null,
        visualSkin: "UNKNOWN",
        visualOral: null,
        visualDizziness: null,
        visualUrine: null,
        intakeFrequency: null,
        intakeAmount: null,
      };
      const result = dehydrationDetailsSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe("saveDehydrationSchema", () => {
    it("有効な保存リクエストを受け付ける", () => {
      const input = {
        itemId: 1,
        currentQuestionId: "lab_ht",
        details: {
          labHt: null,
          labHb: null,
          vitalPulse: null,
          vitalSystolicBp: null,
          vitalDiastolicBp: null,
          visualSkin: null,
          visualOral: null,
          visualDizziness: null,
          visualUrine: null,
          intakeFrequency: null,
          intakeAmount: null,
        },
      };
      const result = saveDehydrationSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("文字列のitemIdを数値に変換する", () => {
      const input = {
        itemId: "5",
        currentQuestionId: "vital_pulse",
        details: {
          labHt: null,
          labHb: null,
          vitalPulse: 80,
          vitalSystolicBp: null,
          vitalDiastolicBp: null,
          visualSkin: null,
          visualOral: null,
          visualDizziness: null,
          visualUrine: null,
          intakeFrequency: null,
          intakeAmount: null,
        },
      };
      const result = saveDehydrationSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.itemId).toBe(5);
      }
    });

    it("itemIdが0の場合にエラーを返す", () => {
      const input = {
        itemId: 0,
        currentQuestionId: "lab_ht",
        details: {
          labHt: null,
          labHb: null,
          vitalPulse: null,
          vitalSystolicBp: null,
          vitalDiastolicBp: null,
          visualSkin: null,
          visualOral: null,
          visualDizziness: null,
          visualUrine: null,
          intakeFrequency: null,
          intakeAmount: null,
        },
      };
      const result = saveDehydrationSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("無効な質問IDを拒否する", () => {
      const input = {
        itemId: 1,
        currentQuestionId: "invalid_question",
        details: {
          labHt: null,
          labHb: null,
          vitalPulse: null,
          vitalSystolicBp: null,
          vitalDiastolicBp: null,
          visualSkin: null,
          visualOral: null,
          visualDizziness: null,
          visualUrine: null,
          intakeFrequency: null,
          intakeAmount: null,
        },
      };
      const result = saveDehydrationSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe("completeDehydrationSchema", () => {
    it("有効な完了リクエストを受け付ける", () => {
      const input = {
        itemId: 1,
        details: {
          labHt: null,
          labHb: null,
          vitalPulse: 72,
          vitalSystolicBp: 120,
          vitalDiastolicBp: 80,
          visualSkin: "NORMAL",
          visualOral: "NORMAL",
          visualDizziness: "NORMAL",
          visualUrine: "NORMAL",
          intakeFrequency: "FREQUENT",
          intakeAmount: 1500,
        },
      };
      const result = completeDehydrationSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("itemIdが負の場合にエラーを返す", () => {
      const input = {
        itemId: -1,
        details: {
          labHt: null,
          labHb: null,
          vitalPulse: null,
          vitalSystolicBp: null,
          vitalDiastolicBp: null,
          visualSkin: null,
          visualOral: null,
          visualDizziness: null,
          visualUrine: null,
          intakeFrequency: null,
          intakeAmount: null,
        },
      };
      const result = completeDehydrationSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe("getDehydrationParamsSchema", () => {
    it("正の整数itemIdを受け付ける", () => {
      const result = getDehydrationParamsSchema.safeParse({ itemId: 1 });
      expect(result.success).toBe(true);
    });

    it("文字列のitemIdを数値に変換する", () => {
      const result = getDehydrationParamsSchema.safeParse({ itemId: "42" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.itemId).toBe(42);
      }
    });

    it("itemIdが0の場合にエラーを返す", () => {
      const result = getDehydrationParamsSchema.safeParse({ itemId: 0 });
      expect(result.success).toBe(false);
    });

    it("itemIdが未指定の場合にエラーを返す", () => {
      const result = getDehydrationParamsSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });
});
