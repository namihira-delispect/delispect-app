/**
 * ケアプラン詳細・看護記録転記機能の型定義
 *
 * ケアプラン詳細画面で使用する型と、
 * 看護記録へのテキスト転記機能に関する型・定数を定義する。
 */

import type { CarePlanCategoryType, CarePlanItemStatusType } from "../types";

// =============================================================================
// ケアプラン詳細表示用の型
// =============================================================================

/** ケアプランアイテム詳細 */
export interface CarePlanItemDetail {
  /** ID */
  id: number;
  /** カテゴリー */
  category: CarePlanCategoryType;
  /** ステータス */
  status: CarePlanItemStatusType;
  /** 詳細データ（JSON） */
  details: Record<string, unknown> | null;
  /** 指示内容 */
  instructions: string | null;
  /** 現在の質問ID */
  currentQuestionId: string | null;
  /** 作成日時 */
  createdAt: string;
  /** 更新日時 */
  updatedAt: string;
}

/** ケアプラン詳細レスポンス */
export interface CarePlanDetailResponse {
  /** ケアプランID */
  carePlanId: number;
  /** 入院ID */
  admissionId: number;
  /** 作成者名 */
  createdBy: string;
  /** 作成者ID */
  createdById: number;
  /** 作成日時 */
  createdAt: string;
  /** 更新日時 */
  updatedAt: string;
  /** アイテム一覧（カテゴリー別） */
  items: CarePlanItemDetail[];
  /** 患者名 */
  patientName: string;
  /** 患者ID */
  patientId: string;
  /** 入院日 */
  admissionDate: string;
  /** 病棟 */
  ward: string | null;
  /** 病室 */
  room: string | null;
}

// =============================================================================
// カテゴリーグループ定義
// =============================================================================

/** ケアプランのカテゴリーグループ */
export type CarePlanCategoryGroup = "ASSESSMENT" | "OTHERS";

/** アセスメントカテゴリー（一問一答形式） */
export const ASSESSMENT_CATEGORIES: CarePlanCategoryType[] = [
  "MEDICATION",
  "PAIN",
  "DEHYDRATION",
  "CONSTIPATION",
  "INFLAMMATION",
];

/** その他カテゴリー（チェックリスト形式） */
export const OTHER_CATEGORIES: CarePlanCategoryType[] = [
  "MOBILITY",
  "DEMENTIA",
  "SAFETY",
  "SLEEP",
  "INFORMATION",
];

/** カテゴリーグループラベル */
export const CATEGORY_GROUP_LABELS: Record<CarePlanCategoryGroup, string> = {
  ASSESSMENT: "アセスメント項目",
  OTHERS: "その他のケア項目",
};

// =============================================================================
// 看護記録転記機能の型
// =============================================================================

/** 転記テキスト生成オプション */
export interface TranscriptionOptions {
  /** アセスメント結果を含む */
  includeAssessment: boolean;
  /** ケア提案内容を含む */
  includeSuggestions: boolean;
  /** 実施状況を含む */
  includeStatus: boolean;
}

/** デフォルトの転記オプション */
export const DEFAULT_TRANSCRIPTION_OPTIONS: TranscriptionOptions = {
  includeAssessment: true,
  includeSuggestions: true,
  includeStatus: true,
};

/** 転記履歴エントリ */
export interface TranscriptionHistoryEntry {
  /** ID */
  id: number;
  /** 転記内容 */
  content: string;
  /** 作成日時 */
  createdAt: string;
}

/** 転記リクエスト */
export interface CreateTranscriptionRequest {
  /** ケアプランID */
  carePlanId: number;
  /** 転記内容 */
  content: string;
}

/** 転記レスポンス */
export interface CreateTranscriptionResponse {
  /** 転記履歴ID */
  id: number;
  /** 転記日時 */
  createdAt: string;
}

// =============================================================================
// 転記テキスト生成ロジック
// =============================================================================

/**
 * ケアプラン詳細から看護記録転記用テキストを生成する
 *
 * 電子カルテの看護記録に貼り付け可能な形式で出力する。
 *
 * @param detail - ケアプラン詳細レスポンス
 * @param options - 転記オプション
 * @returns 看護記録転記用テキスト
 */
