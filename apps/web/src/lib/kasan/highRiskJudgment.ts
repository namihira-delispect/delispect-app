/**
 * せん妄ハイリスクケア加算の判定ロジック
 *
 * 厚生労働省の基準に基づき、以下の項目のいずれかに該当する場合、
 * せん妄ハイリスクケア加算の対象となる:
 *
 * 1. 認知症（MedicalHistory: hasDementia）
 * 2. 脳器質的障害（MedicalHistory: hasOrganicBrainDamage）
 * 3. アルコール多飲（MedicalHistory: isHeavyAlcohol）
 * 4. せん妄の既往（MedicalHistory: hasDeliriumHistory）
 * 5. 全身麻酔の予定（MedicalHistory: hasGeneralAnesthesia）
 * 6. 70歳以上（Patient生年月日から自動算出）
 * 7. リスク薬剤の使用（Prescriptionと薬剤マスタの照合）
 */

/** 判定に必要なMedicalHistory入力項目 */
export interface MedicalHistoryInput {
  hasDementia: boolean | null;
  hasOrganicBrainDamage: boolean | null;
  isHeavyAlcohol: boolean | null;
  hasDeliriumHistory: boolean | null;
  hasGeneralAnesthesia: boolean | null;
}

/** 判定に必要な全入力パラメータ */
export interface HighRiskJudgmentInput {
  /** MedicalHistory（ユーザー入力）項目 */
  medicalHistory: MedicalHistoryInput;
  /** 70歳以上か（Patient生年月日から算出） */
  isOver70: boolean;
  /** リスク薬剤があるか（Prescriptionと薬剤マスタの照合結果） */
  hasRiskDrug: boolean;
}

/** 判定結果 */
export interface HighRiskJudgmentResult {
  /** 加算対象か */
  isEligible: boolean;
  /** 該当する項目キーの一覧 */
  applicableItems: string[];
}

/**
 * せん妄ハイリスクケア加算の対象判定を行う
 *
 * いずれかの項目に該当すれば加算対象（isEligible = true）。
 *
 * @param input - 判定に必要な全入力パラメータ
 * @returns 判定結果（isEligible, applicableItems）
 */
export function judgeHighRiskKasan(input: HighRiskJudgmentInput): HighRiskJudgmentResult {
  const applicableItems: string[] = [];

  // MedicalHistory項目のチェック
  if (input.medicalHistory.hasDementia === true) {
    applicableItems.push("hasDementia");
  }
  if (input.medicalHistory.hasOrganicBrainDamage === true) {
    applicableItems.push("hasOrganicBrainDamage");
  }
  if (input.medicalHistory.isHeavyAlcohol === true) {
    applicableItems.push("isHeavyAlcohol");
  }
  if (input.medicalHistory.hasDeliriumHistory === true) {
    applicableItems.push("hasDeliriumHistory");
  }
  if (input.medicalHistory.hasGeneralAnesthesia === true) {
    applicableItems.push("hasGeneralAnesthesia");
  }

  // 自動判定項目
  if (input.isOver70) {
    applicableItems.push("isOver70");
  }
  if (input.hasRiskDrug) {
    applicableItems.push("hasRiskDrug");
  }

  return {
    isEligible: applicableItems.length > 0,
    applicableItems,
  };
}

/**
 * 患者の入院時年齢が70歳以上かを判定する
 *
 * @param ageAtAdmission - 入院時年齢（nullの場合はfalse）
 * @returns 70歳以上であればtrue
 */
export function isPatientOver70(ageAtAdmission: number | null): boolean {
  return ageAtAdmission != null && ageAtAdmission >= 70;
}

/**
 * 処方薬剤にリスク薬剤が含まれるかを判定する
 *
 * @param prescriptions - 処方薬剤一覧（薬剤マスタとの結合結果）
 * @returns リスク薬剤があればtrue
 */
export function hasRiskDrugInPrescriptions(prescriptions: { riskFactorFlg: boolean }[]): boolean {
  return prescriptions.some((p) => p.riskFactorFlg);
}
