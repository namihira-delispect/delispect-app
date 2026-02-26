import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { OpioidDrugList } from "../OpioidDrugList";
import type { PrescriptionEntry } from "../../types";

const mockOpioidDrugs: PrescriptionEntry[] = [
  {
    id: 1,
    yjCode: "OP001",
    drugName: "モルヒネ塩酸塩注射液10mg",
    prescriptionType: "INJECTION",
    prescribedAt: "2026-01-15T09:00:00.000Z",
    isRiskDrug: true,
    isOpioid: true,
    riskCategoryId: 1,
  },
  {
    id: 2,
    yjCode: "OP002",
    drugName: "フェンタニル貼付剤25μg/h",
    prescriptionType: "EXTERNAL",
    prescribedAt: "2026-01-16T10:00:00.000Z",
    isRiskDrug: true,
    isOpioid: true,
    riskCategoryId: 1,
  },
];

describe("OpioidDrugList", () => {
  it("オピオイド薬剤がない場合に安全メッセージを表示する", () => {
    render(<OpioidDrugList opioidDrugs={[]} />);
    expect(screen.getByText("オピオイド薬剤は処方されていません")).toBeDefined();
  });

  it("オピオイド薬剤がある場合に注意メッセージを表示する", () => {
    render(<OpioidDrugList opioidDrugs={mockOpioidDrugs} />);
    expect(screen.getByText(/オピオイド薬剤は本システム上で麻薬として取り扱います/)).toBeDefined();
  });

  it("オピオイド薬剤名を表示する", () => {
    render(<OpioidDrugList opioidDrugs={mockOpioidDrugs} />);
    expect(screen.getByText("モルヒネ塩酸塩注射液10mg")).toBeDefined();
    expect(screen.getByText("フェンタニル貼付剤25μg/h")).toBeDefined();
  });

  it("麻薬バッジを表示する", () => {
    render(<OpioidDrugList opioidDrugs={mockOpioidDrugs} />);
    const badges = screen.getAllByText("麻薬");
    expect(badges).toHaveLength(2);
  });

  it("処方種別を正しく表示する", () => {
    render(<OpioidDrugList opioidDrugs={mockOpioidDrugs} />);
    expect(screen.getByText(/種別: 注射/)).toBeDefined();
    expect(screen.getByText(/種別: 外用/)).toBeDefined();
  });

  it("YJコードを表示する", () => {
    render(<OpioidDrugList opioidDrugs={mockOpioidDrugs} />);
    expect(screen.getByText(/コード: OP001/)).toBeDefined();
    expect(screen.getByText(/コード: OP002/)).toBeDefined();
  });
});
