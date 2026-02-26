import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BasicInfoSection } from "../BasicInfoSection";
import type { AdmissionDetailResponse } from "../../../types";

const mockDetail: AdmissionDetailResponse = {
  admissionId: 1,
  version: 0,
  patientId: "P001",
  patientInternalId: 1,
  patientName: "田中 太郎",
  patientNameKana: "タナカ タロウ",
  age: 75,
  gender: "MALE",
  admissionDate: "2026-02-25",
  dischargeDate: null,
  ward: "3A病棟",
  room: "301",
  attendingDoctor: "山田医師",
  latestVitalSign: null,
  labResults: [],
  careInfo: {
    painStatus: null,
    constipationStatus: null,
    prescriptions: [],
    assessedAt: null,
  },
  riskAssessments: [],
  carePlan: null,
  isHighRisk: true,
};

describe("BasicInfoSection", () => {
  describe("レンダリング", () => {
    it("基本情報のタイトルが表示される", () => {
      render(<BasicInfoSection detail={mockDetail} />);
      expect(screen.getByText("基本情報")).toBeDefined();
    });

    it("患者IDが表示される", () => {
      render(<BasicInfoSection detail={mockDetail} />);
      expect(screen.getByText("P001")).toBeDefined();
    });

    it("患者氏名が表示される", () => {
      render(<BasicInfoSection detail={mockDetail} />);
      expect(screen.getByText("田中 太郎")).toBeDefined();
    });

    it("フリガナが表示される", () => {
      render(<BasicInfoSection detail={mockDetail} />);
      expect(screen.getByText("(タナカ タロウ)")).toBeDefined();
    });

    it("年齢が表示される", () => {
      render(<BasicInfoSection detail={mockDetail} />);
      expect(screen.getByText("75歳")).toBeDefined();
    });

    it("性別が日本語で表示される", () => {
      render(<BasicInfoSection detail={mockDetail} />);
      expect(screen.getByText("男")).toBeDefined();
    });

    it("入院日がYYYY/MM/DD形式で表示される", () => {
      render(<BasicInfoSection detail={mockDetail} />);
      expect(screen.getByText("2026/02/25")).toBeDefined();
    });

    it("病棟が表示される", () => {
      render(<BasicInfoSection detail={mockDetail} />);
      expect(screen.getByText("3A病棟")).toBeDefined();
    });

    it("病室が表示される", () => {
      render(<BasicInfoSection detail={mockDetail} />);
      expect(screen.getByText("301")).toBeDefined();
    });

    it("主治医が表示される", () => {
      render(<BasicInfoSection detail={mockDetail} />);
      expect(screen.getByText("山田医師")).toBeDefined();
    });
  });

  describe("データが欠損している場合", () => {
    it("年齢がnullの場合にハイフンが表示される", () => {
      const detail = { ...mockDetail, age: null };
      render(<BasicInfoSection detail={detail} />);
      // 年齢の行のハイフンを探す
      const ageLabel = screen.getByText("年齢");
      const ageRow = ageLabel.closest("div");
      expect(ageRow?.textContent).toContain("-");
    });

    it("病棟がnullの場合にハイフンが表示される", () => {
      const detail = { ...mockDetail, ward: null };
      render(<BasicInfoSection detail={detail} />);
      const wardLabel = screen.getByText("病棟");
      const wardRow = wardLabel.closest("div");
      expect(wardRow?.textContent).toContain("-");
    });

    it("退院日がある場合に表示される", () => {
      const detail = { ...mockDetail, dischargeDate: "2026-03-01" };
      render(<BasicInfoSection detail={detail} />);
      expect(screen.getByText("退院日")).toBeDefined();
      expect(screen.getByText("2026/03/01")).toBeDefined();
    });

    it("フリガナがnullの場合に表示されない", () => {
      const detail = { ...mockDetail, patientNameKana: null };
      render(<BasicInfoSection detail={detail} />);
      expect(screen.queryByText(/タナカ/)).toBeNull();
    });
  });
});
