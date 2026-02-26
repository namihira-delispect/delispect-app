import { describe, it, expect } from "vitest";
import {
  generateTranscriptionText,
  formatDate,
  formatDateTime,
  getCategoryLabel,
  getStatusLabel,
  extractSuggestions,
  DEFAULT_TRANSCRIPTION_OPTIONS,
  ASSESSMENT_CATEGORIES,
  OTHER_CATEGORIES,
  CATEGORY_GROUP_LABELS,
} from "../types";
import type { CarePlanDetailResponse, TranscriptionOptions } from "../types";

// =============================================================================
// テストデータ
// =============================================================================

function createMockDetail(overrides?: Partial<CarePlanDetailResponse>): CarePlanDetailResponse {
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
        instructions: "- リスク薬剤: ベンゾジアゼピン系\n- 代替薬の検討を推奨",
        currentQuestionId: null,
        createdAt: "2026-01-15T09:00:00.000Z",
        updatedAt: "2026-01-15T09:30:00.000Z",
      },
      {
        id: 2,
        category: "PAIN",
        status: "IN_PROGRESS",
        details: null,
        instructions: "- 日中活動時に痛みあり\n- 痛みの部位: 腰部",
        currentQuestionId: "LIFE_IMPACT",
        createdAt: "2026-01-15T09:00:00.000Z",
        updatedAt: "2026-01-15T09:45:00.000Z",
      },
      {
        id: 3,
        category: "DEHYDRATION",
        status: "NOT_STARTED",
        details: null,
        instructions: null,
        currentQuestionId: null,
        createdAt: "2026-01-15T09:00:00.000Z",
        updatedAt: "2026-01-15T09:00:00.000Z",
      },
    ],
    patientName: "山田 太郎",
    patientId: "P001",
    admissionDate: "2026-01-10T00:00:00.000Z",
    ward: "3階東病棟",
    room: "301",
    ...overrides,
  };
}

// =============================================================================
// 定数のテスト
// =============================================================================

describe("定数定義", () => {
  it("アセスメントカテゴリーが5項目ある", () => {
    expect(ASSESSMENT_CATEGORIES).toHaveLength(5);
    expect(ASSESSMENT_CATEGORIES).toContain("MEDICATION");
    expect(ASSESSMENT_CATEGORIES).toContain("PAIN");
    expect(ASSESSMENT_CATEGORIES).toContain("DEHYDRATION");
    expect(ASSESSMENT_CATEGORIES).toContain("CONSTIPATION");
    expect(ASSESSMENT_CATEGORIES).toContain("INFLAMMATION");
  });

  it("その他カテゴリーが5項目ある", () => {
    expect(OTHER_CATEGORIES).toHaveLength(5);
    expect(OTHER_CATEGORIES).toContain("MOBILITY");
    expect(OTHER_CATEGORIES).toContain("DEMENTIA");
    expect(OTHER_CATEGORIES).toContain("SAFETY");
    expect(OTHER_CATEGORIES).toContain("SLEEP");
    expect(OTHER_CATEGORIES).toContain("INFORMATION");
  });

  it("カテゴリーグループラベルが定義されている", () => {
    expect(CATEGORY_GROUP_LABELS.ASSESSMENT).toBe("アセスメント項目");
    expect(CATEGORY_GROUP_LABELS.OTHERS).toBe("その他のケア項目");
  });

  it("デフォルト転記オプションが全てtrueである", () => {
    expect(DEFAULT_TRANSCRIPTION_OPTIONS.includeAssessment).toBe(true);
    expect(DEFAULT_TRANSCRIPTION_OPTIONS.includeSuggestions).toBe(true);
    expect(DEFAULT_TRANSCRIPTION_OPTIONS.includeStatus).toBe(true);
  });
});

// =============================================================================
// formatDate のテスト
// =============================================================================

