/** システム設定のキー定義 */
export const SYSTEM_SETTING_KEYS = {
  /** バッチインポート実行時刻（HH:mm形式） */
  BATCH_IMPORT_TIME: "batch_import_time",
  /** 対象入院日付範囲（何日前まで） */
  BATCH_IMPORT_DATE_RANGE_DAYS: "batch_import_date_range_days",
} as const;

export type SystemSettingKey =
  (typeof SYSTEM_SETTING_KEYS)[keyof typeof SYSTEM_SETTING_KEYS];

/** システム設定のデフォルト値 */
export const SYSTEM_SETTING_DEFAULTS: Record<SystemSettingKey, string> = {
  [SYSTEM_SETTING_KEYS.BATCH_IMPORT_TIME]: "06:00",
  [SYSTEM_SETTING_KEYS.BATCH_IMPORT_DATE_RANGE_DAYS]: "2",
};

/** システム設定のフォーム状態 */
export type SystemSettingsFormState = {
  success?: boolean;
  message?: string;
  fieldErrors?: {
    batchImportTime?: string[];
    batchImportDateRangeDays?: string[];
  };
};

/** システム設定の値 */
export interface SystemSettingsData {
  batchImportTime: string;
  batchImportDateRangeDays: number;
}
