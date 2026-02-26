/**
 * ケアプラン作成：その他カテゴリ（離床・認知症・安全管理・睡眠）の型定義
 *
 * チェックリスト形式で各カテゴリの対策方法を選択する。
 */

/** その他カテゴリーの対象種別 */
export type OthersCategoryType = "MOBILITY" | "DEMENTIA" | "SAFETY" | "SLEEP";

/** その他カテゴリー一覧（順序保証） */
export const OTHERS_CATEGORIES: OthersCategoryType[] = ["MOBILITY", "DEMENTIA", "SAFETY", "SLEEP"];

/** チェックリスト選択肢 */
export interface ChecklistOption {
  /** 選択肢ID */
  id: string;
  /** 表示ラベル */
  label: string;
  /** 説明文 */
  description?: string;
}

/** カテゴリーごとのチェックリスト定義 */
export interface CategoryChecklistDefinition {
  /** カテゴリー */
  category: OthersCategoryType;
  /** カテゴリー表示名 */
  label: string;
  /** カテゴリー説明 */
  description: string;
  /** チェックリスト選択肢 */
  options: ChecklistOption[];
}

// =============================================================================
// 離床（MOBILITY）チェックリスト
// =============================================================================

export const MOBILITY_OPTIONS: ChecklistOption[] = [
  {
    id: "mobility_01",
    label: "早期離床の計画を立てる",
    description: "術後や入院後のできるだけ早い段階で離床計画を策定する",
  },
  {
    id: "mobility_02",
    label: "端座位の促進",
    description: "ベッドサイドでの端座位を定期的に行う",
  },
  {
    id: "mobility_03",
    label: "歩行訓練の実施",
    description: "状態に応じた歩行訓練を段階的に行う",
  },
  {
    id: "mobility_04",
    label: "リハビリテーションの依頼",
    description: "理学療法士・作業療法士にリハビリテーションを依頼する",
  },
  {
    id: "mobility_05",
    label: "日中の活動量を増やす",
    description: "日中の活動時間を確保し、昼夜のリズムを維持する",
  },
  {
    id: "mobility_06",
    label: "車椅子への移乗を行う",
    description: "ベッドから車椅子への移乗を積極的に行う",
  },
  {
    id: "mobility_07",
    label: "食事は離床して行う",
    description: "可能であれば食事をベッド上ではなく離床して行う",
  },
];

// =============================================================================
// 認知症（DEMENTIA）チェックリスト
// =============================================================================

export const DEMENTIA_OPTIONS: ChecklistOption[] = [
  {
    id: "dementia_01",
    label: "見当識の支援を行う",
    description: "日付・時間・場所がわかるよう環境を整える（カレンダー・時計の設置等）",
  },
  {
    id: "dementia_02",
    label: "わかりやすいコミュニケーションを行う",
    description: "短い文章でゆっくり、はっきり話しかける",
  },
  {
    id: "dementia_03",
    label: "なじみのある物品を配置する",
    description: "自宅で使用していた物品や写真などを病室に配置する",
  },
  {
    id: "dementia_04",
    label: "日中の刺激を確保する",
    description: "適切な活動や会話の機会を設け、日中の覚醒を促す",
  },
  {
    id: "dementia_05",
    label: "家族の面会・付き添いを促す",
    description: "家族の面会を促し、安心できる環境を提供する",
  },
  {
    id: "dementia_06",
    label: "生活リズムの維持",
    description: "入院前の生活リズムをできるだけ維持する",
  },
  {
    id: "dementia_07",
    label: "不安・混乱時の対応方法を共有する",
    description: "スタッフ間で認知症の方への対応方法を統一する",
  },
];

// =============================================================================
// 安全管理（SAFETY）チェックリスト
// =============================================================================

export const SAFETY_OPTIONS: ChecklistOption[] = [
  {
    id: "safety_01",
    label: "転倒・転落リスクの評価を行う",
    description: "転倒・転落リスクアセスメントを実施し、対策を立てる",
  },
  {
    id: "safety_02",
    label: "ベッド周囲の環境整備",
    description: "ベッド柵・ナースコール・照明の配置を確認し安全を確保する",
  },
  {
    id: "safety_03",
    label: "離床センサーの使用を検討する",
    description: "必要に応じて離床センサーやマット型センサーを設置する",
  },
  {
    id: "safety_04",
    label: "抑制に頼らない看護を実施する",
    description: "身体拘束を最小限にし、代替手段を検討する",
  },
  {
    id: "safety_05",
    label: "ルート類の自己抜去防止策",
    description: "点滴・ドレーン等のルート類の固定方法を工夫し、自己抜去を防止する",
  },
  {
    id: "safety_06",
    label: "夜間の巡回頻度を増やす",
    description: "夜間の定期巡回を増やし、患者の安全を確認する",
  },
  {
    id: "safety_07",
    label: "履物・衣類の確認",
    description: "滑りにくい履物の使用や、動きやすい衣類を確認する",
  },
];

// =============================================================================
// 睡眠（SLEEP）チェックリスト
// =============================================================================

