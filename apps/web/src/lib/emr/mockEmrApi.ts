/**
 * 電子カルテAPI Mockサービス
 *
 * 病院側のDWH/DBサーバーとの連携をシミュレートするMock実装。
 * 指定された入院日付範囲に基づいて、テストデータを生成・返却する。
 */

import type {
  EmrPatientDataResponse,
  EmrAdmissionData,
  EmrVitalSignData,
  EmrLabResultData,
  EmrPrescriptionData,
} from "@/features/emr-sync/types";

/** 検査項目コード一覧 */
const LAB_ITEM_CODES = [
  "WBC", "RBC", "HGB", "HCT", "PLT",
  "CRP", "ALB", "BUN", "CRE", "NA",
  "K", "CL", "AST", "ALT", "LDH", "GGT", "TBIL", "GLU",
];

/** 検査値の基準範囲（Mock用） */
const LAB_VALUE_RANGES: Record<string, { min: number; max: number }> = {
  WBC: { min: 3500, max: 9000 },
  RBC: { min: 380, max: 520 },
  HGB: { min: 11.5, max: 17.0 },
  HCT: { min: 35.0, max: 50.0 },
  PLT: { min: 15.0, max: 35.0 },
  CRP: { min: 0.0, max: 0.3 },
  ALB: { min: 3.5, max: 5.0 },
  BUN: { min: 8.0, max: 20.0 },
  CRE: { min: 0.6, max: 1.1 },
  NA: { min: 136, max: 145 },
  K: { min: 3.5, max: 5.0 },
  CL: { min: 98, max: 108 },
  AST: { min: 10, max: 40 },
  ALT: { min: 5, max: 45 },
  LDH: { min: 120, max: 240 },
  GGT: { min: 10, max: 70 },
  TBIL: { min: 0.2, max: 1.2 },
  GLU: { min: 70, max: 110 },
};

/** Mock薬剤一覧 */
const MOCK_DRUGS = [
  { drugName: "ロキソプロフェン錠60mg", yjCode: "1149019F1020", type: "ORAL" },
  { drugName: "アセトアミノフェン錠200mg", yjCode: "1141007F1058", type: "ORAL" },
  { drugName: "ソルデム3A輸液500mL", yjCode: "3319502A3060", type: "INJECTION" },
  { drugName: "ヘパリンナトリウム注10000単位", yjCode: "3334400A1040", type: "INJECTION" },
  { drugName: "ケトプロフェンテープ40mg", yjCode: "2649728S1060", type: "EXTERNAL" },
];

/** Mock患者名 */
const MOCK_PATIENTS = [
  { lastName: "田中", firstName: "太郎", lastNameKana: "タナカ", firstNameKana: "タロウ", sex: "MALE", birthday: "1955-03-15" },
  { lastName: "鈴木", firstName: "花子", lastNameKana: "スズキ", firstNameKana: "ハナコ", sex: "FEMALE", birthday: "1960-07-22" },
  { lastName: "佐藤", firstName: "一郎", lastNameKana: "サトウ", firstNameKana: "イチロウ", sex: "MALE", birthday: "1948-11-03" },
  { lastName: "高橋", firstName: "美咲", lastNameKana: "タカハシ", firstNameKana: "ミサキ", sex: "FEMALE", birthday: "1972-09-10" },
  { lastName: "山田", firstName: "健太", lastNameKana: "ヤマダ", firstNameKana: "ケンタ", sex: "MALE", birthday: "1965-01-28" },
];

/**
 * 指定範囲のランダム数値を生成
 */
function randomInRange(min: number, max: number, decimals = 1): number {
  const value = Math.random() * (max - min) + min;
  return Number(value.toFixed(decimals));
}

/**
 * 日付間の日数を計算
 */
