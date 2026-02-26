/** 性別（Prisma Gender enum に対応） */
export type Gender = "MALE" | "FEMALE" | "OTHER" | "UNKNOWN";

/** 基準値マスタレコード */
export interface ReferenceValue {
  id: number;
  itemCode: string;
  itemName: string;
  unit: string | null;
  lowerLimit: string | null;
  upperLimit: string | null;
  gender: Gender | null;
}

/** 基準値一覧の表示用（項目コードでグループ化済み） */
export interface ReferenceValueGroup {
  itemCode: string;
  itemName: string;
  unit: string | null;
  /** 共通（gender=null）の基準値 */
  common: ReferenceValueRange | null;
  /** 男性の基準値 */
  male: ReferenceValueRange | null;
  /** 女性の基準値 */
  female: ReferenceValueRange | null;
}

/** 基準値範囲 */
export interface ReferenceValueRange {
  id: number;
  lowerLimit: string | null;
  upperLimit: string | null;
}

/** 基準値編集フォームの状態 */
export type ReferenceValueFormState = {
  success?: boolean;
  message?: string;
  fieldErrors?: {
    lowerLimit?: string[];
    upperLimit?: string[];
  };
};
