import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DataMappingForm } from "../DataMappingForm";

describe("DataMappingForm", () => {
  const defaultProps = {
    mappingType: "LAB_ITEM" as const,
    targetCode: "WBC",
    targetLabel: "白血球数 (WBC)",
    editTarget: null,
    onSave: vi.fn(),
    onCancel: vi.fn(),
    isSaving: false,
    serverError: "",
  };

  describe("新規設定フォーム", () => {
    it("フォームタイトルが「マッピング設定」と表示される", () => {
      render(<DataMappingForm {...defaultProps} />);
      expect(screen.getByText("マッピング設定")).toBeDefined();
    });

    it("システム項目が読み取り専用で表示される", () => {
      render(<DataMappingForm {...defaultProps} />);
      const systemItemInput = screen.getByDisplayValue("白血球数 (WBC) (WBC)");
      expect(systemItemInput).toBeDefined();
      expect((systemItemInput as HTMLInputElement).readOnly).toBe(true);
    });

    it("病院側コード入力フィールドが表示される", () => {
      render(<DataMappingForm {...defaultProps} />);
      expect(screen.getByLabelText("病院側コード")).toBeDefined();
    });

    it("優先順位入力フィールドが表示される", () => {
      render(<DataMappingForm {...defaultProps} />);
      expect(screen.getByLabelText("優先順位")).toBeDefined();
    });

    it("保存ボタンが表示される", () => {
      render(<DataMappingForm {...defaultProps} />);
      expect(screen.getByText("保存")).toBeDefined();
    });

    it("キャンセルボタンが表示される", () => {
      render(<DataMappingForm {...defaultProps} />);
      expect(screen.getByText("キャンセル")).toBeDefined();
    });
  });

  describe("編集フォーム", () => {
    const editTarget = {
      id: 1,
      mappingType: "LAB_ITEM" as const,
      sourceCode: "LAB-WBC-001",
      targetCode: "WBC",
      priority: 5,
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    };

    it("フォームタイトルが「マッピング編集」と表示される", () => {
      render(<DataMappingForm {...defaultProps} editTarget={editTarget} />);
      expect(screen.getByText("マッピング編集")).toBeDefined();
    });

    it("既存の病院側コードが入力済みで表示される", () => {
      render(<DataMappingForm {...defaultProps} editTarget={editTarget} />);
      expect(screen.getByDisplayValue("LAB-WBC-001")).toBeDefined();
    });

    it("既存の優先順位が入力済みで表示される", () => {
      render(<DataMappingForm {...defaultProps} editTarget={editTarget} />);
      expect(screen.getByDisplayValue("5")).toBeDefined();
    });
  });

  describe("バリデーション", () => {
    it("病院側コードが空の場合にエラーメッセージを表示する", () => {
      render(<DataMappingForm {...defaultProps} />);

      fireEvent.click(screen.getByText("保存"));

      expect(screen.getByText("病院側コードを入力してください")).toBeDefined();
    });
  });

  describe("保存処理", () => {
    it("保存中はボタンが「保存中...」と表示される", () => {
      render(<DataMappingForm {...defaultProps} isSaving={true} />);
      expect(screen.getByText("保存中...")).toBeDefined();
    });

    it("保存中はボタンが無効化される", () => {
      render(<DataMappingForm {...defaultProps} isSaving={true} />);
      const button = screen.getByText("保存中...");
      expect((button as HTMLButtonElement).disabled).toBe(true);
    });
  });

  describe("サーバーエラー", () => {
    it("サーバーエラーメッセージを表示する", () => {
      render(
        <DataMappingForm
          {...defaultProps}
          serverError="重複するマッピングが存在します"
        />,
      );
      expect(screen.getByText("重複するマッピングが存在します")).toBeDefined();
    });
  });

  describe("キャンセル操作", () => {
    it("キャンセルボタンクリックでonCancelが呼ばれる", () => {
      const onCancel = vi.fn();
      render(<DataMappingForm {...defaultProps} onCancel={onCancel} />);

      fireEvent.click(screen.getByText("キャンセル"));
      expect(onCancel).toHaveBeenCalledTimes(1);
    });
  });
});
