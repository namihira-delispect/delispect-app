import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { HighRiskKasanAssessmentForm } from "../HighRiskKasanAssessmentForm";
import type { HighRiskKasanAssessmentDisplay } from "../../types";

const mockAssessment: HighRiskKasanAssessmentDisplay = {
  admissionId: 1,
  isEligible: false,
  isAssessed: false,
  items: [
    {
      key: "hasDementia",
      label: "認知症",
      category: "MEDICAL_HISTORY",
      source: "MANUAL",
      isApplicable: false,
      criteria: "認知症の診断がある",
    },
    {
      key: "hasOrganicBrainDamage",
      label: "脳器質的障害",
      category: "MEDICAL_HISTORY",
      source: "MANUAL",
      isApplicable: false,
      criteria: "脳血管障害、脳腫瘍等の脳器質的障害がある",
    },
    {
      key: "isHeavyAlcohol",
      label: "アルコール多飲",
      category: "MEDICAL_HISTORY",
      source: "MANUAL",
      isApplicable: false,
      criteria: "アルコールの多量摂取歴がある",
    },
    {
      key: "hasDeliriumHistory",
      label: "せん妄の既往",
      category: "MEDICAL_HISTORY",
      source: "MANUAL",
      isApplicable: false,
      criteria: "過去にせん妄を発症したことがある",
    },
    {
      key: "hasGeneralAnesthesia",
      label: "全身麻酔の予定",
      category: "MEDICAL_HISTORY",
      source: "MANUAL",
      isApplicable: false,
      criteria: "全身麻酔を伴う手術の予定がある",
    },
    {
      key: "isOver70",
      label: "70歳以上",
      category: "AGE",
      source: "AUTO",
      isApplicable: true,
      criteria: "患者の年齢が70歳以上（生年月日から自動算出）",
    },
    {
      key: "hasRiskDrug",
      label: "リスク薬剤の使用",
      category: "RISK_DRUG",
      source: "AUTO",
      isApplicable: false,
      criteria: "せん妄リスクのある薬剤が処方されている（薬剤マスタで照合）",
    },
  ],
  assessedBy: null,
  assessedAt: null,
};

