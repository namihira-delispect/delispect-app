/**
 * ケアプラン作成：便秘機能の型定義・定数
 *
 * 便の性状（ブリストルスケール）、体調面、食事、腸の状態確認の
 * 入力データと便秘の対処提案に関する型・定数を定義する。
 */

// =============================================================================
// ブリストルスケール（便の性状）
// =============================================================================

/** ブリストルスケールの型（1-7） */
export type BristolScaleType = 1 | 2 | 3 | 4 | 5 | 6 | 7;

/** ブリストルスケールの全値 */
export const BRISTOL_SCALE_VALUES: BristolScaleType[] = [1, 2, 3, 4, 5, 6, 7];

/** ブリストルスケールの説明 */
export const BRISTOL_SCALE_LABELS: Record<BristolScaleType, string> = {
  1: "硬くてコロコロの兎糞状の便",
  2: "ソーセージ状だが硬い便",
  3: "表面にひび割れのあるソーセージ状の便",
  4: "表面がなめらかで柔らかいソーセージ状の便",
  5: "はっきりとしたしわのある柔らかい半固形の便",
  6: "ふにゃふにゃの不定形の小片便、泥状の便",
  7: "水様で固形物を含まない液体状の便",
};

/** ブリストルスケールの短い説明 */
export const BRISTOL_SCALE_SHORT_LABELS: Record<BristolScaleType, string> = {
  1: "コロコロ便",
  2: "硬い便",
  3: "やや硬い便",
  4: "普通便",
  5: "やや柔らかい便",
  6: "泥状便",
  7: "水様便",
};

// =============================================================================
// 食事量
// =============================================================================

/** 食事量の型 */
export type MealAmountType = "LARGE" | "NORMAL" | "SMALL";

/** 食事量の全値 */
export const MEAL_AMOUNT_VALUES: MealAmountType[] = ["LARGE", "NORMAL", "SMALL"];

/** 食事量のラベル */
export const MEAL_AMOUNT_LABELS: Record<MealAmountType, string> = {
  LARGE: "多い",
  NORMAL: "普通",
  SMALL: "少ない",
};

// =============================================================================
// 便秘の重症度
// =============================================================================

/** 便秘の重症度 */
export type ConstipationSeverity = "NONE" | "MILD" | "MODERATE" | "SEVERE";

/** 便秘の重症度ラベル */
export const CONSTIPATION_SEVERITY_LABELS: Record<ConstipationSeverity, string> = {
  NONE: "便秘なし",
  MILD: "軽度",
  MODERATE: "中等度",
  SEVERE: "重度",
};

// =============================================================================
// 便秘の入力データ（details JSONBフィールドの構造）
// =============================================================================

/** 便秘の確認項目入力データ */
export interface ConstipationAssessmentData {
  /** 便が出ていない日数 */
  daysWithoutBowelMovement: number;
  /** ブリストルスケールによる便の性状（直近の便） */
  bristolScale: BristolScaleType | null;
  /** 吐き気、気分の悪さの有無 */
  hasNausea: boolean;
  /** お腹の張りの有無 */
  hasAbdominalDistension: boolean;
  /** 食欲の有無 */
  hasAppetite: boolean;
  /** 一度の食事量 */
  mealAmount: MealAmountType;
  /** 腸蠕動音の確認結果（true=聴取あり） */
  hasBowelSounds: boolean;
  /** 腸内ガスの確認結果（true=ガスあり） */
  hasIntestinalGas: boolean;
  /** 触診による便塊の確認結果（true=便塊あり） */
  hasFecalMass: boolean;
}

/** 便秘の対処提案データ */
export interface ConstipationSuggestion {
  /** 便秘の重症度 */
  severity: ConstipationSeverity;
  /** 対処方法一覧 */
  suggestions: string[];
}

/** 便秘のケアプラン詳細データ（CarePlanItem.details に保存される構造） */
export interface ConstipationDetails {
  /** 入力データ */
  assessment: ConstipationAssessmentData;
  /** 対処提案 */
  suggestion: ConstipationSuggestion;
}

// =============================================================================
// 一問一答フォームの質問定義
// =============================================================================

/** 質問ID */
export type ConstipationQuestionId =
  | "daysWithoutBowelMovement"
  | "bristolScale"
  | "physicalCondition"
  | "diet"
  | "bowelState"
  | "confirm";

/** 質問の順序 */
export const CONSTIPATION_QUESTION_ORDER: ConstipationQuestionId[] = [
  "daysWithoutBowelMovement",
  "bristolScale",
  "physicalCondition",
  "diet",
  "bowelState",
  "confirm",
];

/** 質問のラベル */
export const CONSTIPATION_QUESTION_LABELS: Record<ConstipationQuestionId, string> = {
  daysWithoutBowelMovement: "便が出ていない日数",
  bristolScale: "便の性状（ブリストルスケール）",
  physicalCondition: "体調面の確認",
  diet: "食事についての確認",
  bowelState: "腸の状態確認",
  confirm: "入力内容の確認",
};

