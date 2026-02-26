import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MappingTable } from "../MappingTable";
import type { MappingStatusItem, DataMappingItem } from "../../types";

const mockMapping: DataMappingItem = {
  id: 1,
  mappingType: "LAB_ITEM",
  sourceCode: "LAB-WBC-001",
  targetCode: "WBC",
  priority: 0,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

const mockItems: MappingStatusItem[] = [
  {
    code: "WBC",
    label: "白血球数 (WBC)",
    category: "CBC",
    status: "mapped",
    mapping: mockMapping,
  },
  {
    code: "RBC",
    label: "赤血球数 (RBC)",
    category: "CBC",
    status: "unmapped",
    mapping: null,
  },
  {
    code: "AST",
    label: "AST (GOT)",
    category: "生化学",
    status: "unmapped",
    mapping: null,
  },
];

describe("MappingTable", () => {
  describe("一覧表示", () => {
    it("マッピング状態付きの項目一覧をテーブル形式で表示する", () => {
      render(<MappingTable items={mockItems} onEdit={vi.fn()} onDelete={vi.fn()} />);

      expect(screen.getByText("白血球数 (WBC)")).toBeDefined();
      expect(screen.getByText("赤血球数 (RBC)")).toBeDefined();
      expect(screen.getByText("AST (GOT)")).toBeDefined();
    });

    it("テーブルヘッダーが正しく表示される", () => {
      render(<MappingTable items={mockItems} onEdit={vi.fn()} onDelete={vi.fn()} />);

      expect(screen.getByText("システム項目")).toBeDefined();
      expect(screen.getByText("病院側コード")).toBeDefined();
      expect(screen.getByText("優先順位")).toBeDefined();
      expect(screen.getByText("ステータス")).toBeDefined();
      expect(screen.getByText("操作")).toBeDefined();
    });

    it("カテゴリ別にグループ化して表示する", () => {
      render(<MappingTable items={mockItems} onEdit={vi.fn()} onDelete={vi.fn()} />);

      expect(screen.getByText("CBC")).toBeDefined();
      expect(screen.getByText("生化学")).toBeDefined();
    });

    it("マッピング済みの項目にはソースコードを表示する", () => {
      render(<MappingTable items={mockItems} onEdit={vi.fn()} onDelete={vi.fn()} />);

      expect(screen.getByText("LAB-WBC-001")).toBeDefined();
    });

    it("マッピング済み項目のステータスを「設定済」と表示する", () => {
      render(<MappingTable items={mockItems} onEdit={vi.fn()} onDelete={vi.fn()} />);

      expect(screen.getByText("設定済")).toBeDefined();
    });

    it("未設定項目のステータスを「未設定」と表示する", () => {
      render(<MappingTable items={mockItems} onEdit={vi.fn()} onDelete={vi.fn()} />);

      expect(screen.getAllByText("未設定")).toHaveLength(2);
    });
  });

  describe("データが空の場合", () => {
    it("空メッセージを表示する", () => {
      render(<MappingTable items={[]} onEdit={vi.fn()} onDelete={vi.fn()} />);

      expect(screen.getByText("項目がありません")).toBeDefined();
    });
  });

  describe("操作ボタン", () => {
    it("未設定項目に「設定」ボタンを表示する", () => {
      render(<MappingTable items={mockItems} onEdit={vi.fn()} onDelete={vi.fn()} />);

      const settingButtons = screen.getAllByText("設定");
      expect(settingButtons.length).toBeGreaterThanOrEqual(1);
    });

    it("マッピング済み項目に「編集」ボタンを表示する", () => {
      render(<MappingTable items={mockItems} onEdit={vi.fn()} onDelete={vi.fn()} />);

      expect(screen.getByText("編集")).toBeDefined();
    });

    it("マッピング済み項目に「解除」ボタンを表示する", () => {
      render(<MappingTable items={mockItems} onEdit={vi.fn()} onDelete={vi.fn()} />);

      expect(screen.getByText("解除")).toBeDefined();
    });

    it("設定ボタンクリックでonEditが呼ばれる", () => {
      const onEdit = vi.fn();
      render(<MappingTable items={mockItems} onEdit={onEdit} onDelete={vi.fn()} />);

      const settingButtons = screen.getAllByText("設定");
      fireEvent.click(settingButtons[0]);

      expect(onEdit).toHaveBeenCalledWith("RBC", "赤血球数 (RBC)", null);
    });

    it("編集ボタンクリックでonEditが呼ばれる", () => {
      const onEdit = vi.fn();
      render(<MappingTable items={mockItems} onEdit={onEdit} onDelete={vi.fn()} />);

      fireEvent.click(screen.getByText("編集"));

      expect(onEdit).toHaveBeenCalledWith("WBC", "白血球数 (WBC)", mockMapping);
    });

    it("解除ボタンクリックでonDeleteが呼ばれる", () => {
      const onDelete = vi.fn();
      render(<MappingTable items={mockItems} onEdit={vi.fn()} onDelete={onDelete} />);

      fireEvent.click(screen.getByText("解除"));

      expect(onDelete).toHaveBeenCalledWith(mockMapping);
    });
  });
});
