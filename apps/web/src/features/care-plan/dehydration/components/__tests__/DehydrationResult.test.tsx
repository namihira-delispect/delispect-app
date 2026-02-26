import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DehydrationResult } from "../DehydrationResult";
import type { DehydrationAssessmentResult, DehydrationDetails } from "../../types";
import { EMPTY_DEHYDRATION_DETAILS } from "../../types";

describe("DehydrationResult", () => {
  const defaultResult: DehydrationAssessmentResult = {
    riskLevel: "MODERATE",
    riskLevelLabel: "脱水リスク中",
    proposals: [
      {
        id: "test_proposal_1",
        category: "dehydration",
        message: "テスト提案1",
        priority: 1,
      },
      {
        id: "test_proposal_2",
        category: "intake",
        message: "テスト提案2",
        priority: 2,
      },
    ],
    instructions: "テスト指示",
  };

  const defaultDetails: DehydrationDetails = {
    ...EMPTY_DEHYDRATION_DETAILS,
    vitalPulse: 80,
    vitalSystolicBp: 120,
    vitalDiastolicBp: 75,
    visualSkin: "NORMAL",
    intakeFrequency: "MODERATE",
    intakeAmount: 1200,
  };

  it("リスクレベルラベルが表示される", () => {
    render(
      <DehydrationResult result={defaultResult} details={defaultDetails} onBackToList={vi.fn()} />,
    );
    expect(screen.getByText("脱水リスク中")).toBeDefined();
  });

  it("対処提案が表示される", () => {
    render(
      <DehydrationResult result={defaultResult} details={defaultDetails} onBackToList={vi.fn()} />,
    );
    expect(screen.getByText("テスト提案1")).toBeDefined();
    expect(screen.getByText("テスト提案2")).toBeDefined();
  });

  it("提案がない場合は経過観察のメッセージが表示される", () => {
    const noProposalResult: DehydrationAssessmentResult = {
      ...defaultResult,
      riskLevel: "NONE",
      riskLevelLabel: "脱水リスクなし",
      proposals: [],
    };
    render(
      <DehydrationResult
        result={noProposalResult}
        details={defaultDetails}
        onBackToList={vi.fn()}
      />,
    );
    expect(screen.getByText(/特別な対処は不要/)).toBeDefined();
  });

  it("入力サマリーテーブルが表示される", () => {
    render(
      <DehydrationResult result={defaultResult} details={defaultDetails} onBackToList={vi.fn()} />,
    );
    expect(screen.getByText("入力内容サマリー")).toBeDefined();
    expect(screen.getByText("Ht（ヘマトクリット）")).toBeDefined();
    expect(screen.getByText("Hb（ヘモグロビン）")).toBeDefined();
  });

  it("ケアプラン一覧に戻るボタンでonBackToListが呼ばれる", () => {
    const onBackToList = vi.fn();
    render(
      <DehydrationResult
        result={defaultResult}
        details={defaultDetails}
        onBackToList={onBackToList}
      />,
    );
    fireEvent.click(screen.getByText("ケアプラン一覧に戻る"));
    expect(onBackToList).toHaveBeenCalledTimes(1);
  });

  it("バイタルサインの回答が正しく表示される", () => {
    render(
      <DehydrationResult result={defaultResult} details={defaultDetails} onBackToList={vi.fn()} />,
    );
    expect(screen.getByText("80 bpm")).toBeDefined();
    expect(screen.getByText("120/75 mmHg")).toBeDefined();
  });
});
