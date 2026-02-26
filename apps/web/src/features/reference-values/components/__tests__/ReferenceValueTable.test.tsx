import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ReferenceValueTable } from "../ReferenceValueTable";
import type { ReferenceValueGroup } from "../../types";

const mockGroups: ReferenceValueGroup[] = [
  {
    itemCode: "WBC",
    itemName: "白血球数",
    unit: "10^3/uL",
    common: { id: 1, lowerLimit: "3.5", upperLimit: "9.5" },
    male: null,
    female: null,
  },
  {
    itemCode: "HGB",
    itemName: "ヘモグロビン",
    unit: "g/dL",
    common: null,
    male: { id: 2, lowerLimit: "13.0", upperLimit: "17.0" },
    female: { id: 3, lowerLimit: "12.0", upperLimit: "16.0" },
  },
  {
    itemCode: "CRP",
    itemName: "C反応性蛋白",
    unit: "mg/dL",
    common: { id: 4, lowerLimit: "0", upperLimit: "0.3" },
    male: null,
    female: null,
  },
];

describe("ReferenceValueTable", () => {
  describe("一覧表示", () => {
    it("テーブルヘッダーが正しく表示される", () => {
      render(<ReferenceValueTable groups={mockGroups} />);

      expect(screen.getByText("項目コード")).toBeInTheDocument();
      expect(screen.getByText("項目名")).toBeInTheDocument();
      expect(screen.getByText("単位")).toBeInTheDocument();
      expect(screen.getByText("共通基準値")).toBeInTheDocument();
      expect(screen.getByText("男性基準値")).toBeInTheDocument();
      expect(screen.getByText("女性基準値")).toBeInTheDocument();
      expect(screen.getByText("操作")).toBeInTheDocument();
    });

    it("基準値データが正しく表示される", () => {
      render(<ReferenceValueTable groups={mockGroups} />);

      // WBC行
      expect(screen.getByText("WBC")).toBeInTheDocument();
      expect(screen.getByText("白血球数")).toBeInTheDocument();
      expect(screen.getByText("10^3/uL")).toBeInTheDocument();
      expect(screen.getByText("3.5 - 9.5")).toBeInTheDocument();

      // HGB行
      expect(screen.getByText("HGB")).toBeInTheDocument();
      expect(screen.getByText("ヘモグロビン")).toBeInTheDocument();
      expect(screen.getByText("g/dL")).toBeInTheDocument();
      expect(screen.getByText("13.0 - 17.0")).toBeInTheDocument();
      expect(screen.getByText("12.0 - 16.0")).toBeInTheDocument();

      // CRP行
      expect(screen.getByText("CRP")).toBeInTheDocument();
      expect(screen.getByText("C反応性蛋白")).toBeInTheDocument();
      expect(screen.getByText("mg/dL")).toBeInTheDocument();
      expect(screen.getByText("0 - 0.3")).toBeInTheDocument();
    });

    it("共通基準値の編集ボタンが表示される", () => {
      render(<ReferenceValueTable groups={mockGroups} />);

      expect(
        screen.getByTestId("edit-common-WBC"),
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("edit-common-CRP"),
      ).toBeInTheDocument();
    });

    it("男性・女性別の編集ボタンが表示される", () => {
      render(<ReferenceValueTable groups={mockGroups} />);

      expect(
        screen.getByTestId("edit-male-HGB"),
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("edit-female-HGB"),
      ).toBeInTheDocument();
    });
  });

  describe("空データ", () => {
    it("データが空の場合にメッセージが表示される", () => {
      render(<ReferenceValueTable groups={[]} />);

      expect(
        screen.getByText("基準値データが登録されていません。"),
      ).toBeInTheDocument();
    });
  });

  describe("テーブル構造", () => {
    it("テーブルにdata-testidが設定されている", () => {
      render(<ReferenceValueTable groups={mockGroups} />);

      expect(
        screen.getByTestId("reference-value-table"),
      ).toBeInTheDocument();
    });

    it("各行にdata-testidが設定されている", () => {
      render(<ReferenceValueTable groups={mockGroups} />);

      expect(screen.getByTestId("row-WBC")).toBeInTheDocument();
      expect(screen.getByTestId("row-HGB")).toBeInTheDocument();
      expect(screen.getByTestId("row-CRP")).toBeInTheDocument();
    });
  });
});
