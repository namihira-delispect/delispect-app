/**
 * テスト用シードデータヘルパー
 *
 * 統合テストで使用するモックデータを集約。
 * 実際のDB接続はモック化するため、ここでは型に合ったデータを提供する。
 */
import type { CurrentUser, UserRole } from "@/shared/types";

// ============================================================
// ユーザーデータ（各ロール）
// ============================================================

/** 一般ユーザー（看護師） */
export const GENERAL_USER: CurrentUser = {
  id: 1,
  username: "nurse001",
  email: "nurse001@example.com",
  roles: ["GENERAL" as UserRole],
};

/** システム管理者 */
export const SYSTEM_ADMIN_USER: CurrentUser = {
  id: 2,
  username: "sysadmin001",
  email: "sysadmin001@example.com",
  roles: ["SYSTEM_ADMIN" as UserRole],
};

/** 全権管理者 */
export const SUPER_ADMIN_USER: CurrentUser = {
  id: 3,
  username: "superadmin001",
  email: "superadmin001@example.com",
  roles: ["SUPER_ADMIN" as UserRole],
};

// ============================================================
// 患者・入院データ
// ============================================================

export const TEST_PATIENT = {
  id: "P000001",
  lastName: "田中",
  firstName: "太郎",
  birthday: "1955-03-15",
  sex: "MALE" as const,
};

export const TEST_PATIENT_2 = {
  id: "P000002",
  lastName: "鈴木",
  firstName: "花子",
  birthday: "1960-07-20",
  sex: "FEMALE" as const,
};

export const TEST_ADMISSION = {
  id: 1,
  externalAdmissionId: "ADM-001",
  patientId: TEST_PATIENT.id,
  lastName: TEST_PATIENT.lastName,
  firstName: TEST_PATIENT.firstName,
  birthday: TEST_PATIENT.birthday,
  sex: TEST_PATIENT.sex,
  admissionDate: "2026-01-15",
  riskLevel: "NOT_ASSESSED" as const,
  careStatus: "NOT_STARTED" as const,
};

export const TEST_ADMISSION_2 = {
  id: 2,
  externalAdmissionId: "ADM-002",
  patientId: TEST_PATIENT_2.id,
  lastName: TEST_PATIENT_2.lastName,
  firstName: TEST_PATIENT_2.firstName,
  birthday: TEST_PATIENT_2.birthday,
  sex: TEST_PATIENT_2.sex,
  admissionDate: "2026-01-20",
  riskLevel: "HIGH" as const,
  careStatus: "IN_PROGRESS" as const,
};

// ============================================================
// 電子カルテ同期データ
// ============================================================

export const TEST_EMR_DATA = {
  admission: {
    externalAdmissionId: "ADM-001",
    patientId: "P000001",
    lastName: "田中",
    firstName: "太郎",
    birthday: "1955-03-15",
    sex: "MALE",
    admissionDate: "2026-01-15",
  },
  vitalSigns: [
    {
      admissionId: "ADM-001",
      bodyTemperature: 36.5,
      pulse: 72,
      systolicBp: 120,
      diastolicBp: 80,
      spo2: 98.0,
      respiratoryRate: 16,
      measuredAt: "2026-01-15T08:00:00.000Z",
    },
  ],
  labResults: [
    {
      admissionId: "ADM-001",
      itemCode: "WBC",
      value: 5500,
      measuredAt: "2026-01-15T06:00:00.000Z",
    },
    {
      admissionId: "ADM-001",
      itemCode: "CRP",
      value: 0.1,
      measuredAt: "2026-01-15T06:00:00.000Z",
    },
  ],
  prescriptions: [
    {
      admissionId: "ADM-001",
      drugName: "ロキソプロフェン錠60mg",
      prescriptionType: "ORAL",
      prescribedAt: "2026-01-15T10:00:00.000Z",
    },
  ],
};

// ============================================================
// リスク評価データ
// ============================================================

export const TEST_ML_INPUT = {
  admissionId: 1,
  age: 70,
  gender: "MALE" as const,
  height: 170,
  weight: 65,
  medicalHistory: {
    hasDementia: false,
    hasOrganicBrainDamage: false,
    isHeavyAlcohol: false,
    hasDeliriumHistory: false,
    usesPsychotropicDrugs: false,
    hasGeneralAnesthesia: false,
    hasEmergencySurgery: false,
    hasScheduledSurgery: false,
    hasHeadNeckSurgery: false,
    hasChestSurgery: false,
    hasAbdominalSurgery: false,
    hasAdmissionOxygenUse: false,
    oxygenLevel: null,
  },
  vitalSigns: {
    bodyTemperature: 36.5,
    pulse: 72,
    systolicBp: 120,
    diastolicBp: 80,
    spo2: 98,
    respiratoryRate: 16,
  },
  labResults: { CRP: 0.1, WBC: 5500 },
  riskDrugCount: 0,
  totalDrugCount: 2,
};

