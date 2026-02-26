import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CareInfoSection } from "../CareInfoSection";
import type { CareInfoDisplay } from "../../../types";

const mockCareInfo: CareInfoDisplay = {
  painStatus: "IN_PROGRESS",
  constipationStatus: "NOT_STARTED",
  prescriptions: [
    {
      drugName: "ロキソプロフェン",
      prescriptionType: "ORAL",
      prescribedAt: "2026-02-25T09:00:00.000Z",
      isRiskDrug: false,
    },
    {
      drugName: "ハロペリドール",
      prescriptionType: "INJECTION",
      prescribedAt: "2026-02-25T10:00:00.000Z",
      isRiskDrug: true,
    },
  ],
  assessedAt: "2026-02-25T10:00:00.000Z",
};

describe("CareInfoSection", () => {
  describe("レンダリング", () => {
    it("ケア関連情報のタイトルが表示される", () => {
      render(<CareInfoSection careInfo={mockCareInfo} />);
      expect(screen.getByText("ケア関連情報")).toBeDefined();
    });

    it("痛みの状態が日本語で表示される", () => {
      render(<CareInfoSection careInfo={mockCareInfo} />);
      expect(screen.getByText("実施中")).toBeDefined();
    });

    it("便秘の状態が日本語で表示される", () => {
      render(<CareInfoSection careInfo={mockCareInfo} />);
      expect(screen.getByText("未着手")).toBeDefined();
    });

    it("処方薬剤名が表示される", () => {
      render(<CareInfoSection careInfo={mockCareInfo} />);
      expect(screen.getByText("ロキソプロフェン")).toBeDefined();
      expect(screen.getByText("ハロペリドール")).toBeDefined();
    });

    it("処方種別が日本語で表示される", () => {
      render(<CareInfoSection careInfo={mockCareInfo} />);
      expect(screen.getByText("内服")).toBeDefined();
      expect(screen.getByText("注射")).toBeDefined();
    });

    it("リスク薬剤のバッジが表示される", () => {
      render(<CareInfoSection careInfo={mockCareInfo} />);
      expect(screen.getByText("リスク薬")).toBeDefined();
    });
  });

  describe("データが欠損している場合", () => {
    it("痛みの状態がnullの場合にハイフンが表示される", () => {
      const careInfo = { ...mockCareInfo, painStatus: null };
      render(<CareInfoSection careInfo={careInfo} />);
      const painLabel = screen.getByText("痛みの状態");
      const row = painLabel.closest("div");
      expect(row?.textContent).toContain("-");
    });

    it("処方薬剤が空の場合にメッセージが表示される", () => {
      const careInfo = { ...mockCareInfo, prescriptions: [] };
      render(<CareInfoSection careInfo={careInfo} />);
      expect(screen.getByText("処方薬剤データがありません")).toBeDefined();
    });
  });
});
