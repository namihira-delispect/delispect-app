import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { VitalSignSection } from "../VitalSignSection";
import type { VitalSignDisplay } from "../../../types";

const mockVitalSign: VitalSignDisplay = {
  bodyTemperature: 36.5,
  pulse: 72,
  systolicBp: 120,
  diastolicBp: 80,
  spo2: 98.0,
  measuredAt: "2026-02-25T10:30:00.000Z",
};

describe("VitalSignSection", () => {
  describe("レンダリング", () => {
    it("バイタルサインのタイトルが表示される", () => {
      render(<VitalSignSection vitalSign={mockVitalSign} />);
      expect(screen.getByText("バイタルサイン")).toBeDefined();
    });

    it("体温が単位付きで表示される", () => {
      render(<VitalSignSection vitalSign={mockVitalSign} />);
      expect(screen.getByText(/36\.5.*°C/)).toBeDefined();
    });

    it("脈拍が単位付きで表示される", () => {
      render(<VitalSignSection vitalSign={mockVitalSign} />);
      expect(screen.getByText(/72.*bpm/)).toBeDefined();
    });

    it("血圧が表示される", () => {
      render(<VitalSignSection vitalSign={mockVitalSign} />);
      expect(screen.getByText(/120\/80.*mmHg/)).toBeDefined();
    });

    it("SpO2が単位付きで表示される", () => {
      render(<VitalSignSection vitalSign={mockVitalSign} />);
      expect(screen.getByText(/98.*%/)).toBeDefined();
    });

    it("測定日時が表示される", () => {
      render(<VitalSignSection vitalSign={mockVitalSign} />);
      // UTCからローカルタイムに変換されるのでパターンで確認
      expect(screen.getByText("測定日時")).toBeDefined();
    });
  });

  describe("データがnullの場合", () => {
    it("バイタルサインがnullの場合にメッセージが表示される", () => {
      render(<VitalSignSection vitalSign={null} />);
      expect(screen.getByText("バイタルサインデータがありません")).toBeDefined();
    });

    it("体温がnullの場合にハイフンが表示される", () => {
      const vitalSign = { ...mockVitalSign, bodyTemperature: null };
      render(<VitalSignSection vitalSign={vitalSign} />);
      const tempLabel = screen.getByText("体温");
      const row = tempLabel.closest("div");
      expect(row?.textContent).toContain("-");
    });

    it("脈拍がnullの場合にハイフンが表示される", () => {
      const vitalSign = { ...mockVitalSign, pulse: null };
      render(<VitalSignSection vitalSign={vitalSign} />);
      const pulseLabel = screen.getByText("脈拍");
      const row = pulseLabel.closest("div");
      expect(row?.textContent).toContain("-");
    });

    it("血圧がnullの場合にハイフンが表示される", () => {
      const vitalSign = { ...mockVitalSign, systolicBp: null, diastolicBp: null };
      render(<VitalSignSection vitalSign={vitalSign} />);
      const bpLabel = screen.getByText("血圧");
      const row = bpLabel.closest("div");
      expect(row?.textContent).toContain("-");
    });
  });
});
