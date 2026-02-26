import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PainConfirmationStep } from "../PainConfirmationStep";
import type { PainCarePlanDetails, PainMedicationInfo } from "../../types";

const emptyDetails: PainCarePlanDetails = {
  hasDaytimePain: null,
  hasNighttimeAwakening: null,
  selectedSiteIds: [],
  siteDetails: [],
  sleepImpact: null,
  mobilityImpact: null,
  toiletImpact: null,
};

describe("PainConfirmationStep", () => {
  it("タイトルが表示される", () => {
    render(<PainConfirmationStep details={emptyDetails} medications={[]} />);
    expect(screen.getByText("入力内容の確認")).toBeDefined();
  });

  it("処方なしと表示される", () => {
    render(<PainConfirmationStep details={emptyDetails} medications={[]} />);
    expect(screen.getByText("処方なし")).toBeDefined();
  });

  it("処方薬品名が表示される", () => {
    const medications: PainMedicationInfo[] = [
      {
        id: 1,
        drugName: "ロキソニン錠60mg",
        prescriptionType: "ORAL",
        prescribedAt: "2026-02-27T10:00:00.000Z",
      },
    ];
    render(<PainConfirmationStep details={emptyDetails} medications={medications} />);
    expect(screen.getByText("ロキソニン錠60mg")).toBeDefined();
  });

  it("日中の痛みの状況が表示される", () => {
    const details: PainCarePlanDetails = {
      ...emptyDetails,
      hasDaytimePain: true,
    };
    render(<PainConfirmationStep details={details} medications={[]} />);
    expect(screen.getByText("日中活動時の痛み")).toBeDefined();
  });

  it("未回答の場合に未回答バッジが表示される", () => {
    render(<PainConfirmationStep details={emptyDetails} medications={[]} />);
    const badges = screen.getAllByText("未回答");
    expect(badges.length).toBeGreaterThan(0);
  });

  it("部位選択なしと表示される", () => {
    render(<PainConfirmationStep details={emptyDetails} medications={[]} />);
    expect(screen.getByText("部位の選択なし")).toBeDefined();
  });

  it("選択された部位が表示される", () => {
    const details: PainCarePlanDetails = {
      ...emptyDetails,
      selectedSiteIds: ["HEAD", "LOWER_BACK"],
      siteDetails: [
        { siteId: "HEAD", touchPain: true, movementPain: false, numbness: false },
        { siteId: "LOWER_BACK", touchPain: false, movementPain: true, numbness: true },
      ],
    };
    render(<PainConfirmationStep details={details} medications={[]} />);
    expect(screen.getByText("頭部")).toBeDefined();
    expect(screen.getByText("腰部")).toBeDefined();
  });

  it("部位の詳細所見が表示される", () => {
    const details: PainCarePlanDetails = {
      ...emptyDetails,
      selectedSiteIds: ["HEAD"],
      siteDetails: [{ siteId: "HEAD", touchPain: true, movementPain: false, numbness: false }],
    };
    render(<PainConfirmationStep details={details} medications={[]} />);
    expect(screen.getByText(/触痛あり/)).toBeDefined();
  });

  it("生活影響セクションが表示される", () => {
    render(<PainConfirmationStep details={emptyDetails} medications={[]} />);
    expect(screen.getByText("生活への影響")).toBeDefined();
    expect(screen.getByText("睡眠への影響")).toBeDefined();
    expect(screen.getByText("動きへの影響")).toBeDefined();
    expect(screen.getByText("排泄への影響")).toBeDefined();
  });
});
