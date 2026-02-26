/**
 * 疼痛ケアプランの型定義・定数
 *
 * 痛みの確認項目、デルマトーム図を参考にした部位選択、
 * 生活への影響評価に関する型と定数を定義する。
 */

// =============================================================================
// 疼痛確認の質問フロー
// =============================================================================

/** 質問ステップID */
export type PainQuestionStepId =
  | "PAIN_MEDICATION"
  | "DAYTIME_PAIN"
  | "NIGHTTIME_AWAKENING"
  | "PAIN_SITES"
  | "SITE_DETAILS"
  | "LIFE_IMPACT"
  | "CONFIRMATION";

/** 質問ステップ定義 */
export interface PainQuestionStep {
  /** ステップID */
  id: PainQuestionStepId;
  /** 表示ラベル */
  label: string;
  /** 説明文 */
  description: string;
}

/** 質問ステップ順序（一問一答フロー） */
export const PAIN_QUESTION_STEPS: PainQuestionStep[] = [
  {
    id: "PAIN_MEDICATION",
    label: "痛み止めの処方",
    description: "現在の痛み止めの処方状況を確認します",
  },
  {
    id: "DAYTIME_PAIN",
    label: "日中の痛み",
    description: "日中活動時の痛みの有無を確認します",
  },
  {
    id: "NIGHTTIME_AWAKENING",
    label: "夜間覚醒",
    description: "痛みによる夜間覚醒の有無を確認します",
  },
  {
    id: "PAIN_SITES",
    label: "痛みの部位",
    description: "痛みのある部位を選択してください",
  },
  {
    id: "SITE_DETAILS",
    label: "部位の詳細",
    description: "選択した各部位について詳しく確認します",
  },
  {
    id: "LIFE_IMPACT",
    label: "生活への影響",
    description: "痛みの生活への影響を確認します",
  },
  {
    id: "CONFIRMATION",
    label: "確認",
    description: "入力内容を確認してください",
  },
];

// =============================================================================
// デルマトーム図を参考にした部位定義
// =============================================================================

/** 痛みの部位ID */
export type PainSiteId =
  | "HEAD"
  | "NECK"
  | "RIGHT_SHOULDER"
  | "LEFT_SHOULDER"
  | "CHEST"
  | "UPPER_BACK"
  | "ABDOMEN"
  | "LOWER_BACK"
  | "RIGHT_UPPER_ARM"
  | "LEFT_UPPER_ARM"
  | "RIGHT_FOREARM"
  | "LEFT_FOREARM"
  | "RIGHT_HAND"
  | "LEFT_HAND"
  | "HIP"
  | "RIGHT_THIGH"
  | "LEFT_THIGH"
  | "RIGHT_KNEE"
  | "LEFT_KNEE"
  | "RIGHT_LOWER_LEG"
  | "LEFT_LOWER_LEG"
  | "RIGHT_FOOT"
  | "LEFT_FOOT";

/** 痛みの部位定義 */
export interface PainSiteDefinition {
  /** 部位ID */
  id: PainSiteId;
  /** 表示ラベル */
  label: string;
  /** 部位グループ */
  group: PainSiteGroup;
}

/** 部位グループ */
export type PainSiteGroup = "HEAD_NECK" | "TRUNK" | "UPPER_LIMB" | "LOWER_LIMB";

/** 部位グループラベル */
export const PAIN_SITE_GROUP_LABELS: Record<PainSiteGroup, string> = {
  HEAD_NECK: "頭・首",
  TRUNK: "体幹",
  UPPER_LIMB: "上肢",
  LOWER_LIMB: "下肢",
};

