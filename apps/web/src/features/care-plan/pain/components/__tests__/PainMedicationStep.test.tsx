import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PainMedicationStep } from "../PainMedicationStep";
import type { PainMedicationInfo } from "../../types";

describe("PainMedicationStep", () => {
  it("処方がない場合にメッセージが表示される", () => {
    render(<PainMedicationStep medications={[]} />);
    expect(screen.getByText("現在、痛み止めの処方はありません")).toBeDefined();
  });

  it("処方がある場合に薬品名が表示される", () => {
    const medications: PainMedicationInfo[] = [
      {
        id: 1,
        drugName: "ロキソニン錠60mg",
        prescriptionType: "ORAL",
        prescribedAt: "2026-02-27T10:00:00.000Z",
      },
    ];
    render(<PainMedicationStep medications={medications} />);
    expect(screen.getByText("ロキソニン錠60mg")).toBeDefined();
  });

  it("複数の処方が表示される", () => {
    const medications: PainMedicationInfo[] = [
      {
        id: 1,
        drugName: "ロキソニン錠60mg",
        prescriptionType: "ORAL",
        prescribedAt: "2026-02-27T10:00:00.000Z",
      },
      {
        id: 2,
        drugName: "カロナール錠500mg",
        prescriptionType: "ORAL",
        prescribedAt: "2026-02-26T10:00:00.000Z",
      },
    ];
    render(<PainMedicationStep medications={medications} />);
    expect(screen.getByText("ロキソニン錠60mg")).toBeDefined();
    expect(screen.getByText("カロナール錠500mg")).toBeDefined();
  });

  it("処方種別が日本語で表示される", () => {
    const medications: PainMedicationInfo[] = [
      {
        id: 1,
        drugName: "テスト薬",
        prescriptionType: "ORAL",
        prescribedAt: "2026-02-27T10:00:00.000Z",
      },
    ];
    render(<PainMedicationStep medications={medications} />);
    expect(screen.getByText("内服")).toBeDefined();
  });

  it("タイトルが表示される", () => {
    render(<PainMedicationStep medications={[]} />);
    expect(screen.getByText("痛み止めの処方状況")).toBeDefined();
  });
});