// =============================================================================
// 便秘の重症度判定ロジック
// =============================================================================

/**
 * 便秘の重症度を判定する
 *
 * @param data 便秘の確認項目入力データ
 * @returns 便秘の重症度
 *
 * 判定基準:
 * - 便が出ていない日数が3日以上で便秘の疑いあり
 * - 腹部症状（お腹の張り、吐き気）の有無
 * - 腸の状態（蠕動音消失、便塊あり）
 * - ブリストルスケール1-2は硬便で便秘傾向
 */
export function determineConstipationSeverity(
  data: ConstipationAssessmentData,
): ConstipationSeverity {
  const {
    daysWithoutBowelMovement,
    bristolScale,
    hasNausea,
    hasAbdominalDistension,
    hasBowelSounds,
    hasFecalMass,
  } = data;

  // 便が出ていない日数が0-1日、かつ便の性状が正常（3-5）の場合は便秘なし
  if (
    daysWithoutBowelMovement <= 1 &&
    (bristolScale === null || (bristolScale >= 3 && bristolScale <= 5))
  ) {
    return "NONE";
  }

  let severityScore = 0;

  // 便が出ていない日数のスコア
  if (daysWithoutBowelMovement >= 5) {
    severityScore += 3;
  } else if (daysWithoutBowelMovement >= 3) {
    severityScore += 2;
  } else if (daysWithoutBowelMovement >= 2) {
    severityScore += 1;
  }

  // ブリストルスケールのスコア（硬便傾向）
  if (bristolScale !== null && bristolScale <= 2) {
    severityScore += 2;
  }

  // 腹部症状のスコア
  if (hasNausea) {
    severityScore += 2;
  }
  if (hasAbdominalDistension) {
    severityScore += 1;
  }

  // 腸の状態のスコア
  if (!hasBowelSounds) {
    severityScore += 2;
  }
  if (hasFecalMass) {
    severityScore += 2;
  }

  // スコアに基づく重症度判定
  if (severityScore >= 7) {
    return "SEVERE";
  }
  if (severityScore >= 4) {
    return "MODERATE";
  }
  if (severityScore >= 1) {
    return "MILD";
  }

  return "NONE";
}

// =============================================================================
// 便秘の対処提案生成
// =============================================================================

/**
 * 便秘の重症度に応じた対処方法を生成する
 *
 * @param severity 便秘の重症度
 * @param data 便秘の確認項目入力データ
 * @returns 対処提案
 */
export function generateConstipationSuggestions(
  severity: ConstipationSeverity,
  data: ConstipationAssessmentData,
): ConstipationSuggestion {
  const suggestions: string[] = [];

  switch (severity) {
    case "NONE":
      suggestions.push("現在、便秘の兆候は見られません。引き続き経過観察を行ってください。");
      break;

    case "MILD":
      suggestions.push("水分摂取量を増やすことを検討してください。");
      suggestions.push("食物繊維を含む食事を推奨してください。");
      if (!data.hasAppetite || data.mealAmount === "SMALL") {
        suggestions.push("食欲不振・食事量低下が見られるため、少量頻回食の検討をしてください。");
      }
      suggestions.push("適度な運動・離床を促してください。");
      break;

    case "MODERATE":
      suggestions.push("水分摂取量の確認と増量を検討してください。");
      suggestions.push("食物繊維を含む食事の提供を検討してください。");
      suggestions.push("腹部マッサージの実施を検討してください。");
      if (data.hasAbdominalDistension) {
        suggestions.push("お腹の張りが認められるため、腹部の温罨法を検討してください。");
      }
      if (!data.hasAppetite || data.mealAmount === "SMALL") {
        suggestions.push("食欲不振・食事量低下が見られるため、栄養士との相談を検討してください。");
      }
      suggestions.push("緩下剤の使用について医師に相談してください。");
      break;

    case "SEVERE":
      suggestions.push("医師への報告と下剤・浣腸の処方を検討してください。");
      if (data.hasNausea) {
        suggestions.push("吐き気が認められるため、制吐剤の使用を医師に相談してください。");
      }
      if (data.hasAbdominalDistension) {
        suggestions.push("お腹の張りが強いため、腹部X線検査を医師に提案してください。");
      }
      if (data.hasFecalMass) {
        suggestions.push("触診で便塊が確認されたため、摘便の必要性を医師に相談してください。");
      }
      if (!data.hasBowelSounds) {
        suggestions.push("腸蠕動音が聴取できないため、イレウスの可能性を医師に報告してください。");
      }
      suggestions.push("水分・食事摂取状況のモニタリングを強化してください。");
      suggestions.push("排便状況の記録を継続してください。");
      break;
  }

  return { severity, suggestions };
}
