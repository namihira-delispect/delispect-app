/** データマッピングの種別 */
export type DataMappingType =
  | "LAB_ITEM"
  | "PRESCRIPTION_TYPE"
  | "VITAL_SIGN"
  | "WARD"
  | "ROOM";

/** データマッピングの表示用型定義 */
export interface DataMappingItem {
  id: number;
  mappingType: DataMappingType;
  sourceCode: string;
  targetCode: string;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

/** データマッピング一覧のレスポンス型 */
export interface DataMappingListResponse {
  items: DataMappingItem[];
  totalCount: number;
}

/** マッピングステータス */
export type MappingStatus = "mapped" | "unmapped";

/** システム項目の定義 */
export interface SystemTargetItem {
  code: string;
  label: string;
  category: string;
}

/** マッピング状態付きのシステム項目 */
export interface MappingStatusItem extends SystemTargetItem {
  status: MappingStatus;
  mapping: DataMappingItem | null;
}

/** マッピング検証結果 */
export interface MappingValidationResult {
  isValid: boolean;
  totalRequired: number;
  mappedCount: number;
  unmappedItems: SystemTargetItem[];
}

/**
 * システムで定義されている検査項目コード
 *
 * CBC（血液一般検査）と生化学検査
 */
export const LAB_ITEM_TARGETS: SystemTargetItem[] = [
  // CBC
  { code: "RBC", label: "赤血球数 (RBC)", category: "CBC" },
  { code: "WBC", label: "白血球数 (WBC)", category: "CBC" },
  { code: "HGB", label: "ヘモグロビン (Hb)", category: "CBC" },
  { code: "HCT", label: "ヘマトクリット (Ht)", category: "CBC" },
  { code: "PLT", label: "血小板数 (Plt)", category: "CBC" },
  // 生化学
  { code: "AST", label: "AST (GOT)", category: "生化学" },
  { code: "ALT", label: "ALT (GPT)", category: "生化学" },
  { code: "ALP", label: "ALP", category: "生化学" },
  { code: "GGT", label: "γ-GT (GGT)", category: "生化学" },
  { code: "CHE", label: "コリンエステラーゼ (ChE)", category: "生化学" },
  { code: "CRE", label: "クレアチニン (CRE)", category: "生化学" },
  { code: "BUN", label: "尿素窒素 (UN)", category: "生化学" },
  { code: "NA", label: "ナトリウム (Na)", category: "生化学" },
  { code: "K", label: "カリウム (K)", category: "生化学" },
  { code: "CA", label: "カルシウム (Ca)", category: "生化学" },
  { code: "GLU", label: "血糖 (GLU)", category: "生化学" },
  { code: "CRP", label: "CRP", category: "生化学" },
];

/**
 * システムで定義されているバイタルサイン項目
 */
export const VITAL_SIGN_TARGETS: SystemTargetItem[] = [
  { code: "BODY_TEMPERATURE", label: "体温", category: "バイタルサイン" },
  { code: "PULSE", label: "脈拍", category: "バイタルサイン" },
  { code: "SYSTOLIC_BP", label: "収縮期血圧", category: "バイタルサイン" },
  { code: "DIASTOLIC_BP", label: "拡張期血圧", category: "バイタルサイン" },
  { code: "SPO2", label: "SpO2", category: "バイタルサイン" },
  { code: "RESPIRATORY_RATE", label: "呼吸数", category: "バイタルサイン" },
];

/**
 * システムで定義されている入院情報項目
 */
export const ADMISSION_INFO_TARGETS: SystemTargetItem[] = [
  { code: "WARD", label: "病棟", category: "入院情報" },
  { code: "ROOM", label: "病室", category: "入院情報" },
];

/**
 * マッピング種別ごとのラベル
 */
export const MAPPING_TYPE_LABELS: Record<DataMappingType, string> = {
  LAB_ITEM: "検査値",
  PRESCRIPTION_TYPE: "処方",
  VITAL_SIGN: "バイタルサイン",
  WARD: "病棟",
  ROOM: "病室",
};

/**
 * タブ定義
 */
export type MappingTab = "lab" | "prescription" | "vital" | "admission";

export const MAPPING_TABS: { key: MappingTab; label: string }[] = [
  { key: "lab", label: "検査値マッピング" },
  { key: "prescription", label: "処方マッピング" },
  { key: "vital", label: "バイタルサインマッピング" },
  { key: "admission", label: "入院情報マッピング" },
];