describe("formatDate", () => {
  it("ISO日付文字列をYYYY/MM/DD形式に変換する", () => {
    expect(formatDate("2026-01-15T09:00:00.000Z")).toMatch(/2026\/01\/15/);
  });

  it("不正な日付文字列の場合はNaN含みの文字列を返す", () => {
    // new Date("invalid-date") は Invalid Date を返すが、例外は投げない
    const result = formatDate("invalid-date");
    expect(typeof result).toBe("string");
  });
});

// =============================================================================
// formatDateTime のテスト
// =============================================================================

describe("formatDateTime", () => {
  it("ISO日付文字列をYYYY/MM/DD HH:mm形式に変換する", () => {
    const result = formatDateTime("2026-01-15T09:00:00.000Z");
    expect(result).toMatch(/2026\/01\/15/);
    expect(result).toMatch(/\d{2}:\d{2}/);
  });

  it("不正な日付文字列の場合はNaN含みの文字列を返す", () => {
    // new Date("invalid-date") は Invalid Date を返すが、例外は投げない
    const result = formatDateTime("invalid-date");
    expect(typeof result).toBe("string");
  });
});

// =============================================================================
// getCategoryLabel のテスト
// =============================================================================

describe("getCategoryLabel", () => {
  it("薬剤カテゴリーのラベルを返す", () => {
    expect(getCategoryLabel("MEDICATION")).toBe("薬剤管理");
  });

  it("疼痛カテゴリーのラベルを返す", () => {
    expect(getCategoryLabel("PAIN")).toBe("疼痛管理");
  });

  it("脱水カテゴリーのラベルを返す", () => {
    expect(getCategoryLabel("DEHYDRATION")).toBe("脱水管理");
  });

  it("便秘カテゴリーのラベルを返す", () => {
    expect(getCategoryLabel("CONSTIPATION")).toBe("便秘管理");
  });

  it("炎症カテゴリーのラベルを返す", () => {
    expect(getCategoryLabel("INFLAMMATION")).toBe("炎症管理");
  });
});

// =============================================================================
// getStatusLabel のテスト
// =============================================================================

describe("getStatusLabel", () => {
  it("NOT_STARTEDの日本語ラベルを返す", () => {
    expect(getStatusLabel("NOT_STARTED")).toBe("未実施");
  });

  it("IN_PROGRESSの日本語ラベルを返す", () => {
    expect(getStatusLabel("IN_PROGRESS")).toBe("実施中");
  });

  it("COMPLETEDの日本語ラベルを返す", () => {
    expect(getStatusLabel("COMPLETED")).toBe("完了");
  });

  it("NOT_APPLICABLEの日本語ラベルを返す", () => {
    expect(getStatusLabel("NOT_APPLICABLE")).toBe("該当なし");
  });
});

// =============================================================================
// extractSuggestions のテスト
// =============================================================================

describe("extractSuggestions", () => {
  it("便秘カテゴリーの提案を抽出する", () => {
    const details = {
      suggestion: { suggestions: ["水分を増やしてください", "食物繊維を摂取してください"] },
    };
    const result = extractSuggestions("CONSTIPATION", details);
    expect(result).toHaveLength(2);
    expect(result[0]).toBe("水分を増やしてください");
  });

  it("脱水カテゴリーの提案を抽出する", () => {
    const details = {
      proposals: [{ message: "水分補給を促進してください" }, { message: "点滴を検討してください" }],
    };
    const result = extractSuggestions("DEHYDRATION", details);
    expect(result).toHaveLength(2);
    expect(result[0]).toBe("水分補給を促進してください");
  });

  it("炎症カテゴリーの提案を抽出する", () => {
    const details = {
      suggestions: [{ message: "抗菌薬の投与を検討してください" }],
    };
    const result = extractSuggestions("INFLAMMATION", details);
    expect(result).toHaveLength(1);
  });

  it("その他のカテゴリーのチェック項目を抽出する", () => {
    const details = {
      checkedItems: ["早期離床の促進", "リハビリの実施"],
    };
    const result = extractSuggestions("MOBILITY", details);
    expect(result).toHaveLength(2);
  });

  it("detailsが空の場合は空配列を返す", () => {
    const result = extractSuggestions("CONSTIPATION", {});
    expect(result).toHaveLength(0);
  });

  it("不正なdetails構造の場合は空配列を返す", () => {
    const result = extractSuggestions("CONSTIPATION", { suggestion: "invalid" });
    expect(result).toHaveLength(0);
  });
});

