/** 薬剤マスタの表示用型定義 */
export interface MedicineMasterItem {
  id: number;
  categoryId: number;
  medicinesCode: string;
  riskFactorFlg: boolean;
  createdAt: string;
  updatedAt: string;
  /** 関連する薬剤名設定 */
  medicineNameSettings: MedicineNameSettingItem[];
}

/** 薬剤名設定の表示用型定義 */
export interface MedicineNameSettingItem {
  id: number;
  hospitalCode: string;
  displayName: string;
}

/** 薬剤マスタ一覧のレスポンス型 */
export interface MedicineMasterListResponse {
  items: MedicineMasterItem[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
}

/** 薬剤マスタの検索・フィルタ条件 */
export interface MedicineMasterSearchParams {
  query?: string;
  page?: number;
  pageSize?: number;
}

/** CSVインポートのプレビュー結果 */
export interface CsvImportPreview {
  addCount: number;
  updateCount: number;
  deleteCount: number;
  errors: CsvImportError[];
  rows: CsvImportRow[];
}

/** CSVインポートの行データ */
export interface CsvImportRow {
  rowNumber: number;
  medicinesCode: string;
  categoryId: number;
  riskFactorFlg: boolean;
  displayName: string;
  hospitalCode: string;
  /** 差分種別 */
  changeType: "add" | "update" | "delete" | "unchanged";
}

/** CSVインポートのエラー */
export interface CsvImportError {
  row: number;
  column: string;
  message: string;
}

/** 薬剤マスタ登録・編集フォームの状態 */
export interface MedicineMasterFormState {
  success: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
}

/** CSVインポートの状態 */
export interface CsvImportState {
  success: boolean;
  message?: string;
  importedCount?: number;
}
