import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SystemSettingsForm } from "../SystemSettingsForm";

// Server Actionsのモック
vi.mock("../../server-actions/updateSystemSettingsAction", () => ({
  updateSystemSettingsAction: vi.fn(),
}));

describe("SystemSettingsForm", () => {
  const mockSettings = {
    batchImportTime: "06:00",
    batchImportDateRangeDays: 2,
  };

  describe("レンダリング", () => {
    it("バッチインポート設定の見出しが表示される", () => {
      render(<SystemSettingsForm initialSettings={mockSettings} />);
      expect(screen.getByText("バッチインポート設定")).toBeInTheDocument();
    });

    it("バッチインポート実行時刻の入力フィールドが表示される", () => {
      render(<SystemSettingsForm initialSettings={mockSettings} />);
      const input = screen.getByLabelText("バッチインポート実行時刻");
      expect(input).toBeInTheDocument();
      expect(input).toHaveValue("06:00");
    });

    it("対象入院日付範囲の入力フィールドが表示される", () => {
      render(<SystemSettingsForm initialSettings={mockSettings} />);
      const input = screen.getByLabelText("対象入院日付範囲（日数）");
      expect(input).toBeInTheDocument();
      expect(input).toHaveValue(2);
    });

    it("保存ボタンが表示される", () => {
      render(<SystemSettingsForm initialSettings={mockSettings} />);
      expect(screen.getByTestId("system-settings-submit")).toBeInTheDocument();
      expect(screen.getByTestId("system-settings-submit")).toHaveTextContent(
        "設定を保存",
      );
    });

    it("バッチインポート実行時刻のヘルプテキストが表示される", () => {
      render(<SystemSettingsForm initialSettings={mockSettings} />);
      expect(
        screen.getByText("日次バッチインポートを実行する時刻を設定します。"),
      ).toBeInTheDocument();
    });

    it("対象入院日付範囲のヘルプテキストが表示される", () => {
      render(<SystemSettingsForm initialSettings={mockSettings} />);
      expect(
        screen.getByText(
          /実行日から何日前までの入院データを取り込み対象とするか設定します/,
        ),
      ).toBeInTheDocument();
    });

    it("初期設定値が入力フィールドに表示される", () => {
      const customSettings = {
        batchImportTime: "08:30",
        batchImportDateRangeDays: 5,
      };
      render(<SystemSettingsForm initialSettings={customSettings} />);
      expect(screen.getByLabelText("バッチインポート実行時刻")).toHaveValue(
        "08:30",
      );
      expect(screen.getByLabelText("対象入院日付範囲（日数）")).toHaveValue(5);
    });
  });
});
