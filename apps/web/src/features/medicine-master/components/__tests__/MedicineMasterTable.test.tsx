import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MedicineMasterTable } from "../MedicineMasterTable";
import type { MedicineMasterItem } from "../../types";

const mockItems: MedicineMasterItem[] = [
  {
    id: 1,
    categoryId: 1,
    medicinesCode: "YJ12345",
    riskFactorFlg: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    medicineNameSettings: [{ id: 1, hospitalCode: "H001", displayName: "アセタゾラミド錠" }],
  },
  {
    id: 2,
    categoryId: 2,
    medicinesCode: "YJ67890",
    riskFactorFlg: false,
    createdAt: "2024-01-02T00:00:00.000Z",
    updatedAt: "2024-01-02T00:00:00.000Z",
    medicineNameSettings: [{ id: 2, hospitalCode: "H001", displayName: "ロラゼパム錠" }],
  },
];

describe("MedicineMasterTable", () => {
  describe("一覧表示", () => {
    it("薬剤マスタの一覧をテーブル形式で表示する", () => {
      const onEdit = vi.fn();
      const onDelete = vi.fn();

      render(<MedicineMasterTable items={mockItems} onEdit={onEdit} onDelete={onDelete} />);

      expect(screen.getByText("YJ12345")).toBeDefined();
      expect(screen.getByText("YJ67890")).toBeDefined();
      expect(screen.getByText("アセタゾラミド錠")).toBeDefined();
      expect(screen.getByText("ロラゼパム錠")).toBeDefined();
    });

    it("リスク要因フラグの状態をバッジで表示する", () => {
      render(<MedicineMasterTable items={mockItems} onEdit={vi.fn()} onDelete={vi.fn()} />);

      expect(screen.getByText("あり")).toBeDefined();
      expect(screen.getByText("なし")).toBeDefined();
    });

    it("テーブルヘッダーが正しく表示される", () => {
      render(<MedicineMasterTable items={mockItems} onEdit={vi.fn()} onDelete={vi.fn()} />);

      expect(screen.getByText("薬剤コード")).toBeDefined();
      expect(screen.getByText("カテゴリID")).toBeDefined();
      expect(screen.getByText("表示名")).toBeDefined();
      expect(screen.getByText("リスク要因")).toBeDefined();
      expect(screen.getByText("病院コード")).toBeDefined();
      expect(screen.getByText("操作")).toBeDefined();
    });
  });

  describe("データが空の場合", () => {
    it("空メッセージを表示する", () => {
      render(<MedicineMasterTable items={[]} onEdit={vi.fn()} onDelete={vi.fn()} />);

      expect(screen.getByText("薬剤マスタが登録されていません。")).toBeDefined();
    });
  });

  describe("操作ボタン", () => {
    it("編集ボタンクリックでonEditが呼ばれる", () => {
      const onEdit = vi.fn();
      const onDelete = vi.fn();

      render(<MedicineMasterTable items={mockItems} onEdit={onEdit} onDelete={onDelete} />);

      const editButtons = screen.getAllByText("編集");
      fireEvent.click(editButtons[0]);

      expect(onEdit).toHaveBeenCalledWith(mockItems[0]);
    });

    it("削除ボタンクリックでonDeleteが呼ばれる", () => {
      const onEdit = vi.fn();
      const onDelete = vi.fn();

      render(<MedicineMasterTable items={mockItems} onEdit={onEdit} onDelete={onDelete} />);

      const deleteButtons = screen.getAllByText("削除");
      fireEvent.click(deleteButtons[0]);

      expect(onDelete).toHaveBeenCalledWith(mockItems[0]);
    });
  });

  describe("薬剤名設定がない場合", () => {
    it("表示名と病院コードにハイフンを表示する", () => {
      const itemsWithoutNameSettings: MedicineMasterItem[] = [
        {
          id: 3,
          categoryId: 1,
          medicinesCode: "YJ99999",
          riskFactorFlg: false,
          createdAt: "2024-01-03T00:00:00.000Z",
          updatedAt: "2024-01-03T00:00:00.000Z",
          medicineNameSettings: [],
        },
      ];

      render(
        <MedicineMasterTable
          items={itemsWithoutNameSettings}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
        />,
      );

      const dashes = screen.getAllByText("-");
      expect(dashes.length).toBe(2);
    });
  });
});