function daysBetween(start: Date, end: Date): number {
  const diffTime = end.getTime() - start.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * MockバイタルサインデータをN日分生成
 */
function generateMockVitalSigns(
  admissionId: string,
  admissionDate: Date,
): EmrVitalSignData[] {
  const results: EmrVitalSignData[] = [];
  // 入院日〜入院日の翌日
  const endDate = new Date(admissionDate);
  endDate.setDate(endDate.getDate() + 1);

  // 1日2〜3回の測定を想定
  for (let d = new Date(admissionDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const measuringTimes = [8, 14, 20]; // 8時、14時、20時
    for (const hour of measuringTimes) {
      const measuredAt = new Date(d);
      measuredAt.setHours(hour, 0, 0, 0);

      results.push({
        admissionId,
        bodyTemperature: randomInRange(36.0, 37.5),
        pulse: Math.round(randomInRange(60, 100, 0)),
        systolicBp: Math.round(randomInRange(100, 150, 0)),
        diastolicBp: Math.round(randomInRange(60, 90, 0)),
        spo2: randomInRange(95.0, 100.0),
        respiratoryRate: Math.round(randomInRange(12, 20, 0)),
        measuredAt: measuredAt.toISOString(),
      });
    }
  }

  return results;
}

/**
 * Mock検査値データを生成
 */
function generateMockLabResults(
  admissionId: string,
  admissionDate: Date,
): EmrLabResultData[] {
  const results: EmrLabResultData[] = [];
  // 入院7日前〜入院日の翌日
  const startDate = new Date(admissionDate);
  startDate.setDate(startDate.getDate() - 7);
  const endDate = new Date(admissionDate);
  endDate.setDate(endDate.getDate() + 1);

  // 入院前日と入院当日に検査を実施したと想定
  const testDays = [
    new Date(admissionDate.getTime() - 1 * 24 * 60 * 60 * 1000), // 前日
    admissionDate, // 当日
  ];

  for (const testDay of testDays) {
    if (testDay < startDate || testDay > endDate) continue;
    const measuredAt = new Date(testDay);
    measuredAt.setHours(6, 0, 0, 0); // 早朝採血を想定

    for (const itemCode of LAB_ITEM_CODES) {
      const range = LAB_VALUE_RANGES[itemCode];
      if (!range) continue;

      results.push({
        admissionId,
        itemCode,
        value: randomInRange(range.min, range.max, 3),
        measuredAt: measuredAt.toISOString(),
      });
    }
  }

  return results;
}

/**
 * Mock処方データを生成
 */
function generateMockPrescriptions(
  admissionId: string,
  admissionDate: Date,
): EmrPrescriptionData[] {
  const results: EmrPrescriptionData[] = [];
  // 入院7日前〜入院日の翌日（入院日当日に処方されたものを想定）
  const prescribedAt = new Date(admissionDate);
  prescribedAt.setHours(10, 0, 0, 0);

  // 2〜3種類の薬を処方
  const drugCount = Math.floor(Math.random() * 2) + 2;
  const selectedDrugs = MOCK_DRUGS.sort(() => Math.random() - 0.5).slice(0, drugCount);

  for (const drug of selectedDrugs) {
    results.push({
      admissionId,
      yjCode: drug.yjCode,
      drugName: drug.drugName,
      prescriptionType: drug.type,
      prescribedAt: prescribedAt.toISOString(),
    });
  }

  return results;
}

/**
 * 電子カルテAPIから入院データを取得する（Mock実装）
 *
 * 指定された入院日付範囲に該当する入院患者のデータを返却する。
 * 実際の運用では病院側のDWH/DBサーバーへのHTTPリクエストに置き換える。
 *
 * @param startDate - 入院日の開始日（YYYY-MM-DD）
 * @param endDate - 入院日の終了日（YYYY-MM-DD）
 * @returns 入院データの配列
 */
export async function fetchEmrData(
  startDate: string,
  endDate: string,
): Promise<EmrPatientDataResponse[]> {
  // 非同期処理のシミュレーション（実際のAPI呼び出し時間をシミュレート）
  await new Promise((resolve) => setTimeout(resolve, 100));

  const start = new Date(startDate);
  const end = new Date(endDate);
  const totalDays = daysBetween(start, end) + 1;
  const results: EmrPatientDataResponse[] = [];

  // 1日あたり1〜2件の入院を想定
  for (let d = 0; d < totalDays; d++) {
    const admissionDate = new Date(start);
    admissionDate.setDate(admissionDate.getDate() + d);
    const admissionsPerDay = Math.floor(Math.random() * 2) + 1;

    for (let a = 0; a < admissionsPerDay; a++) {
      const patientIndex = (d * 2 + a) % MOCK_PATIENTS.length;
      const patient = MOCK_PATIENTS[patientIndex];
      const externalAdmissionId = `ADM-${admissionDate.toISOString().slice(0, 10).replace(/-/g, "")}-${String(a + 1).padStart(3, "0")}`;
      const patientId = `P${String(patientIndex + 1).padStart(6, "0")}`;

      const admission: EmrAdmissionData = {
        externalAdmissionId,
        patientId,
        lastName: patient.lastName,
        firstName: patient.firstName,
        lastNameKana: patient.lastNameKana,
        firstNameKana: patient.firstNameKana,
        birthday: patient.birthday,
        sex: patient.sex,
        admissionDate: admissionDate.toISOString().slice(0, 10),
        admissionTime: "14:00",
        ageAtAdmission: new Date().getFullYear() - new Date(patient.birthday).getFullYear(),
        height: randomInRange(150, 180),
        weight: randomInRange(45, 85),
        ward: `${Math.floor(Math.random() * 5) + 3}階病棟`,
        room: `${Math.floor(Math.random() * 20) + 1}号室`,
      };

      results.push({
        admission,
        vitalSigns: generateMockVitalSigns(externalAdmissionId, admissionDate),
        labResults: generateMockLabResults(externalAdmissionId, admissionDate),
        prescriptions: generateMockPrescriptions(externalAdmissionId, admissionDate),
      });
    }
  }

  return results;
}