/** 痛みの部位一覧 */
export const PAIN_SITES: PainSiteDefinition[] = [
  // 頭・首
  { id: "HEAD", label: "頭部", group: "HEAD_NECK" },
  { id: "NECK", label: "首", group: "HEAD_NECK" },
  // 体幹
  { id: "CHEST", label: "胸部", group: "TRUNK" },
  { id: "UPPER_BACK", label: "背中上部", group: "TRUNK" },
  { id: "ABDOMEN", label: "腹部", group: "TRUNK" },
  { id: "LOWER_BACK", label: "腰部", group: "TRUNK" },
  { id: "HIP", label: "臀部", group: "TRUNK" },
  // 上肢
  { id: "RIGHT_SHOULDER", label: "右肩", group: "UPPER_LIMB" },
  { id: "LEFT_SHOULDER", label: "左肩", group: "UPPER_LIMB" },
  { id: "RIGHT_UPPER_ARM", label: "右上腕", group: "UPPER_LIMB" },
  { id: "LEFT_UPPER_ARM", label: "左上腕", group: "UPPER_LIMB" },
  { id: "RIGHT_FOREARM", label: "右前腕", group: "UPPER_LIMB" },
  { id: "LEFT_FOREARM", label: "左前腕", group: "UPPER_LIMB" },
  { id: "RIGHT_HAND", label: "右手", group: "UPPER_LIMB" },
  { id: "LEFT_HAND", label: "左手", group: "UPPER_LIMB" },
  // 下肢
  { id: "RIGHT_THIGH", label: "右大腿", group: "LOWER_LIMB" },
  { id: "LEFT_THIGH", label: "左大腿", group: "LOWER_LIMB" },
  { id: "RIGHT_KNEE", label: "右膝", group: "LOWER_LIMB" },
  { id: "LEFT_KNEE", label: "左膝", group: "LOWER_LIMB" },
  { id: "RIGHT_LOWER_LEG", label: "右下腿", group: "LOWER_LIMB" },
  { id: "LEFT_LOWER_LEG", label: "左下腿", group: "LOWER_LIMB" },
  { id: "RIGHT_FOOT", label: "右足", group: "LOWER_LIMB" },
  { id: "LEFT_FOOT", label: "左足", group: "LOWER_LIMB" },
];

/** 部位IDから部位定義を取得するためのマップ */
export const PAIN_SITE_MAP: Record<PainSiteId, PainSiteDefinition> = Object.fromEntries(
  PAIN_SITES.map((site) => [site.id, site]),
) as Record<PainSiteId, PainSiteDefinition>;

// =============================================================================
// 部位ごとの詳細確認項目
// =============================================================================

/** 部位詳細の確認項目ID */
export type SiteDetailCheckId = "TOUCH_PAIN" | "MOVEMENT_PAIN" | "NUMBNESS";

/** 部位詳細の確認項目 */
export interface SiteDetailCheck {
  /** 確認項目ID */
  id: SiteDetailCheckId;
  /** 表示ラベル */
  label: string;
  /** 説明文 */
  description: string;
}

/** 部位詳細の確認項目一覧 */
export const SITE_DETAIL_CHECKS: SiteDetailCheck[] = [
  {
    id: "TOUCH_PAIN",
    label: "触った時の痛み",
    description: "その部位を触った時に痛みがありますか？",
  },
  {
    id: "MOVEMENT_PAIN",
    label: "動かした時の痛み",
    description: "その部位を動かした時に痛みがありますか？",
  },
  {
    id: "NUMBNESS",
    label: "違和感・しびれ",
    description: "その部位に違和感やしびれはありますか？",
  },
];

// =============================================================================
// 生活への影響
// =============================================================================

/** 生活影響項目ID */
export type LifeImpactId = "SLEEP_IMPACT" | "MOBILITY_IMPACT" | "TOILET_IMPACT";

/** 生活影響項目 */
export interface LifeImpactItem {
  /** 影響項目ID */
  id: LifeImpactId;
  /** 表示ラベル */
  label: string;
  /** 説明文 */
  description: string;
}

/** 生活影響項目一覧 */
export const LIFE_IMPACT_ITEMS: LifeImpactItem[] = [
  {
    id: "SLEEP_IMPACT",
    label: "睡眠への影響",
    description: "痛みのせいで眠れない、または中途覚醒がありますか？",
  },
  {
    id: "MOBILITY_IMPACT",
    label: "動きへの影響",
    description: "痛みのせいで動くのがおっくうになっていますか？",
  },
  {
    id: "TOILET_IMPACT",
    label: "排泄への影響",
    description: "トイレを我慢するほどの痛みがありますか？",
  },
];

// =============================================================================
// 疼痛ケアプランのデータモデル（details JSONBに保存）
// =============================================================================

/** 部位ごとの詳細データ */
export interface PainSiteDetail {
  /** 部位ID */
  siteId: PainSiteId;
  /** 触った時の痛み */
  touchPain: boolean | null;
  /** 動かした時の痛み */
  movementPain: boolean | null;
  /** 違和感・しびれ */
  numbness: boolean | null;
}