export const TEST_RISK_RESULT = {
  admissionId: 1,
  riskLevel: "HIGH" as const,
  riskFactors: { isOver70: true },
  mlInputSnapshot: TEST_ML_INPUT,
};

// ============================================================
// ハイリスクケア加算データ
// ============================================================

export const TEST_HIGH_RISK_KASAN_ASSESSMENT = {
  admissionId: 1,
  medicalHistoryItems: {
    hasDementia: true,
    hasOrganicBrainDamage: false,
    isHeavyAlcohol: false,
    hasDeliriumHistory: true,
    hasGeneralAnesthesia: false,
  },
};

export const TEST_HIGH_RISK_KASAN_RESULT = {
  admissionId: 1,
  isHighRisk: true,
  matchedCount: 2,
  items: {
    hasDementia: true,
    hasOrganicBrainDamage: false,
    isHeavyAlcohol: false,
    hasDeliriumHistory: true,
    hasGeneralAnesthesia: false,
  },
};

// ============================================================
// ケアプランデータ
// ============================================================

export const TEST_CARE_PLAN = {
  id: 1,
  admissionId: 1,
  status: "IN_PROGRESS" as const,
  createdAt: "2026-01-16T00:00:00.000Z",
  updatedAt: "2026-01-16T00:00:00.000Z",
  categories: [
    { category: "DEHYDRATION", status: "NOT_STARTED", itemCount: 5 },
    { category: "CONSTIPATION", status: "NOT_STARTED", itemCount: 3 },
    { category: "PAIN", status: "NOT_STARTED", itemCount: 4 },
    { category: "INFLAMMATION", status: "NOT_STARTED", itemCount: 3 },
    { category: "MEDICATION", status: "NOT_STARTED", itemCount: 2 },
    { category: "OTHERS", status: "NOT_STARTED", itemCount: 2 },
  ],
};

export const TEST_CARE_PLAN_DETAIL = {
  carePlanId: 1,
  admissionId: 1,
  patientName: "田中 太郎",
  status: "IN_PROGRESS" as const,
  items: [
    {
      id: 1,
      category: "DEHYDRATION",
      title: "脱水リスク評価",
      status: "COMPLETED",
      assessmentResult: "リスクあり",
    },
    {
      id: 2,
      category: "PAIN",
      title: "疼痛アセスメント",
      status: "IN_PROGRESS",
      assessmentResult: null,
    },
  ],
};

export const TEST_TRANSCRIPTION = {
  id: 1,
  carePlanId: 1,
  content: "ケアプラン転記テスト内容。脱水予防のため水分摂取を促す。",
  createdBy: GENERAL_USER.username,
  createdAt: "2026-01-17T10:00:00.000Z",
};

// ============================================================
// マスタデータ
// ============================================================

export const TEST_MEDICINE_MASTER = [
  {
    id: 1,
    drugCode: "MED001",
    drugName: "ロキソプロフェン錠60mg",
    isHighRisk: false,
    category: "NSAIDs",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: 2,
    drugCode: "MED002",
    drugName: "ハルシオン錠0.25mg",
    isHighRisk: true,
    category: "催眠鎮静薬",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];

export const TEST_REFERENCE_VALUES = [
  {
    id: 1,
    itemCode: "CRP",
    itemName: "C反応性タンパク",
    gender: "ALL" as const,
    lowerLimit: 0,
    upperLimit: 0.3,
    unit: "mg/dL",
  },
  {
    id: 2,
    itemCode: "WBC",
    itemName: "白血球数",
    gender: "ALL" as const,
    lowerLimit: 3300,
    upperLimit: 8600,
    unit: "/uL",
  },
];

// ============================================================
// 入院一覧レスポンスデータ
// ============================================================

export const TEST_ADMISSION_LIST_RESPONSE = {
  admissions: [TEST_ADMISSION, TEST_ADMISSION_2],
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 2,
    pageSize: 20,
  },
};

// ============================================================
// ヘルパー関数
// ============================================================

/**
 * 認証成功のResult型を返す
 */
export function createAuthSuccess(user: CurrentUser) {
  return { success: true as const, value: user };
}

/**
 * 認証失敗のResult型を返す（未認証）
 */
export function createAuthUnauthorized() {
  return {
    success: false as const,
    value: { code: "UNAUTHORIZED", cause: "認証が必要です" },
  };
}

/**
 * 認証失敗のResult型を返す（権限不足）
 */
export function createAuthForbidden() {
  return {
    success: false as const,
    value: { code: "FORBIDDEN", cause: "この操作を実行する権限がありません" },
  };
}