// =============================================================================
// generateTranscriptionText のテスト
// =============================================================================

describe("generateTranscriptionText", () => {
  it("ヘッダー情報を含む転記テキストを生成する", () => {
    const detail = createMockDetail();
    const text = generateTranscriptionText(detail);

    expect(text).toContain("【ケアプラン詳細】");
    expect(text).toContain("山田 太郎");
    expect(text).toContain("P001");
    expect(text).toContain("3階東病棟");
    expect(text).toContain("テスト看護師");
  });

  it("完了および実施中のアイテムのみを含む", () => {
    const detail = createMockDetail();
    const text = generateTranscriptionText(detail);

    expect(text).toContain("薬剤管理");
    expect(text).toContain("疼痛管理");
    // 未実施の脱水管理は含まれない
    expect(text).not.toContain("脱水管理");
  });

  it("ステータス情報を含む", () => {
    const detail = createMockDetail();
    const text = generateTranscriptionText(detail);

    expect(text).toContain("完了");
    expect(text).toContain("実施中");
  });

  it("アセスメント結果を含む", () => {
    const detail = createMockDetail();
    const text = generateTranscriptionText(detail);

    expect(text).toContain("リスク薬剤: ベンゾジアゼピン系");
    expect(text).toContain("日中活動時に痛みあり");
  });

  it("includeAssessmentがfalseの場合はアセスメント結果を含まない", () => {
    const detail = createMockDetail();
    const options: TranscriptionOptions = {
      includeAssessment: false,
      includeSuggestions: true,
      includeStatus: true,
    };
    const text = generateTranscriptionText(detail, options);

    expect(text).not.toContain("[アセスメント結果]");
    expect(text).not.toContain("リスク薬剤");
  });

  it("includeStatusがfalseの場合は実施状況を含まない", () => {
    const detail = createMockDetail();
    const options: TranscriptionOptions = {
      includeAssessment: true,
      includeSuggestions: true,
      includeStatus: false,
    };
    const text = generateTranscriptionText(detail, options);

    expect(text).not.toContain("実施状況:");
  });

  it("実施済みアイテムがない場合はメッセージを表示する", () => {
    const detail = createMockDetail({
      items: [
        {
          id: 1,
          category: "MEDICATION",
          status: "NOT_STARTED",
          details: null,
          instructions: null,
          currentQuestionId: null,
          createdAt: "2026-01-15T09:00:00.000Z",
          updatedAt: "2026-01-15T09:00:00.000Z",
        },
      ],
    });
    const text = generateTranscriptionText(detail);

    expect(text).toContain("実施済みのケアプラン項目はありません");
  });

  it("病棟情報がない場合は病棟行を含まない", () => {
    const detail = createMockDetail({ ward: null, room: null });
    const text = generateTranscriptionText(detail);

    expect(text).not.toContain("病棟:");
  });

  it("提案内容を含むアイテムの提案を表示する", () => {
    const detail = createMockDetail({
      items: [
        {
          id: 1,
          category: "CONSTIPATION",
          status: "COMPLETED",
          details: {
            suggestion: {
              suggestions: ["水分摂取量を増やすことを検討してください"],
            },
          },
          instructions: "便秘の確認完了",
          currentQuestionId: null,
          createdAt: "2026-01-15T09:00:00.000Z",
          updatedAt: "2026-01-15T09:30:00.000Z",
        },
      ],
    });
    const text = generateTranscriptionText(detail);

    expect(text).toContain("[ケア提案]");
    expect(text).toContain("水分摂取量を増やすことを検討してください");
  });
});