describe("HighRiskKasanAssessmentForm", () => {
  const mockOnSave = vi.fn().mockResolvedValue(undefined);

  describe("レンダリング", () => {
    it("タイトルが表示される", () => {
      render(
        <HighRiskKasanAssessmentForm
          assessment={mockAssessment}
          onSave={mockOnSave}
          isSaving={false}
        />,
      );
      expect(screen.getByText("せん妄ハイリスクケア加算アセスメント")).toBeDefined();
    });

    it("カテゴリーヘッダーが表示される", () => {
      render(
        <HighRiskKasanAssessmentForm
          assessment={mockAssessment}
          onSave={mockOnSave}
          isSaving={false}
        />,
      );
      expect(screen.getByText("既往歴・手術歴（手動入力）")).toBeDefined();
      expect(screen.getByText("年齢（自動判定）")).toBeDefined();
      expect(screen.getByText("リスク薬剤（自動判定）")).toBeDefined();
    });

    it("全てのアセスメント項目ラベルが表示される", () => {
      render(
        <HighRiskKasanAssessmentForm
          assessment={mockAssessment}
          onSave={mockOnSave}
          isSaving={false}
        />,
      );
      expect(screen.getByText("認知症")).toBeDefined();
      expect(screen.getByText("脳器質的障害")).toBeDefined();
      expect(screen.getByText("アルコール多飲")).toBeDefined();
      expect(screen.getByText("せん妄の既往")).toBeDefined();
      expect(screen.getByText("全身麻酔の予定")).toBeDefined();
      expect(screen.getByText("70歳以上")).toBeDefined();
      expect(screen.getByText("リスク薬剤の使用")).toBeDefined();
    });

    it("判定基準が表示される", () => {
      render(
        <HighRiskKasanAssessmentForm
          assessment={mockAssessment}
          onSave={mockOnSave}
          isSaving={false}
        />,
      );
      expect(screen.getByText("認知症の診断がある")).toBeDefined();
    });

    it("自動判定項目のチェックボックスが無効化されている", () => {
      render(
        <HighRiskKasanAssessmentForm
          assessment={mockAssessment}
          onSave={mockOnSave}
          isSaving={false}
        />,
      );
      const autoCheckbox = screen.getByLabelText("70歳以上");
      expect(autoCheckbox).toBeDefined();
      expect((autoCheckbox as HTMLInputElement).disabled).toBe(true);
    });

    it("手動入力項目のチェックボックスが操作可能である", () => {
      render(
        <HighRiskKasanAssessmentForm
          assessment={mockAssessment}
          onSave={mockOnSave}
          isSaving={false}
        />,
      );
      const manualCheckbox = screen.getByLabelText("認知症");
      expect(manualCheckbox).toBeDefined();
      expect((manualCheckbox as HTMLInputElement).disabled).toBe(false);
    });
  });

  describe("判定結果の表示", () => {
    it("自動判定項目に該当がある場合、加算対象と表示される", () => {
      render(
        <HighRiskKasanAssessmentForm
          assessment={mockAssessment}
          onSave={mockOnSave}
          isSaving={false}
        />,
      );
      expect(screen.getByText(/加算対象/)).toBeDefined();
    });

    it("全項目が非該当の場合、非対象と表示される", () => {
      const noRiskAssessment: HighRiskKasanAssessmentDisplay = {
        ...mockAssessment,
        items: mockAssessment.items.map((item) => ({
          ...item,
          isApplicable: false,
        })),
      };
      render(
        <HighRiskKasanAssessmentForm
          assessment={noRiskAssessment}
          onSave={mockOnSave}
          isSaving={false}
        />,
      );
      expect(screen.getByText(/非対象/)).toBeDefined();
    });
  });

  describe("保存操作", () => {
    it("保存ボタンが表示される", () => {
      render(
        <HighRiskKasanAssessmentForm
          assessment={mockAssessment}
          onSave={mockOnSave}
          isSaving={false}
        />,
      );
      expect(screen.getByText("判定結果を保存")).toBeDefined();
    });

    it("保存中の場合、ボタンが無効化される", () => {
      render(
        <HighRiskKasanAssessmentForm
          assessment={mockAssessment}
          onSave={mockOnSave}
          isSaving={true}
        />,
      );
      const button = screen.getByText("保存中...");
      expect(button).toBeDefined();
      expect((button as HTMLButtonElement).disabled).toBe(true);
    });

    it("判定済みの場合、更新ボタンのテキストになる", () => {
      const assessedAssessment: HighRiskKasanAssessmentDisplay = {
        ...mockAssessment,
        isAssessed: true,
        assessedBy: "テスト看護師",
        assessedAt: "2026-02-27T10:00:00.000Z",
      };
      render(
        <HighRiskKasanAssessmentForm
          assessment={assessedAssessment}
          onSave={mockOnSave}
          isSaving={false}
        />,
      );
      expect(screen.getByText("判定結果を更新")).toBeDefined();
    });

    it("チェックボックスを操作してフォームを送信できる", async () => {
      render(
        <HighRiskKasanAssessmentForm
          assessment={mockAssessment}
          onSave={mockOnSave}
          isSaving={false}
        />,
      );

      // 認知症のチェックボックスをチェック
      const checkbox = screen.getByLabelText("認知症");
      fireEvent.click(checkbox);

      // 保存ボタンをクリック
      const saveButton = screen.getByText("判定結果を保存");
      fireEvent.click(saveButton);

      expect(mockOnSave).toHaveBeenCalledWith({
        hasDementia: true,
        hasOrganicBrainDamage: false,
        isHeavyAlcohol: false,
        hasDeliriumHistory: false,
        hasGeneralAnesthesia: false,
      });
    });
  });

  describe("評価者情報の表示", () => {
    it("判定済みの場合、評価者名と評価日時が表示される", () => {
      const assessedAssessment: HighRiskKasanAssessmentDisplay = {
        ...mockAssessment,
        isAssessed: true,
        assessedBy: "テスト看護師",
        assessedAt: "2026-02-27T10:00:00.000Z",
      };
      render(
        <HighRiskKasanAssessmentForm
          assessment={assessedAssessment}
          onSave={mockOnSave}
          isSaving={false}
        />,
      );
      expect(screen.getByText(/テスト看護師/)).toBeDefined();
      expect(screen.getByText(/確定済み/)).toBeDefined();
    });
  });
});
