import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RiskAssessmentSection } from "../RiskAssessmentSection";
import type { RiskAssessmentDisplay } from "../../../types";

const mockRiskAssessments: RiskAssessmentDisplay[] = [
  {
    riskLevel: "HIGH",
    riskFactors: {
      isOver70: true,
      hasDementia: true,
      hasRiskDrug: false,
    },
    riskScore: 0.85,
    assessedAt: "2026-02-25T14:00:00.000Z",
    assessedBy: "山田医師",
  },
];

describe("RiskAssessmentSection", () => {
  describe("レンダリング", () => {
    it("リスク評価情報のタイトルが表示される", () => {
      render(<RiskAssessmentSection riskAssessments={mockRiskAssessments} />);
      expect(screen.getByText("リスク評価情報")).toBeDefined();
    });

    it("テーブルヘッダーが表示される", () => {
      render(<RiskAssessmentSection riskAssessments={mockRiskAssessments} />);
      expect(screen.getByText("評価結果")).toBeDefined();
      expect(screen.getByText("リスク要因")).toBeDefined();
      expect(screen.getByText("スコア")).toBeDefined();
      expect(screen.getByText("評価日時")).toBeDefined();
      expect(screen.getByText("評価者")).toBeDefined();
    });

    it("リスクレベルがバッジで表示される", () => {
      render(<RiskAssessmentSection riskAssessments={mockRiskAssessments} />);
      expect(screen.getByText("高")).toBeDefined();
    });

    it("リスクスコアが表示される", () => {
      render(<RiskAssessmentSection riskAssessments={mockRiskAssessments} />);
      expect(screen.getByText("0.85")).toBeDefined();
    });

    it("評価者が表示される", () => {
      render(<RiskAssessmentSection riskAssessments={mockRiskAssessments} />);
      expect(screen.getByText("山田医師")).toBeDefined();
    });

    it("リスク要因がテキストで表示される", () => {
      render(<RiskAssessmentSection riskAssessments={mockRiskAssessments} />);
      // trueの値のみ表示される
      expect(screen.getByText(/isOver70/)).toBeDefined();
      expect(screen.getByText(/hasDementia/)).toBeDefined();
    });
  });

  describe("データが空の場合", () => {
    it("リスク評価がない場合にメッセージが表示される", () => {
      render(<RiskAssessmentSection riskAssessments={[]} />);
      expect(screen.getByText("リスク評価データがありません")).toBeDefined();
    });
  });

  describe("リスクスコアがnullの場合", () => {
    it("スコアがnullの場合にハイフンが表示される", () => {
      const assessments = [{ ...mockRiskAssessments[0], riskScore: null }];
      render(<RiskAssessmentSection riskAssessments={assessments} />);
      // スコア列にハイフンが表示される
      const scoreHeader = screen.getByText("スコア");
      const table = scoreHeader.closest("table");
      expect(table?.textContent).toContain("-");
    });
  });
});
