import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AdmissionTable } from "../AdmissionTable";
import type { AdmissionListEntry } from "../../types";

// Next.js Link コンポーネントのモック
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    style?: React.CSSProperties;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const mockAdmissions: AdmissionListEntry[] = [
  {
    admissionId: 1,
    patientId: "P001",
    patientInternalId: 1,
    patientName: "田中 太郎",
    patientNameKana: "タナカ タロウ",
    age: 75,
    gender: "MALE",
    admissionDate: "2026-02-25",
    isOver70: true,
    hasRiskDrug: true,
    hasDementia: true,
    hasOrganicBrainDamage: false,
    isHeavyAlcohol: false,
    hasDeliriumHistory: true,
    hasGeneralAnesthesia: false,
    isHighRisk: true,
    aiRiskLevel: "HIGH",
    careStatus: "IN_PROGRESS",
    carePlanId: 10,
    latestAssessmentDate: "2026-02-25",
  },
  {
    admissionId: 2,
    patientId: "P002",
    patientInternalId: 2,
    patientName: "佐藤 花子",
    patientNameKana: "サトウ ハナコ",
    age: 60,
    gender: "FEMALE",
    admissionDate: "2026-02-26",
    isOver70: false,
    hasRiskDrug: false,
    hasDementia: false,
    hasOrganicBrainDamage: false,
    isHeavyAlcohol: false,
    hasDeliriumHistory: false,
    hasGeneralAnesthesia: false,
    isHighRisk: false,
    aiRiskLevel: "NOT_ASSESSED",
    careStatus: "NOT_STARTED",
    carePlanId: null,
    latestAssessmentDate: null,
  },
];

describe("AdmissionTable", () => {
  const defaultProps = {
    admissions: mockAdmissions,
    sortColumn: "admissionDate",
    sortDirection: "desc" as const,
    onSort: vi.fn(),
    selectedIds: new Set<number>(),
    onSelectionChange: vi.fn(),
  };

  describe("レンダリング", () => {
    it("テーブルが表示される", () => {
      render(<AdmissionTable {...defaultProps} />);
      expect(screen.getByText("P001")).toBeDefined();
      expect(screen.getByText("P002")).toBeDefined();
    });

    it("患者名が表示される", () => {
      render(<AdmissionTable {...defaultProps} />);
      expect(screen.getByText("田中 太郎")).toBeDefined();
      expect(screen.getByText("佐藤 花子")).toBeDefined();
    });

    it("フリガナが表示される", () => {
      render(<AdmissionTable {...defaultProps} />);
      expect(screen.getByText("タナカ タロウ")).toBeDefined();
      expect(screen.getByText("サトウ ハナコ")).toBeDefined();
    });

    it("入院日がYYYY/MM/DD形式で表示される", () => {
      render(<AdmissionTable {...defaultProps} />);
      expect(screen.getByText("2026/02/25")).toBeDefined();
      expect(screen.getByText("2026/02/26")).toBeDefined();
    });

    it("AIリスク判定のラベルが表示される", () => {
      render(<AdmissionTable {...defaultProps} />);
      expect(screen.getByText("高")).toBeDefined();
      // 「未実施」はAIリスク判定とケア実施状況の両方に表示される
      const allNotAssessed = screen.getAllByText("未実施");
      expect(allNotAssessed.length).toBeGreaterThanOrEqual(1);
    });

    it("ケア実施状況のラベルが表示される", () => {
      render(<AdmissionTable {...defaultProps} />);
      expect(screen.getByText("実施中")).toBeDefined();
      // 「未実施」はAIリスク判定とケア実施状況の両方に表示される
      const allNotStarted = screen.getAllByText("未実施");
      expect(allNotStarted.length).toBeGreaterThanOrEqual(1);
    });

    it("せん妄ハイリスクの判定が表示される", () => {
      render(<AdmissionTable {...defaultProps} />);
      expect(screen.getByText("該当")).toBeDefined();
      expect(screen.getByText("非該当")).toBeDefined();
    });

    it("患者名がリンクとして表示される", () => {
      render(<AdmissionTable {...defaultProps} />);
      const link = screen.getByText("田中 太郎");
      expect(link.closest("a")).toBeDefined();
      expect(link.closest("a")?.getAttribute("href")).toBe("/admissions/1");
    });

    it("ケアプランIDがある場合にケア実施状況がリンクとして表示される", () => {
      render(<AdmissionTable {...defaultProps} />);
      const link = screen.getByText("実施中");
      expect(link.closest("a")).toBeDefined();
      expect(link.closest("a")?.getAttribute("href")).toBe("/admissions/1/care-plan");
    });
  });

  describe("空の状態", () => {
    it("データが空の場合はメッセージが表示される", () => {
      render(<AdmissionTable {...defaultProps} admissions={[]} />);
      expect(screen.getByText("該当する入院レコードがありません")).toBeDefined();
    });
  });

  describe("ソート", () => {
    it("IDヘッダーをクリックするとonSortが呼ばれる", () => {
      const onSort = vi.fn();
      render(<AdmissionTable {...defaultProps} onSort={onSort} />);

      const idHeader = screen.getByText("ID");
      fireEvent.click(idHeader.closest("th")!);
      expect(onSort).toHaveBeenCalledWith("patientId", "desc");
    });

    it("入院日ヘッダーをクリックするとソート方向が切り替わる", () => {
      const onSort = vi.fn();
      render(
        <AdmissionTable
          {...defaultProps}
          sortColumn="admissionDate"
          sortDirection="desc"
          onSort={onSort}
        />,
      );

      const dateHeader = screen.getByText("入院日");
      fireEvent.click(dateHeader.closest("th")!);
      expect(onSort).toHaveBeenCalledWith("admissionDate", "asc");
    });
  });

  describe("行選択", () => {
    it("全件選択チェックボックスをクリックすると全行が選択される", () => {
      const onSelectionChange = vi.fn();
      render(<AdmissionTable {...defaultProps} onSelectionChange={onSelectionChange} />);

      const selectAllCheckbox = screen.getByLabelText("全件選択");
      fireEvent.click(selectAllCheckbox);
      expect(onSelectionChange).toHaveBeenCalledWith(new Set([1, 2]));
    });

    it("個別の行を選択できる", () => {
      const onSelectionChange = vi.fn();
      render(<AdmissionTable {...defaultProps} onSelectionChange={onSelectionChange} />);

      const rowCheckbox = screen.getByLabelText("田中 太郎を選択");
      fireEvent.click(rowCheckbox);
      expect(onSelectionChange).toHaveBeenCalledWith(new Set([1]));
    });

    it("選択済みの行のチェックボックスをクリックすると選択解除される", () => {
      const onSelectionChange = vi.fn();
      render(
        <AdmissionTable
          {...defaultProps}
          selectedIds={new Set([1])}
          onSelectionChange={onSelectionChange}
        />,
      );

      const rowCheckbox = screen.getByLabelText("田中 太郎を選択");
      fireEvent.click(rowCheckbox);
      expect(onSelectionChange).toHaveBeenCalledWith(new Set());
    });

    it("全件選択済みの状態で全件選択をクリックすると全選択解除される", () => {
      const onSelectionChange = vi.fn();
      render(
        <AdmissionTable
          {...defaultProps}
          selectedIds={new Set([1, 2])}
          onSelectionChange={onSelectionChange}
        />,
      );

      const selectAllCheckbox = screen.getByLabelText("全件選択");
      fireEvent.click(selectAllCheckbox);
      expect(onSelectionChange).toHaveBeenCalledWith(new Set());
    });
  });
});
