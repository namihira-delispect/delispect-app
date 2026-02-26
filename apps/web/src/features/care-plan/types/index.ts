/**
 * ケアプラン一覧・ステータス管理機能の型定義
 *
 * ケアプランの各カテゴリー（10項目）に対するステータス管理と
 * 全体ステータスの導出に関する型を定義する。
 */

/** ケアプランカテゴリー */
export type CarePlanCategoryType =
  | "MEDICATION"
  | "PAIN"
  | "DEHYDRATION"
  | "CONSTIPATION"
  | "INFLAMMATION"
  | "MOBILITY"
  | "DEMENTIA"
  | "SAFETY"
  | "SLEEP"
  | "INFORMATION";

/** ケアプランアイテムステータス */
export type CarePlanItemStatusType = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "NOT_APPLICABLE";

/** ケアプラン全体ステータス */
export type CarePlanOverallStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

/** ケアプランカテゴリー一覧（順序保証） */
export const CARE_PLAN_CATEGORIES: CarePlanCategoryType[] = [
  "MEDICATION",
  "PAIN",
  "DEHYDRATION",
  "CONSTIPATION",
  "INFLAMMATION",
  "MOBILITY",
  "DEMENTIA",
  "SAFETY",
  "SLEEP",
  "INFORMATION",
];

/** ケアプランカテゴリーの表示ラベル */
export const CARE_PLAN_CATEGORY_LABELS: Record<CarePlanCategoryType, string> = {
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

/** ケアプランカテゴリーの説明 */
export const CARE_PLAN_CATEGORY_DESCRIPTIONS: Record<CarePlanCategoryType, string> = {
  MEDICATION: "リスク薬剤の確認と薬剤変更提案",
  PAIN: "痛みの確認と生活への影響評価",
  DEHYDRATION: "採血結果・目視確認による脱水評価",
  CONSTIPATION: "便の性状・体調・食事の確認",
  INFLAMMATION: "採血結果・バイタルサインによる炎症評価",
  MOBILITY: "早期離床の対策方法の選択",
  DEMENTIA: "認知機能低下の対策方法の選択",
  SAFETY: "安全管理の取り組みの選択",
  SLEEP: "睡眠管理の対策方法の選択",
  INFORMATION: "患者・家族への情報提供",
};

/** ケアプランアイテムステータスの表示ラベル */
export const CARE_PLAN_ITEM_STATUS_LABELS: Record<CarePlanItemStatusType, string> = {
  NOT_STARTED: "未実施",
  IN_PROGRESS: "実施中",
  COMPLETED: "完了",
  NOT_APPLICABLE: "該当なし",
};

/** ケアプラン全体ステータスの表示ラベル */
export const CARE_PLAN_OVERALL_STATUS_LABELS: Record<CarePlanOverallStatus, string> = {
  NOT_STARTED: "未実施",
  IN_PROGRESS: "実施中",
  COMPLETED: "完了",
};

// =============================================================================
// ケアプラン一覧表示用の型
// =============================================================================

/** ケアプランアイテム表示用 */
export interface CarePlanItemEntry {
  /** ID */
  id: number;
  /** カテゴリー */
  category: CarePlanCategoryType;
  /** ステータス */
  status: CarePlanItemStatusType;
  /** 指示内容 */
  instructions: string | null;
  /** 更新日時 */
  updatedAt: string;
}

/** ケアプラン一覧レスポンス */
export interface CarePlanListResponse {
  /** ケアプランID */
  carePlanId: number;
  /** 入院ID */
  admissionId: number;
  /** 全体ステータス */
  overallStatus: CarePlanOverallStatus;
  /** アイテム一覧 */
  items: CarePlanItemEntry[];
  /** 作成者名 */
  createdBy: string;
  /** 作成日時 */
  createdAt: string;
  /** 更新日時 */
  updatedAt: string;
}

/** ケアプラン作成レスポンス */
export interface CreateCarePlanResponse {
  /** ケアプランID */
  carePlanId: number;
  /** 作成されたアイテム数 */
  itemCount: number;
}

/** ケアプランアイテムステータス更新リクエスト */
export interface UpdateCarePlanItemStatusRequest {
  /** ケアプランアイテムID */
  itemId: number;
  /** 新しいステータス */
  status: CarePlanItemStatusType;
}

// =============================================================================
// ステータス導出ロジック
// =============================================================================

/**
 * ケアプラン全体のステータスを導出する
 *
 * - 未実施: 全項目が未実施（NOT_STARTEDまたはNOT_APPLICABLE）
 * - 実施中: 一部でも実施中または完了がある
 * - 完了: 全項目が完了（COMPLETEDまたはNOT_APPLICABLE）
 */
export function deriveOverallStatus(itemStatuses: CarePlanItemStatusType[]): CarePlanOverallStatus {
  if (itemStatuses.length === 0) {
    return "NOT_STARTED";
  }

  const hasInProgress = itemStatuses.some((s) => s === "IN_PROGRESS");
  const hasCompleted = itemStatuses.some((s) => s === "COMPLETED");
  const allCompletedOrNA = itemStatuses.every((s) => s === "COMPLETED" || s === "NOT_APPLICABLE");

  if (allCompletedOrNA) {
    return "COMPLETED";
  }

  if (hasInProgress || hasCompleted) {
    return "IN_PROGRESS";
  }

  return "NOT_STARTED";
}
