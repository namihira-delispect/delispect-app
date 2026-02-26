import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RiskDrugList } from "../RiskDrugList";
import type { RiskDrugMatch } from "../../types";

const mockRiskDrugMatches: RiskDrugMatch[] = [
  {
    prescription: {
      id: 1,
      yjCode: "YJ001",
      drugName: "ジアゼパム錠5mg",
      prescriptionType: "ORAL",
      prescribedAt: "2026-01-15T09:00:00.000Z",
      isRiskDrug: true,
      isOpioid: false,
      riskCategoryId: 2,
    },
    warningMessage:
      "ベンゾジアゼピン系薬剤が処方されています。せん妄リスクが高いため、投与を回避または減量を検討してください。",
    alternatives: [
      {
        drugName: "ラメルテオン（ロゼレム）",
        medicinesCode: "ALT001",
        reason: "メラトニン受容体作動薬。せん妄リスクが低い睡眠薬。",
      },
    ],
    changeReason: "ベンゾジアゼピン系薬剤はGABA受容体に作用し、せん妄リスクを増大させます。",
  },
  {
    prescription: {
      id: 2,
      yjCode: "YJ002",
      drugName: "ファモチジン錠20mg",
      prescriptionType: "ORAL",
      prescribedAt: "2026-01-15T09:00:00.000Z",
      isRiskDrug: true,
      isOpioid: false,
      riskCategoryId: 4,
    },
    warningMessage:
      "H2ブロッカーが処方されています。プロトンポンプ阻害薬（PPI）への変更を検討してください。",
    alternatives: [],
    changeReason: "H2ブロッカーは中枢神経系への影響があり、せん妄リスクがあります。",
  },
];

describe("RiskDrugList", () => {
  it("リスク薬剤がない場合に安全メッセージを表示する", () => {
    render(<RiskDrugList riskDrugMatches={[]} />);
    expect(screen.getByText("リスク薬剤は処方されていません")).toBeDefined();
  });

  it("リスク薬剤名を表示する", () => {
    render(<RiskDrugList riskDrugMatches={mockRiskDrugMatches} />);
    expect(screen.getByText("ジアゼパム錠5mg")).toBeDefined();
    expect(screen.getByText("ファモチジン錠20mg")).toBeDefined();
  });

  it("リスク薬剤カテゴリのバッジを表示する", () => {
    render(<RiskDrugList riskDrugMatches={mockRiskDrugMatches} />);
    expect(screen.getByText("ベンゾジアゼピン系")).toBeDefined();
    expect(screen.getByText("H2ブロッカー")).toBeDefined();
  });

  it("警告メッセージを表示する", () => {
    render(<RiskDrugList riskDrugMatches={mockRiskDrugMatches} />);
    expect(screen.getByText(/ベンゾジアゼピン系薬剤が処方されています/)).toBeDefined();
    expect(screen.getByText(/H2ブロッカーが処方されています/)).toBeDefined();
  });

  it("処方種別を表示する", () => {
    render(<RiskDrugList riskDrugMatches={mockRiskDrugMatches} />);
    const typeElements = screen.getAllByText(/種別: 内服/);
    expect(typeElements.length).toBe(2);
  });

  it("YJコードを表示する", () => {
    render(<RiskDrugList riskDrugMatches={mockRiskDrugMatches} />);
    expect(screen.getByText(/コード: YJ001/)).toBeDefined();
    expect(screen.getByText(/コード: YJ002/)).toBeDefined();
  });
});
