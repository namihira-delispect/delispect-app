import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TranscriptionPanel } from "../TranscriptionPanel";
import type { CarePlanDetailResponse, TranscriptionHistoryEntry } from "../../types";

function createMockDetail(): CarePlanDetailResponse {
  return {
    carePlanId: 1,
    admissionId: 100,
    createdBy: "テスト看護師",
    createdById: 10,
    createdAt: "2026-01-15T09:00:00.000Z",
    updatedAt: "2026-01-15T10:00:00.000Z",
    items: [
      {
        id: 1,
        category: "MEDICATION",
        status: "COMPLETED",
        details: null,
        instructions: "- リスク薬剤確認済み",
        currentQuestionId: null,
        createdAt: "2026-01-15T09:00:00.000Z",
        updatedAt: "2026-01-15T09:30:00.000Z",
      },
    ],
    patientName: "山田 太郎",
    patientId: "P001",
    admissionDate: "2026-01-10T00:00:00.000Z",
    ward: "3階東病棟",
    room: "301",
  };
}

function createMockHistories(): TranscriptionHistoryEntry[] {
  return [
    {
      id: 1,
      content: "転記テスト1",
      createdAt: "2026-01-15T10:00:00.000Z",
    },
    {
      id: 2,
      content: "転記テスト2",
      createdAt: "2026-01-15T11:00:00.000Z",
    },
  ];
}

describe("TranscriptionPanel", () => {
  const mockSaveTranscription = vi.fn();

  beforeEach(() => {
    mockSaveTranscription.mockReset();
  });

  it("転記パネルのタイトルを表示する", () => {
    render(
      <TranscriptionPanel
        detail={createMockDetail()}
        histories={[]}
        onSaveTranscription={mockSaveTranscription}
      />,
    );

    expect(screen.getByText("看護記録転記")).toBeDefined();
  });

  it("転記プレビューを表示する", () => {
    render(
      <TranscriptionPanel
        detail={createMockDetail()}
        histories={[]}
        onSaveTranscription={mockSaveTranscription}
      />,
    );

    const preview = screen.getByTestId("transcription-preview");
    expect(preview).toBeDefined();
    expect(preview.textContent).toContain("山田 太郎");
    expect(preview.textContent).toContain("P001");
  });

  it("オプションチェックボックスが3つ表示される", () => {
    render(
      <TranscriptionPanel
        detail={createMockDetail()}
        histories={[]}
        onSaveTranscription={mockSaveTranscription}
      />,
    );

    expect(screen.getByText("アセスメント結果")).toBeDefined();
    expect(screen.getByText("ケア提案内容")).toBeDefined();
    expect(screen.getByText("実施状況")).toBeDefined();
  });

  it("クリップボードにコピーボタンが表示される", () => {
    render(
      <TranscriptionPanel
        detail={createMockDetail()}
        histories={[]}
        onSaveTranscription={mockSaveTranscription}
      />,
    );

    expect(screen.getByText("クリップボードにコピー")).toBeDefined();
  });

  it("コピー＆転記履歴保存ボタンが表示される", () => {
    render(
      <TranscriptionPanel
        detail={createMockDetail()}
        histories={[]}
        onSaveTranscription={mockSaveTranscription}
      />,
    );

    expect(screen.getByText("コピー＆転記履歴保存")).toBeDefined();
  });

  it("転記履歴が表示される", () => {
    render(
      <TranscriptionPanel
        detail={createMockDetail()}
        histories={createMockHistories()}
        onSaveTranscription={mockSaveTranscription}
      />,
    );

    expect(screen.getByText(/転記履歴（2件）/)).toBeDefined();
  });

  it("転記履歴が空の場合は履歴セクションを表示しない", () => {
    render(
      <TranscriptionPanel
        detail={createMockDetail()}
        histories={[]}
        onSaveTranscription={mockSaveTranscription}
      />,
    );

    // 「転記履歴（N件）」というテキストが存在しないことを確認
    expect(screen.queryByText(/転記履歴（\d+件）/)).toBeNull();
  });

  it("オプションチェックボックスの切り替えでプレビューが更新される", () => {
    render(
      <TranscriptionPanel
        detail={createMockDetail()}
        histories={[]}
        onSaveTranscription={mockSaveTranscription}
      />,
    );

    // 最初はアセスメント結果を含む
    const preview = screen.getByTestId("transcription-preview");
    expect(preview.textContent).toContain("アセスメント結果");

    // チェックボックスを切り替え
    const checkboxes = screen.getAllByRole("checkbox");
    // 最初のチェックボックス（アセスメント結果）をクリック
    fireEvent.click(checkboxes[0]);

    // アセスメント結果が含まれなくなる
    expect(preview.textContent).not.toContain("[アセスメント結果]");
  });

  it("data-testidが正しく設定される", () => {
    const { container } = render(
      <TranscriptionPanel
        detail={createMockDetail()}
        histories={[]}
        onSaveTranscription={mockSaveTranscription}
      />,
    );

    const panel = container.querySelector('[data-testid="transcription-panel"]');
    expect(panel).not.toBeNull();
  });
});
