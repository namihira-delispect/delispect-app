/**
 * ダッシュボード集計機能
 *
 * 利用状況サマリーおよび臨床指標サマリーの集計を行う。
 */

import { prisma } from "@delispect/db";
import { RESEARCH_LOG_ACTIONS } from "./types";
import type { UsageSummary, ClinicalSummary, DashboardSummary } from "./types";

/** ケアプラン項目カテゴリ一覧 */
const CARE_PLAN_CATEGORIES = [
  "MEDICATION",
  "PAIN",
  "DEHYDRATION",
  "CONSTIPATION",
  "INFLAMMATION",
  "MOBILITY",
  "DEMENTIA",
  "SAFETY",
  "SLEEP",
] as const;

/**
 * ダッシュボードサマリーを取得する
 *
 * @param startDate - 集計期間開始日
 * @param endDate - 集計期間終了日
 * @returns ダッシュボードサマリー
 */
export async function getDashboardSummary(
  startDate: Date,
  endDate: Date,
): Promise<DashboardSummary> {
  const [usage, clinical] = await Promise.all([
    getUsageSummary(startDate, endDate),
    getClinicalSummary(startDate, endDate),
  ]);

  return {
    usage,
    clinical,
    period: {
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
    },
  };
}

/**
 * 利用状況サマリーを取得する
 *
 * @param startDate - 集計期間開始日
 * @param endDate - 集計期間終了日
 * @returns 利用状況サマリー
 */
export async function getUsageSummary(
  startDate: Date,
  endDate: Date,
): Promise<UsageSummary> {
  const dateFilter = {
    occurredAt: {
      gte: startDate,
      lte: endDate,
    },
  };

  // ログイン数の取得
  const loginCount = await prisma.researchLog.count({
    where: {
      ...dateFilter,
      actionType: RESEARCH_LOG_ACTIONS.USER_LOGIN,
    },
  });

  // 機能別利用回数の取得
  const featureActions = [
    RESEARCH_LOG_ACTIONS.EMR_SYNC_COMPLETE,
    RESEARCH_LOG_ACTIONS.RISK_ASSESSMENT_COMPLETE,
    RESEARCH_LOG_ACTIONS.CARE_PLAN_COMPLETE,
    RESEARCH_LOG_ACTIONS.HIGH_RISK_KASAN_ASSESS,
    RESEARCH_LOG_ACTIONS.NURSING_TRANSCRIPTION,
  ];

  const featureUsageCounts = await Promise.all(
    featureActions.map(async (action) => {
      const count = await prisma.researchLog.count({
        where: {
          ...dateFilter,
          actionType: action,
        },
      });
      return { action, count };
    }),
  );

  const featureUsage: Record<string, number> = {};
  for (const { action, count } of featureUsageCounts) {
    featureUsage[action] = count;
  }

  // ケアプラン作成完了率
  const carePlanStartCount = await prisma.researchLog.count({
    where: {
      ...dateFilter,
      actionType: RESEARCH_LOG_ACTIONS.CARE_PLAN_START,
    },
  });

  const carePlanCompleteCount = await prisma.researchLog.count({
    where: {
      ...dateFilter,
      actionType: RESEARCH_LOG_ACTIONS.CARE_PLAN_COMPLETE,
    },
  });

  const carePlanCompletionRate =
    carePlanStartCount > 0 ? carePlanCompleteCount / carePlanStartCount : 0;

  return {
    loginCount,
    featureUsage,
    carePlanCompletionRate,
  };
}

/**
 * 臨床指標サマリーを取得する
 *
 * @param startDate - 集計期間開始日
 * @param endDate - 集計期間終了日
 * @returns 臨床指標サマリー
 */
export async function getClinicalSummary(
  startDate: Date,
  endDate: Date,
): Promise<ClinicalSummary> {
  const dateFilter = {
    occurredAt: {
      gte: startDate,
      lte: endDate,
    },
  };

  // リスク評価実施率（EMR同期完了 = 対象患者数、リスク評価完了 = 実施数）
  const emrSyncCount = await prisma.researchLog.count({
    where: {
      ...dateFilter,
      actionType: RESEARCH_LOG_ACTIONS.EMR_SYNC_COMPLETE,
    },
  });

  const riskAssessmentCount = await prisma.researchLog.count({
    where: {
      ...dateFilter,
      actionType: RESEARCH_LOG_ACTIONS.RISK_ASSESSMENT_COMPLETE,
    },
  });

  const riskAssessmentRate =
    emrSyncCount > 0 ? riskAssessmentCount / emrSyncCount : 0;

  // ケアプラン作成率（リスク評価済み患者に対するケアプラン作成割合）
  const carePlanCompleteCount = await prisma.researchLog.count({
    where: {
      ...dateFilter,
      actionType: RESEARCH_LOG_ACTIONS.CARE_PLAN_COMPLETE,
    },
  });

  const carePlanCreationRate =
    riskAssessmentCount > 0 ? carePlanCompleteCount / riskAssessmentCount : 0;

  // ケアプラン項目別の作成実施率
  const itemCreationRates: Record<string, number> = {};

  // ケアプランステップ完了ログから項目別の実施率を算出
  if (carePlanCompleteCount > 0) {
    const stepLogs = await prisma.researchLog.findMany({
      where: {
        ...dateFilter,
        actionType: RESEARCH_LOG_ACTIONS.CARE_PLAN_STEP_COMPLETE,
      },
      select: { details: true },
    });

    const categoryCounts: Record<string, number> = {};
    for (const log of stepLogs) {
      const details = log.details as Record<string, unknown> | null;
      const category = details?.category as string | undefined;
      if (category) {
        categoryCounts[category] = (categoryCounts[category] ?? 0) + 1;
      }
    }

    for (const category of CARE_PLAN_CATEGORIES) {
      const count = categoryCounts[category] ?? 0;
      itemCreationRates[category] = count / carePlanCompleteCount;
    }
  } else {
    for (const category of CARE_PLAN_CATEGORIES) {
      itemCreationRates[category] = 0;
    }
  }

  return {
    riskAssessmentRate,
    carePlanCreationRate,
    itemCreationRates,
  };
}
