import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AlternativeDrugPanel } from "../AlternativeDrugPanel";
import type { RiskDrugMatch, SelectedAlternative } from "../../types";

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
    warningMessage: "ベンゾジアゼピン系薬剤が処方されています",
    alternatives: [
      {
        drugName: "ラメルテオン（ロゼレム）",
        medicinesCode: "ALT001",
        reason: "メラトニン受容体作動薬。せん妄リスクが低い睡眠薬。",
      },
      {
        drugName: "スボレキサント（ベルソムラ）",
        medicinesCode: "ALT002",
        reason: "オレキシン受容体拮抗薬。ベンゾジアゼピン系より安全性が高い。",
      },
    ],
    changeReason: "ベンゾジアゼピン系薬剤はGABA受容体に作用し、せん妄リスクを増大させます。",
  },
];

const mockMatchesNoAlternatives: RiskDrugMatch[] = [
  {
    prescription: {
      id: 3,
      yjCode: "YJ003",
      drugName: "テスト薬剤",
      prescriptionType: "ORAL",
      prescribedAt: "2026-01-15T09:00:00.000Z",
      isRiskDrug: true,
      isOpioid: false,
      riskCategoryId: 5,
    },
    warningMessage: "テスト警告",
    alternatives: [],
    changeReason: "テスト理由",
  },
];

describe("AlternativeDrugPanel", () => {
  const defaultProps = {
    riskDrugMatches: mockRiskDrugMatches,
    selectedAlternatives: [] as SelectedAlternative[],
    onSelectAlternative: vi.fn(),
    onRemoveAlternative: vi.fn(),
  };

  it("代替薬剤がないリスク薬剤のみの場合に空メッセージを表示する", () => {
    render(<AlternativeDrugPanel {...defaultProps} riskDrugMatches={mockMatchesNoAlternatives} />);
    expect(screen.getByText("代替薬剤の提案はありません")).toBeDefined();
  });

  it("リスク薬剤名を表示する", () => {
    render(<AlternativeDrugPanel {...defaultProps} />);
    expect(screen.getByText("ジアゼパム錠5mg")).toBeDefined();
  });

  it("変更理由を表示する", () => {
    render(<AlternativeDrugPanel {...defaultProps} />);
    expect(screen.getByText(/ベンゾジアゼピン系薬剤はGABA受容体に作用/)).toBeDefined();
  });

  it("代替薬剤の候補を表示する", () => {
    render(<AlternativeDrugPanel {...defaultProps} />);
    expect(screen.getByText("ラメルテオン（ロゼレム）")).toBeDefined();
    expect(screen.getByText("スボレキサント（ベルソムラ）")).toBeDefined();
  });

  it("代替薬剤の推奨理由を表示する", () => {
    render(<AlternativeDrugPanel {...defaultProps} />);
    expect(screen.getByText(/メラトニン受容体作動薬/)).toBeDefined();
  });

  it("選択ボタンをクリックするとonSelectAlternativeが呼ばれる", () => {
    const onSelectAlternative = vi.fn();
    render(<AlternativeDrugPanel {...defaultProps} onSelectAlternative={onSelectAlternative} />);
    const selectButtons = screen.getAllByText("選択");
    fireEvent.click(selectButtons[0]);
    expect(onSelectAlternative).toHaveBeenCalledWith({
      originalPrescriptionId: 1,
      originalDrugName: "ジアゼパム錠5mg",
      alternativeDrugName: "ラメルテオン（ロゼレム）",
      changeReason: "ベンゾジアゼピン系薬剤はGABA受容体に作用し、せん妄リスクを増大させます。",
    });
  });

  it("選択済みの場合に選択解除ボタンを表示する", () => {
    const selectedAlternatives: SelectedAlternative[] = [
      {
        originalPrescriptionId: 1,
        originalDrugName: "ジアゼパム錠5mg",
        alternativeDrugName: "ラメルテオン（ロゼレム）",
        changeReason: "テスト理由",
      },
    ];
    render(<AlternativeDrugPanel {...defaultProps} selectedAlternatives={selectedAlternatives} />);
    expect(screen.getByText("選択解除")).toBeDefined();
  });

  it("選択解除ボタンをクリックするとonRemoveAlternativeが呼ばれる", () => {
    const onRemoveAlternative = vi.fn();
    const selectedAlternatives: SelectedAlternative[] = [
      {
        originalPrescriptionId: 1,
        originalDrugName: "ジアゼパム錠5mg",
        alternativeDrugName: "ラメルテオン（ロゼレム）",
        changeReason: "テスト理由",
      },
    ];
    render(
      <AlternativeDrugPanel
        {...defaultProps}
        selectedAlternatives={selectedAlternatives}
        onRemoveAlternative={onRemoveAlternative}
      />,
    );
    fireEvent.click(screen.getByText("選択解除"));
    expect(onRemoveAlternative).toHaveBeenCalledWith(1);
  });
});
