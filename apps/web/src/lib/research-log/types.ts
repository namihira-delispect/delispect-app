/**
 * 解析用操作ログの型定義
 */

/** 操作ログのアクション種別 */
export const RESEARCH_LOG_ACTIONS = {
  // 画面操作ログ
  PAGE_VIEW: "PAGE_VIEW",
  PAGE_LEAVE: "PAGE_LEAVE",
  BUTTON_CLICK: "BUTTON_CLICK",
  LINK_CLICK: "LINK_CLICK",
  FORM_START: "FORM_START",
  FORM_COMPLETE: "FORM_COMPLETE",

  // 業務フローログ
  EMR_SYNC_START: "EMR_SYNC_START",
  EMR_SYNC_COMPLETE: "EMR_SYNC_COMPLETE",
  RISK_ASSESSMENT_START: "RISK_ASSESSMENT_START",
  RISK_ASSESSMENT_COMPLETE: "RISK_ASSESSMENT_COMPLETE",
  CARE_PLAN_START: "CARE_PLAN_START",
  CARE_PLAN_STEP_COMPLETE: "CARE_PLAN_STEP_COMPLETE",
  CARE_PLAN_ABORT: "CARE_PLAN_ABORT",
  CARE_PLAN_COMPLETE: "CARE_PLAN_COMPLETE",
  HIGH_RISK_KASAN_ASSESS: "HIGH_RISK_KASAN_ASSESS",
  NURSING_TRANSCRIPTION: "NURSING_TRANSCRIPTION",

  // 認証系
  USER_LOGIN: "USER_LOGIN",
  USER_LOGOUT: "USER_LOGOUT",

  // エクスポート
  EXPORT_CSV: "EXPORT_CSV",
} as const;

export type ResearchLogAction =
  (typeof RESEARCH_LOG_ACTIONS)[keyof typeof RESEARCH_LOG_ACTIONS];

/** 画面操作ログの詳細データ */
export interface PageViewDetails {
  fromPath?: string;
  toPath: string;
  timestamp: string;
}

export interface PageLeaveDetails {
  path: string;
  durationMs: number;
  timestamp: string;
}

export interface ClickDetails {
  targetLabel: string;
  path: string;
  timestamp: string;
}

export interface FormDetails {
  formName: string;
  path: string;
  timestamp: string;
}

/** 業務フローログの詳細データ */
export interface EmrSyncDetails {
  targetCount?: number;
  durationMs?: number;
  timestamp: string;
}

export interface RiskAssessmentDetails {
  targetCount?: number;
  resultDistribution?: Record<string, number>;
  timestamp: string;
}

export interface CarePlanStepDetails {
  step: string;
  category?: string;
  timestamp: string;
}

export interface HighRiskKasanDetails {
  isEligible: boolean;
  timestamp: string;
}

export interface NursingTranscriptionDetails {
  carePlanId: number;
  timestamp: string;
}

/** ログ収集リクエスト */
export interface ResearchLogInput {
  /** 匿名化ID（anonymizeUserId / anonymizePatientId で生成） */
  anonymizedId: string;
  /** アクション種別 */
  actionType: ResearchLogAction;
  /** 詳細データ（JSON） */
  details?: Record<string, unknown>;
}

/** ログ検索フィルター */
export interface ResearchLogFilter {
  /** 期間開始（inclusive） */
  startDate?: Date;
  /** 期間終了（inclusive） */
  endDate?: Date;
  /** アクション種別フィルター */
  actionType?: ResearchLogAction;
  /** ページネーション */
  page?: number;
  pageSize?: number;
}

/** ログ一覧レスポンス */
export interface ResearchLogListResponse {
  items: ResearchLogItem[];
  totalCount: number;
  page: number;
  pageSize: number;
}

/** ログアイテム */
export interface ResearchLogItem {
  id: bigint;
  anonymizedId: string;
  actionType: string;
  details: Record<string, unknown> | null;
  occurredAt: Date;
}

/** 利用状況サマリー */
export interface UsageSummary {
  /** 期間内のログイン数 */
  loginCount: number;
  /** 機能別の利用回数 */
  featureUsage: Record<string, number>;
  /** ケアプラン作成完了率 */
  carePlanCompletionRate: number;
}

/** 臨床指標サマリー */
export interface ClinicalSummary {
  /** リスク評価の実施率 */
  riskAssessmentRate: number;
  /** ケアプラン作成率 */
  carePlanCreationRate: number;
  /** ケアプラン項目別の作成実施率 */
  itemCreationRates: Record<string, number>;
}

/** ダッシュボードサマリー */
export interface DashboardSummary {
  usage: UsageSummary;
  clinical: ClinicalSummary;
  period: {
    startDate: string;
    endDate: string;
  };
}

/** CSVエクスポートオプション */
export interface CsvExportOptions {
  startDate: Date;
  endDate: Date;
  actionType?: ResearchLogAction;
}
