import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { CarePlanSection } from "../CarePlanSection";
import type { CarePlanDisplay } from "../../../types";

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

const mockCarePlan: CarePlanDisplay = {
  id: 10,
  items: [
    {
      category: "PAIN",
      status: "IN_PROGRESS",
      instructions: "鎮痛剤の投与量を確認する",
    },
    {
      category: "CONSTIPATION",
      status: "NOT_STARTED",
      instructions: null,
    },
    {
      category: "MEDICATION",
      status: "COMPLETED",
      instructions: "リスク薬剤の確認完了",
    },
  ],
  createdAt: "2026-02-24T09:00:00.000Z",
  updatedAt: "2026-02-25T14:00:00.000Z",
  createdBy: "看護師A",
};

describe("CarePlanSection", () => {
  describe("ケアプランがある場合", () => {
    it("ケアプラン情報のタイトルが表示される", () => {
      render(<CarePlanSection carePlan={mockCarePlan} admissionId={1} />);
      expect(screen.getByText("ケアプラン情報")).toBeDefined();
    });

    it("ケアプラン編集リンクが表示される", () => {
      render(<CarePlanSection carePlan={mockCarePlan} admissionId={1} />);
      const link = screen.getByText("ケアプラン編集");
      expect(link.closest("a")?.getAttribute("href")).toBe("/admissions/1/care-plan");
    });

    it("作成者が表示される", () => {
      render(<CarePlanSection carePlan={mockCarePlan} admissionId={1} />);
      expect(screen.getByText(/看護師A/)).toBeDefined();
    });

    it("カテゴリーが日本語で表示される", () => {
      render(<CarePlanSection carePlan={mockCarePlan} admissionId={1} />);
      expect(screen.getByText("疼痛管理")).toBeDefined();
      expect(screen.getByText("便秘管理")).toBeDefined();
      expect(screen.getByText("薬剤管理")).toBeDefined();
    });

    it("ステータスが日本語で表示される", () => {
      render(<CarePlanSection carePlan={mockCarePlan} admissionId={1} />);
      expect(screen.getByText("実施中")).toBeDefined();
      expect(screen.getByText("未着手")).toBeDefined();
      expect(screen.getByText("完了")).toBeDefined();
    });

    it("指示内容が表示される", () => {
      render(<CarePlanSection carePlan={mockCarePlan} admissionId={1} />);
      expect(screen.getByText("鎮痛剤の投与量を確認する")).toBeDefined();
      expect(screen.getByText("リスク薬剤の確認完了")).toBeDefined();
    });

    it("指示内容がnullの場合にハイフンが表示される", () => {
      render(<CarePlanSection carePlan={mockCarePlan} admissionId={1} />);
      // テーブル内にハイフンが含まれることを確認
      const table = screen.getByText("便秘管理").closest("table");
      expect(table?.textContent).toContain("-");
    });
  });

  describe("ケアプランがない場合", () => {
    it("ケアプラン未作成のメッセージが表示される", () => {
      render(<CarePlanSection carePlan={null} admissionId={1} />);
      expect(screen.getByText("ケアプランが作成されていません")).toBeDefined();
    });

    it("ケアプラン作成リンクが表示される", () => {
      render(<CarePlanSection carePlan={null} admissionId={1} />);
      const link = screen.getByText("ケアプラン作成");
      expect(link.closest("a")?.getAttribute("href")).toBe("/admissions/1/care-plan/new");
    });
  });
});
