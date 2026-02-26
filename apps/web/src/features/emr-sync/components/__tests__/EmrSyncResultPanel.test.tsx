import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EmrSyncResultPanel } from "../EmrSyncResultPanel";
import type { EmrSyncResult } from "../../types";

describe("EmrSyncResultPanel", () => {
  const successResult: EmrSyncResult = {
    totalAdmissions: 7,
    successCount: 7,
    failedCount: 0,
    failedAdmissionIds: [],
    vitalSignCount: 30,
    labResultCount: 90,
    prescriptionCount: 15,
    startedAt: "2026-01-15T10:00:00.000Z",
    completedAt: "2026-01-15T10:01:00.000Z",
  };

  const partialFailureResult: EmrSyncResult = {
    totalAdmissions: 5,
    successCount: 3,
    failedCount: 2,
    failedAdmissionIds: ["ADM-20260115-001", "ADM-20260115-002"],
    vitalSignCount: 18,
    labResultCount: 54,
    prescriptionCount: 9,
    startedAt: "2026-01-15T10:00:00.000Z",
    completedAt: "2026-01-15T10:01:00.000Z",
  };

  describe("全件成功の場合", () => {
    it("同期完了メッセージを表示する", () => {
      render(<EmrSyncResultPanel result={successResult} />);
      expect(screen.getByText("同期完了")).toBeDefined();
    });

    it("処理入院数ラベルを表示する", () => {
      render(<EmrSyncResultPanel result={successResult} />);
      expect(screen.getByText("処理入院数")).toBeDefined();
    });

    it("バイタルサイン件数を表示する", () => {
      render(<EmrSyncResultPanel result={successResult} />);
      expect(screen.getByText("30件")).toBeDefined();
    });

    it("検査値件数を表示する", () => {
      render(<EmrSyncResultPanel result={successResult} />);
      expect(screen.getByText("90件")).toBeDefined();
    });

    it("処方件数を表示する", () => {
      render(<EmrSyncResultPanel result={successResult} />);
      expect(screen.getByText("15件")).toBeDefined();
    });

    it("失敗した入院ID一覧を表示しない", () => {
      render(<EmrSyncResultPanel result={successResult} />);
      expect(screen.queryByText("失敗した入院ID一覧")).toBeNull();
    });
  });

  describe("一部失敗がある場合", () => {
    it("一部失敗ありのメッセージを表示する", () => {
      render(<EmrSyncResultPanel result={partialFailureResult} />);
      expect(screen.getByText("同期完了（一部失敗あり）")).toBeDefined();
    });

    it("失敗した入院ID一覧を表示する", () => {
      render(<EmrSyncResultPanel result={partialFailureResult} />);
      expect(screen.getByText("失敗した入院ID一覧")).toBeDefined();
    });

    it("失敗した入院IDを個別に表示する", () => {
      render(<EmrSyncResultPanel result={partialFailureResult} />);
      expect(screen.getByText("ADM-20260115-001")).toBeDefined();
      expect(screen.getByText("ADM-20260115-002")).toBeDefined();
    });

    it("成功ラベルを表示する", () => {
      render(<EmrSyncResultPanel result={partialFailureResult} />);
      expect(screen.getByText("成功")).toBeDefined();
    });

    it("失敗ラベルを表示する", () => {
      render(<EmrSyncResultPanel result={partialFailureResult} />);
      expect(screen.getByText("失敗")).toBeDefined();
    });
  });

  describe("アクセシビリティ", () => {
    it("status roleが設定されている", () => {
      render(<EmrSyncResultPanel result={successResult} />);
      expect(screen.getByRole("status")).toBeDefined();
    });
  });
});
