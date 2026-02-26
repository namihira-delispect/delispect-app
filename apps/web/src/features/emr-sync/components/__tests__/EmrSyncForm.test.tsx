import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { EmrSyncForm } from "../EmrSyncForm";

// Server Actionのモック
vi.mock("../../server-actions/executeEmrSync", () => ({
  executeManualImport: vi.fn(),
}));

describe("EmrSyncForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("初期表示", () => {
    it("手動インポートの見出しが表示される", () => {
      render(<EmrSyncForm />);
      expect(screen.getByText("手動インポート")).toBeDefined();
    });

    it("入院日（開始）ラベルが表示される", () => {
      render(<EmrSyncForm />);
      expect(screen.getByLabelText("入院日（開始）")).toBeDefined();
    });

    it("入院日（終了）ラベルが表示される", () => {
      render(<EmrSyncForm />);
      expect(screen.getByLabelText("入院日（終了）")).toBeDefined();
    });

    it("電子カルテ同期ボタンが表示される", () => {
      render(<EmrSyncForm />);
      expect(screen.getByText("電子カルテ同期")).toBeDefined();
    });

    it("日付範囲のヒントが表示される", () => {
      render(<EmrSyncForm />);
      expect(screen.getByText("指定可能な範囲は最大7日間です。")).toBeDefined();
    });

    it("開始日と終了日の入力フィールドがdate型である", () => {
      render(<EmrSyncForm />);
      const startInput = screen.getByLabelText("入院日（開始）") as HTMLInputElement;
      const endInput = screen.getByLabelText("入院日（終了）") as HTMLInputElement;
      expect(startInput.type).toBe("date");
      expect(endInput.type).toBe("date");
    });
  });

  describe("フォーム制御", () => {
    it("同期ボタンが有効状態で表示される", () => {
      render(<EmrSyncForm />);
      const button = screen.getByText("電子カルテ同期") as HTMLButtonElement;
      expect(button.disabled).toBe(false);
    });
  });
});