export const SLEEP_OPTIONS: ChecklistOption[] = [
  {
    id: "sleep_01",
    label: "睡眠環境を整える",
    description: "室温・照明・騒音に配慮し、快適な睡眠環境を確保する",
  },
  {
    id: "sleep_02",
    label: "日中の活動量を確保する",
    description: "日中に適度な活動を行い、夜間の入眠を促進する",
  },
  {
    id: "sleep_03",
    label: "就寝前のルーティンを設定する",
    description: "入院前の就寝習慣に近い就寝前ルーティンを設定する",
  },
  {
    id: "sleep_04",
    label: "不要な夜間の覚醒を防ぐ",
    description: "夜間の不要な検温・処置を減らし、睡眠の質を保つ",
  },
  {
    id: "sleep_05",
    label: "カフェイン摂取を制限する",
    description: "午後以降のカフェイン含有飲料の摂取を控える",
  },
  {
    id: "sleep_06",
    label: "睡眠薬の適正使用を確認する",
    description: "睡眠薬の使用状況を確認し、必要に応じて医師に相談する",
  },
  {
    id: "sleep_07",
    label: "昼寝の時間を管理する",
    description: "日中の昼寝は30分以内にとどめ、夜間の睡眠に影響しないようにする",
  },
];

// =============================================================================
// カテゴリーごとのチェックリスト定義マップ
// =============================================================================

/** カテゴリーごとのチェックリスト選択肢マップ */
export const OTHERS_CHECKLIST_OPTIONS: Record<OthersCategoryType, ChecklistOption[]> = {
  MOBILITY: MOBILITY_OPTIONS,
  DEMENTIA: DEMENTIA_OPTIONS,
  SAFETY: SAFETY_OPTIONS,
  SLEEP: SLEEP_OPTIONS,
};

/** カテゴリーごとの表示ラベル */
export const OTHERS_CATEGORY_LABELS: Record<OthersCategoryType, string> = {
  MOBILITY: "離床促進",
  DEMENTIA: "認知症ケア",
  SAFETY: "安全管理",
  SLEEP: "睡眠管理",
};

/** カテゴリーごとの説明 */
export const OTHERS_CATEGORY_DESCRIPTIONS: Record<OthersCategoryType, string> = {
  MOBILITY: "早期離床の対策方法を提案し、チェックリスト形式で離床に関する対策を選択します。",
  DEMENTIA: "認知機能低下の対策方法を提案し、チェックリスト形式で認知症に関する対策を選択します。",
  SAFETY: "安全管理の取り組みを提案し、チェックリスト形式で安全管理に関する対策を選択します。",
  SLEEP: "睡眠管理の対策方法を提案し、チェックリスト形式で睡眠に関する対策を選択します。",
};

/** カテゴリーごとのチェックリスト定義一覧 */
export const OTHERS_CHECKLIST_DEFINITIONS: CategoryChecklistDefinition[] = OTHERS_CATEGORIES.map(
  (category) => ({
    category,
    label: OTHERS_CATEGORY_LABELS[category],
    description: OTHERS_CATEGORY_DESCRIPTIONS[category],
    options: OTHERS_CHECKLIST_OPTIONS[category],
  }),
);

// =============================================================================
// 保存データの型
// =============================================================================

/** チェックリスト保存データ */
export interface ChecklistSaveData {
  /** 選択された選択肢IDリスト */
  selectedOptionIds: string[];
  /** 自由記述メモ（任意） */
  notes?: string;
}

/** その他カテゴリのケアプラン詳細 */
export interface OthersCarePlanDetails {
  /** カテゴリー */
  category: OthersCategoryType;
  /** チェックリスト保存データ */
  checklist: ChecklistSaveData;
}

/** その他カテゴリの保存リクエスト */
export interface SaveOthersCarePlanRequest {
  /** ケアプランアイテムID */
  itemId: number;
  /** チェックリスト保存データ */
  checklist: ChecklistSaveData;
}

/** その他カテゴリの保存レスポンス */
export interface SaveOthersCarePlanResponse {
  /** 更新されたケアプランアイテムID */
  itemId: number;
  /** 更新後のステータス */
  status: string;
}

/** その他カテゴリのケアプラン取得レスポンス */
export interface GetOthersCarePlanResponse {
  /** ケアプランアイテムID */
  itemId: number;
  /** カテゴリー */
  category: OthersCategoryType;
  /** ステータス */
  status: string;
  /** チェックリスト保存データ */
  checklist: ChecklistSaveData | null;
  /** 指示内容 */
  instructions: string | null;
  /** 更新日時 */
  updatedAt: string;
}

/**
 * 選択された対策から指示内容テキストを生成する
 */
export function generateInstructions(
  category: OthersCategoryType,
  selectedOptionIds: string[],
): string {
  const options = OTHERS_CHECKLIST_OPTIONS[category];
  const selectedOptions = options.filter((opt) => selectedOptionIds.includes(opt.id));

  if (selectedOptions.length === 0) {
    return "";
  }

  const label = OTHERS_CATEGORY_LABELS[category];
  const lines = selectedOptions.map((opt) => `- ${opt.label}`);
  return `【${label}】\n${lines.join("\n")}`;
}
