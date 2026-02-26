import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LabResultSection } from "../LabResultSection";
import type { LabResultDisplay } from "../../../types";

const mockLabResults: LabResultDisplay[] = [
  {
    itemCode: "CRP",
    itemName: "CRP",
    value: 0.5,
    measuredAt: "2026-02-25T08:00:00.000Z",
  },
  {
    itemCode: "WBC",
    itemName: "WBC",
    value: 6500,
    measuredAt: "2026-02-25T08:00:00.000Z",
  },
  {
    itemCode: "HCT",
    itemName: "Ht",
    value: 42.5,
    measuredAt: "2026-02-25T08:00:00.000Z",
  },
  {
    itemCode: "HGB",
    itemName: "Hb",
    value: 14.2,
    measuredAt: "2026-02-25T08:00:00.000Z",
  },
];

describe("LabResultSection", () => {
  describe("レンダリング", () => {
    it("採血結果のタイトルが表示される", () => {
      render(<LabResultSection labResults={mockLabResults} />);
      expect(screen.getByText("採血結果")).toBeDefined();
    });

    it("テーブルヘッダーが表示される", () => {
      render(<LabResultSection labResults={mockLabResults} />);
      expect(screen.getByText("項目")).toBeDefined();
      expect(screen.getByText("値")).toBeDefined();
      expect(screen.getByText("取得日時")).toBeDefined();
    });

    it("CRPの値が表示される", () => {
      render(<LabResultSection labResults={mockLabResults} />);
      expect(screen.getByText("0.5")).toBeDefined();
    });

    it("WBCの値が表示される", () => {
      render(<LabResultSection labResults={mockLabResults} />);
      expect(screen.getByText("6500")).toBeDefined();
    });

    it("Htの項目名が表示される", () => {
      render(<LabResultSection labResults={mockLabResults} />);
      expect(screen.getByText("Ht")).toBeDefined();
    });

    it("Hbの項目名が表示される", () => {
      render(<LabResultSection labResults={mockLabResults} />);
      expect(screen.getByText("Hb")).toBeDefined();
    });
  });

  describe("データが空の場合", () => {
    it("採血結果がない場合にメッセージが表示される", () => {
      render(<LabResultSection labResults={[]} />);
      expect(screen.getByText("採血結果データがありません")).toBeDefined();
    });
  });
});
