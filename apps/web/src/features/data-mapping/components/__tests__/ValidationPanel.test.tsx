import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ValidationPanel } from "../ValidationPanel";
import type { MappingValidationResult } from "../../types";

describe("ValidationPanel", () => {
  describe("初期状態", () => {
    it("検証実行ボタンを表示する", () => {
      render(
        <ValidationPanel result={null} isLoading={false} onValidate={vi.fn()} />,
      );

      expect(screen.getByText("検証実行")).toBeDefined();
    });

    it("未検証時に案内メッセージを表示する", () => {
      render(
        <ValidationPanel result={null} isLoading={false} onValidate={vi.fn()} />,
      );

      expect(
        screen.getByText("「検証実行」をクリックしてマッピングの完全性を確認してください。"),
      ).toBeDefined();
    });
  });

  describe("検証ボタンの動作", () => {
    it("検証実行ボタンクリックでonValidateが呼ばれる", () => {
      const onValidate = vi.fn();
      render(
        <ValidationPanel result={null} isLoading={false} onValidate={onValidate} />,
      );

      fireEvent.click(screen.getByText("検証実行"));
      expect(onValidate).toHaveBeenCalledTimes(1);
    });

    it("ローディング中はボタンが無効化される", () => {
      render(
        <ValidationPanel result={null} isLoading={true} onValidate={vi.fn()} />,
      );

      const button = screen.getByText("検証中...");
      expect(button).toBeDefined();
      expect((button as HTMLButtonElement).disabled).toBe(true);
    });
  });

  describe("検証成功の場合", () => {
    const successResult: MappingValidationResult = {
      isValid: true,
      totalRequired: 25,
      mappedCount: 25,
      unmappedItems: [],
    };

    it("成功メッセージを表示する", () => {
      render(
        <ValidationPanel result={successResult} isLoading={false} onValidate={vi.fn()} />,
      );

      expect(
        screen.getByText(
          "すべての必須項目がマッピング済みです。電子カルテ同期を実行できます。",
        ),
      ).toBeDefined();
    });

    it("設定済み項目数を表示する", () => {
      render(
        <ValidationPanel result={successResult} isLoading={false} onValidate={vi.fn()} />,
      );

      expect(screen.getByText("設定済: 25 / 25 項目")).toBeDefined();
    });
  });

  describe("検証失敗の場合（未設定項目あり）", () => {
    const failureResult: MappingValidationResult = {
      isValid: false,
      totalRequired: 25,
      mappedCount: 20,
      unmappedItems: [
        { code: "CA", label: "カルシウム (Ca)", category: "生化学" },
        { code: "GLU", label: "血糖 (GLU)", category: "生化学" },
        { code: "SPO2", label: "SpO2", category: "バイタルサイン" },
        { code: "RESPIRATORY_RATE", label: "呼吸数", category: "バイタルサイン" },
        { code: "WARD", label: "病棟", category: "入院情報" },
      ],
    };

    it("未設定項目の件数を表示する", () => {
      render(
        <ValidationPanel result={failureResult} isLoading={false} onValidate={vi.fn()} />,
      );

      expect(screen.getByText("未設定の項目があります（5件）")).toBeDefined();
    });

    it("未設定項目の一覧を表示する", () => {
      render(
        <ValidationPanel result={failureResult} isLoading={false} onValidate={vi.fn()} />,
      );

      expect(screen.getByText("[生化学] カルシウム (Ca)")).toBeDefined();
      expect(screen.getByText("[バイタルサイン] SpO2")).toBeDefined();
      expect(screen.getByText("[入院情報] 病棟")).toBeDefined();
    });

    it("設定済み項目数を表示する", () => {
      render(
        <ValidationPanel result={failureResult} isLoading={false} onValidate={vi.fn()} />,
      );

      expect(screen.getByText("設定済: 20 / 25 項目")).toBeDefined();
    });
  });
});