/** 疼痛ケアプランの詳細データ（details JSONBフィールド） */
export interface PainCarePlanDetails {
  /** 日中活動時の痛みの有無 */
  hasDaytimePain: boolean | null;
  /** 痛みによる夜間覚醒の有無 */
  hasNighttimeAwakening: boolean | null;
  /** 選択された痛みの部位ID一覧 */
  selectedSiteIds: PainSiteId[];
  /** 部位ごとの詳細データ */
  siteDetails: PainSiteDetail[];
  /** 睡眠への影響 */
  sleepImpact: boolean | null;
  /** 動きへの影響 */
  mobilityImpact: boolean | null;
  /** 排泄への影響 */
  toiletImpact: boolean | null;
}

/** 痛み止め処方表示用 */
export interface PainMedicationInfo {
  /** 処方ID */
  id: number;
  /** 薬品名 */
  drugName: string;
  /** 処方種別 */
  prescriptionType: string;
  /** 処方日時 */
  prescribedAt: string;
}

/** 疼痛ケアプランの保存レスポンス */
export interface SavePainCarePlanResponse {
  /** ケアプランアイテムID */
  itemId: number;
  /** ステータス */
  status: string;
}

/** 疼痛ケアプランの取得レスポンス */
export interface PainCarePlanResponse {
  /** ケアプランアイテムID */
  itemId: number;
  /** ステータス */
  status: string;
  /** 現在の質問ID */
  currentQuestionId: string | null;
  /** 詳細データ */
  details: PainCarePlanDetails | null;
  /** 指示内容 */
  instructions: string | null;
  /** 痛み止め処方一覧 */
  painMedications: PainMedicationInfo[];
}

/**
 * 疼痛ケアプランの初期データを作成する
 */
export function createInitialPainDetails(): PainCarePlanDetails {
  return {
    hasDaytimePain: null,
    hasNighttimeAwakening: null,
    selectedSiteIds: [],
    siteDetails: [],
    sleepImpact: null,
    mobilityImpact: null,
    toiletImpact: null,
  };
}

/**
 * 痛みの部位をグループごとにまとめる
 */
export function groupPainSitesByGroup(): Record<PainSiteGroup, PainSiteDefinition[]> {
  const groups: Record<PainSiteGroup, PainSiteDefinition[]> = {
    HEAD_NECK: [],
    TRUNK: [],
    UPPER_LIMB: [],
    LOWER_LIMB: [],
  };

  for (const site of PAIN_SITES) {
    groups[site.group].push(site);
  }

  return groups;
}

/**
 * 疼痛ケアプランの指示内容を生成する
 *
 * 入力データから看護師向けの指示テキストを自動生成する。
 */
export function generatePainInstructions(details: PainCarePlanDetails): string {
  const lines: string[] = [];

  // 痛みの状況
  if (details.hasDaytimePain === true) {
    lines.push("- 日中活動時に痛みあり");
  }
  if (details.hasNighttimeAwakening === true) {
    lines.push("- 痛みによる夜間覚醒あり");
  }

  // 部位
  if (details.selectedSiteIds.length > 0) {
    const siteLabels = details.selectedSiteIds
      .map((id) => PAIN_SITE_MAP[id]?.label ?? id)
      .join("、");
    lines.push(`- 痛みの部位: ${siteLabels}`);

    for (const siteDetail of details.siteDetails) {
      const siteName = PAIN_SITE_MAP[siteDetail.siteId]?.label ?? siteDetail.siteId;
      const findings: string[] = [];
      if (siteDetail.touchPain) findings.push("触痛あり");
      if (siteDetail.movementPain) findings.push("運動時痛あり");
      if (siteDetail.numbness) findings.push("しびれ・違和感あり");
      if (findings.length > 0) {
        lines.push(`  ${siteName}: ${findings.join("、")}`);
      }
    }
  }

  // 生活への影響
  const impacts: string[] = [];
  if (details.sleepImpact === true) impacts.push("睡眠への影響あり");
  if (details.mobilityImpact === true) impacts.push("動きへの影響あり");
  if (details.toiletImpact === true) impacts.push("排泄への影響あり");
  if (impacts.length > 0) {
    lines.push(`- 生活への影響: ${impacts.join("、")}`);
  }

  return lines.length > 0 ? lines.join("\n") : "痛みの訴えなし";
}
