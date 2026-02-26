import { describe, it, expect } from "vitest";
import { ML_RISK_LEVEL_LABELS, BATCH_ASSESSMENT_LIMIT } from "../types";

describe("リスク評価型定義", () => {
  describe("ML_RISK_LEVEL_LABELS", () => {
    it("HIGHに対するラベルが定義されている", () => {
      expect(ML_RISK_LEVEL_LABELS.HIGH).toBe("高リスク");
    });

    it("LOWに対するラベルが定義されている", () => {
      expect(ML_RISK_LEVEL_LABELS.LOW).toBe("低リスク");
    });

    it("INDETERMINATEに対するラベルが定義されている", () => {
      expect(ML_RISK_LEVEL_LABELS.INDETERMINATE).toBe("判定不能");
    });

    it("3種類のラベルが定義されている", () => {
      expect(Object.keys(ML_RISK_LEVEL_LABELS)).toHaveLength(3);
    });
  });

  describe("BATCH_ASSESSMENT_LIMIT", () => {
    it("一括評価の上限が50件である", () => {
      expect(BATCH_ASSESSMENT_LIMIT).toBe(50);
    });
  });
});
