import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MedicineMasterForm } from "../MedicineMasterForm";
import type { MedicineMasterItem } from "../../types";

const mockEditTarget: MedicineMasterItem = {
  id: 1,
  categoryId: 1,
  medicinesCode: "YJ12345",
  riskFactorFlg: true,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
  medicineNameSettings: [{ id: 1, hospitalCode: "H001", displayName: "アセタゾラミド錠" }],
};

describe("MedicineMasterForm", () => {
  describe("新規登録モード", () => {
    it("新規登録のタイトルが表示される", () => {
      render(<MedicineMasterForm editTarget={null} onSave={vi.fn()} onCancel={vi.fn()} />);

      expect(screen.getByText("薬剤マスタ新規登録")).toBeDefined();
    });

    it("入力フィールドが空で表示される", () => {
      render(<MedicineMasterForm editTarget={null} onSave={vi.fn()} onCancel={vi.fn()} />);

      const codeInput = screen.getByLabelText("薬剤コード") as HTMLInputElement;
      expect(codeInput.value).toBe("");
    });

    it("登録ボタンが表示される", () => {
      render(<MedicineMasterForm editTarget={null} onSave={vi.fn()} onCancel={vi.fn()} />);

      expect(screen.getByText("登録")).toBeDefined();
    });
  });

  describe("編集モード", () => {
    it("編集のタイトルが表示される", () => {
      render(
        <MedicineMasterForm editTarget={mockEditTarget} onSave={vi.fn()} onCancel={vi.fn()} />,
      );

      expect(screen.getByText("薬剤マスタ編集")).toBeDefined();
    });

    it("既存の値がフォームに表示される", () => {
      render(
        <MedicineMasterForm editTarget={mockEditTarget} onSave={vi.fn()} onCancel={vi.fn()} />,
      );

      const codeInput = screen.getByLabelText("薬剤コード") as HTMLInputElement;
      expect(codeInput.value).toBe("YJ12345");

      const nameInput = screen.getByLabelText("表示名") as HTMLInputElement;
      expect(nameInput.value).toBe("アセタゾラミド錠");

      const hospitalInput = screen.getByLabelText("病院コード") as HTMLInputElement;
      expect(hospitalInput.value).toBe("H001");

      const riskCheckbox = screen.getByLabelText("リスク要因フラグ") as HTMLInputElement;
      expect(riskCheckbox.checked).toBe(true);
    });

    it("更新ボタンが表示される", () => {
      render(
        <MedicineMasterForm editTarget={mockEditTarget} onSave={vi.fn()} onCancel={vi.fn()} />,
      );

      expect(screen.getByText("更新")).toBeDefined();
    });
  });

  describe("バリデーション", () => {
    it("空のフォーム送信でバリデーションエラーを表示する", async () => {
      const onSave = vi.fn();

      render(<MedicineMasterForm editTarget={null} onSave={onSave} onCancel={vi.fn()} />);

      const submitButton = screen.getByText("登録");
      fireEvent.click(submitButton);

      // バリデーションエラーが表示されるまで待つ
      expect(await screen.findByText("薬剤コードを入力してください")).toBeDefined();
      expect(onSave).not.toHaveBeenCalled();
    });
  });

  describe("キャンセル", () => {
    it("キャンセルボタンクリックでonCancelが呼ばれる", () => {
      const onCancel = vi.fn();

      render(<MedicineMasterForm editTarget={null} onSave={vi.fn()} onCancel={onCancel} />);

      const cancelButton = screen.getByText("キャンセル");
      fireEvent.click(cancelButton);

      expect(onCancel).toHaveBeenCalled();
    });
  });

  describe("保存中", () => {
    it("isSavingがtrueの場合にボタンが無効化される", () => {
      render(
        <MedicineMasterForm
          editTarget={null}
          onSave={vi.fn()}
          onCancel={vi.fn()}
          isSaving={true}
        />,
      );

      expect(screen.getByText("保存中...")).toBeDefined();
      const saveButton = screen.getByText("保存中...") as HTMLButtonElement;
      expect(saveButton.disabled).toBe(true);
    });
  });

  describe("サーバーエラー", () => {
    it("serverErrorが設定されている場合にエラーメッセージを表示する", () => {
      render(
        <MedicineMasterForm
          editTarget={null}
          onSave={vi.fn()}
          onCancel={vi.fn()}
          serverError="この薬剤コードは既に登録されています"
        />,
      );

      expect(screen.getByText("この薬剤コードは既に登録されています")).toBeDefined();
    });
  });
});