export function generateTranscriptionText(
  detail: CarePlanDetailResponse,
  options: TranscriptionOptions = DEFAULT_TRANSCRIPTION_OPTIONS,
): string {
  const lines: string[] = [];

  // ヘッダー
  lines.push("【ケアプラン詳細】");
  lines.push(`患者名: ${detail.patientName}`);
  lines.push(`患者ID: ${detail.patientId}`);
  lines.push(`入院日: ${formatDate(detail.admissionDate)}`);
  if (detail.ward) {
    lines.push(`病棟: ${detail.ward}${detail.room ? ` / ${detail.room}` : ""}`);
  }
  lines.push(`作成者: ${detail.createdBy}`);
  lines.push(`作成日: ${formatDateTime(detail.createdAt)}`);
  lines.push("");

  // カテゴリー別の詳細
  const completedItems = detail.items.filter(
    (item) => item.status === "COMPLETED" || item.status === "IN_PROGRESS",
  );

  if (completedItems.length === 0) {
    lines.push("実施済みのケアプラン項目はありません。");
    return lines.join("\n");
  }

  for (const item of completedItems) {
    const categoryLabel = getCategoryLabel(item.category);
    const statusLabel = getStatusLabel(item.status);

    lines.push(`■ ${categoryLabel}`);

    if (options.includeStatus) {
      lines.push(`  実施状況: ${statusLabel}`);
      lines.push(`  更新日時: ${formatDateTime(item.updatedAt)}`);
    }

    if (options.includeAssessment && item.instructions) {
      lines.push("  [アセスメント結果]");
      const instructionLines = item.instructions.split("\n");
      for (const line of instructionLines) {
        lines.push(`  ${line}`);
      }
    }

    if (options.includeSuggestions && item.details) {
      const suggestions = extractSuggestions(item.category, item.details);
      if (suggestions.length > 0) {
        lines.push("  [ケア提案]");
        for (const suggestion of suggestions) {
          lines.push(`  - ${suggestion}`);
        }
      }
    }

    lines.push("");
  }

  return lines.join("\n").trim();
}

// =============================================================================
// ヘルパー関数
// =============================================================================

/** 日付フォーマット（YYYY/MM/DD） */
function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}/${month}/${day}`;
  } catch {
    return isoString;
  }
}

/** 日時フォーマット（YYYY/MM/DD HH:mm） */
function formatDateTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}/${month}/${day} ${hours}:${minutes}`;
  } catch {
    return isoString;
  }
}

/** カテゴリーの日本語ラベルを取得 */
function getCategoryLabel(category: CarePlanCategoryType): string {
  const labels: Record<CarePlanCategoryType, string> = {
    MEDICATION: "薬剤管理",
    PAIN: "疼痛管理",
    DEHYDRATION: "脱水管理",
    CONSTIPATION: "便秘管理",
    INFLAMMATION: "炎症管理",
    MOBILITY: "離床促進",
    DEMENTIA: "認知症ケア",
    SAFETY: "安全管理",
    SLEEP: "睡眠管理",
    INFORMATION: "情報提供",
  };
  return labels[category] ?? category;
}

/** ステータスの日本語ラベルを取得 */
function getStatusLabel(status: CarePlanItemStatusType): string {
  const labels: Record<CarePlanItemStatusType, string> = {
    NOT_STARTED: "未実施",
    IN_PROGRESS: "実施中",
    COMPLETED: "完了",
    NOT_APPLICABLE: "該当なし",
  };
  return labels[status] ?? status;
}

/**
 * カテゴリー別にケア提案を抽出する
 *
 * details JSONBの構造はカテゴリーによって異なるため、
 * 各カテゴリーに応じた提案内容を抽出する。
 */
function extractSuggestions(
  category: CarePlanCategoryType,
  details: Record<string, unknown>,
): string[] {
  const suggestions: string[] = [];

  try {
    switch (category) {
      case "CONSTIPATION": {
        const suggestion = details.suggestion as { suggestions?: string[] } | undefined;
        if (suggestion?.suggestions) {
          suggestions.push(...suggestion.suggestions);
        }
        break;
      }
      case "DEHYDRATION": {
        const proposals = details.proposals as Array<{ message?: string }> | undefined;
        if (Array.isArray(proposals)) {
          for (const p of proposals) {
            if (p.message) suggestions.push(p.message);
          }
        }
        break;
      }
      case "INFLAMMATION": {
        const inflammationSuggestions = details.suggestions as
          | Array<{ message?: string }>
          | undefined;
        if (Array.isArray(inflammationSuggestions)) {
          for (const s of inflammationSuggestions) {
            if (s.message) suggestions.push(s.message);
          }
        }
        break;
      }
      case "MEDICATION": {
        const alternatives = details.alternatives as Array<{ suggestion?: string }> | undefined;
        if (Array.isArray(alternatives)) {
          for (const a of alternatives) {
            if (a.suggestion) suggestions.push(a.suggestion);
          }
        }
        break;
      }
      default: {
        // その他のカテゴリー（チェックリスト形式）
        const checkedItems = details.checkedItems as string[] | undefined;
        if (Array.isArray(checkedItems)) {
          suggestions.push(...checkedItems);
        }
        break;
      }
    }
  } catch {
    // details構造が不正な場合は空配列を返す
  }

  return suggestions;
}

// エクスポートされたヘルパー（テスト用）
export { formatDate, formatDateTime, getCategoryLabel, getStatusLabel, extractSuggestions };
