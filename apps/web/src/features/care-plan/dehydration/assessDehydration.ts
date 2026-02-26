/**
 * 脱水ケアプラン：アセスメントロジック
 *
 * 入力された脱水アセスメント詳細データから、
 * 脱水リスクレベルと対処提案を生成する。
 */

import type {
  DehydrationDetails,
  DehydrationAssessmentResult,
  DehydrationProposal,
  LabValueAnswer,
} from "./types";
import { DEHYDRATION_RISK_LEVEL_LABELS } from "./types";

/**
 * 採血結果の逸脱を判定する
 */
export function evaluateLabDeviation(
  lab: LabValueAnswer | null,
): "NORMAL" | "HIGH" | "LOW" | "NO_DATA" {
  if (!lab || lab.value === null) {
    return "NO_DATA";
  }
  if (lab.upperLimit !== null && lab.value > lab.upperLimit) {
    return "HIGH";
  }
  if (lab.lowerLimit !== null && lab.value < lab.lowerLimit) {
    return "LOW";
  }
  return "NORMAL";
}

/**
 * 脱水の総合リスクスコアを算出する
 *
 * 各項目の異常度に応じてスコアを加算し、
 * 総合リスクレベルを決定する。
 */
export function calculateDehydrationRiskScore(details: DehydrationDetails): number {
  let score = 0;

  // 採血結果（Ht高値 = 脱水の可能性）
  if (details.labHt) {
    const htDeviation = evaluateLabDeviation(details.labHt);
    if (htDeviation === "HIGH") score += 3;
    else if (htDeviation === "LOW") score += 1;
  }

  // 採血結果（Hb高値 = 脱水の可能性）
  if (details.labHb) {
    const hbDeviation = evaluateLabDeviation(details.labHb);
    if (hbDeviation === "HIGH") score += 3;
    else if (hbDeviation === "LOW") score += 1;
  }

  // 脈拍（頻脈 > 100bpm は脱水サイン）
  if (details.vitalPulse !== null) {
    if (details.vitalPulse > 100) score += 2;
    else if (details.vitalPulse > 90) score += 1;
  }

  // 血圧（低血圧は脱水サイン）
  if (details.vitalSystolicBp !== null) {
    if (details.vitalSystolicBp < 90) score += 3;
    else if (details.vitalSystolicBp < 100) score += 2;
  }

  // 目視確認
  const visualFields = [
    details.visualSkin,
    details.visualOral,
    details.visualDizziness,
    details.visualUrine,
  ];
  for (const field of visualFields) {
    if (field === "SEVERE") score += 2;
    else if (field === "MILD") score += 1;
  }

  // 水分摂取頻度
  if (details.intakeFrequency === "RARE") score += 3;
  else if (details.intakeFrequency === "MODERATE") score += 1;

  // 水分摂取量
  if (details.intakeAmount !== null) {
    if (details.intakeAmount < 500) score += 3;
    else if (details.intakeAmount < 1000) score += 2;
    else if (details.intakeAmount < 1500) score += 1;
  }

  return score;
}

/**
 * リスクスコアからリスクレベルを判定する
 */
export function determineRiskLevel(score: number): "HIGH" | "MODERATE" | "LOW" | "NONE" {
  if (score >= 10) return "HIGH";
  if (score >= 5) return "MODERATE";
  if (score >= 1) return "LOW";
  return "NONE";
}

/**
 * 脱水の対処提案を生成する
 */
export function generateDehydrationProposals(details: DehydrationDetails): DehydrationProposal[] {
  const proposals: DehydrationProposal[] = [];

  // 採血結果に基づく提案
  const htDeviation = evaluateLabDeviation(details.labHt);
  const hbDeviation = evaluateLabDeviation(details.labHb);

  if (htDeviation === "HIGH" || hbDeviation === "HIGH") {
    proposals.push({
      id: "dehydration_lab_high",
      category: "dehydration",
      message:
        "採血結果にて脱水の兆候が見られます。医師に報告し、輸液の必要性について相談してください。",
      priority: 1,
    });
  }

  // バイタルサインに基づく提案
  if (details.vitalSystolicBp !== null && details.vitalSystolicBp < 100) {
    proposals.push({
      id: "dehydration_bp_low",
      category: "dehydration",
      message: "血圧低下が見られます。起立性低血圧に注意し、ゆっくり体位変換を行ってください。",
      priority: 1,
    });
  }

  if (details.vitalPulse !== null && details.vitalPulse > 100) {
    proposals.push({
      id: "dehydration_pulse_high",
      category: "dehydration",
      message: "頻脈が見られます。脱水による循環血液量低下の可能性があります。",
      priority: 2,
    });
  }

  // 目視確認に基づく提案
  if (details.visualSkin === "SEVERE" || details.visualOral === "SEVERE") {
    proposals.push({
      id: "dehydration_visual_severe",
      category: "dehydration",
      message:
        "皮膚・口腔の乾燥が著明です。脱水の進行が疑われます。経口補水または輸液を検討してください。",
      priority: 1,
    });
  } else if (details.visualSkin === "MILD" || details.visualOral === "MILD") {
    proposals.push({
      id: "dehydration_visual_mild",
      category: "dehydration",
      message: "軽度の皮膚・口腔乾燥が見られます。こまめな水分補給を促してください。",
      priority: 3,
    });
  }

  if (details.visualDizziness === "SEVERE") {
    proposals.push({
      id: "dehydration_dizziness_severe",
      category: "dehydration",
      message: "たちくらみ・ふらつきが強くあります。転倒リスクに注意し、安静を保ってください。",
      priority: 1,
    });
  } else if (details.visualDizziness === "MILD") {
    proposals.push({
      id: "dehydration_dizziness_mild",
      category: "dehydration",
      message: "軽度のたちくらみ・ふらつきがあります。急な体位変換を避けてください。",
      priority: 3,
    });
  }

  if (details.visualUrine === "SEVERE") {
    proposals.push({
      id: "dehydration_urine_severe",
      category: "dehydration",
      message: "尿の濃縮が著明です。脱水の進行が疑われます。水分摂取を増やしてください。",
      priority: 2,
    });
  }

  // 水分摂取に基づく提案
  if (details.intakeFrequency === "RARE") {
    proposals.push({
      id: "intake_frequency_rare",
      category: "intake",
      message: "水分摂取頻度が不足しています。1時間に1回以上の水分摂取を目標としてください。",
      priority: 2,
    });
  } else if (details.intakeFrequency === "MODERATE") {
    proposals.push({
      id: "intake_frequency_moderate",
      category: "intake",
      message: "水分摂取頻度を意識し、こまめな水分補給を心がけてください。",
      priority: 4,
    });
  }

  if (details.intakeAmount !== null) {
    if (details.intakeAmount < 500) {
      proposals.push({
        id: "intake_amount_very_low",
        category: "intake",
        message:
          "1日の水分摂取量が著しく不足しています。少なくとも1,500ml/日を目標に摂取を促してください。経口摂取が困難な場合は輸液を検討してください。",
        priority: 1,
      });
    } else if (details.intakeAmount < 1000) {
      proposals.push({
        id: "intake_amount_low",
        category: "intake",
        message: "1日の水分摂取量が不足しています。1,500ml/日を目標に水分摂取を促してください。",
        priority: 2,
      });
    } else if (details.intakeAmount < 1500) {
      proposals.push({
        id: "intake_amount_moderate",
        category: "intake",
        message: "水分摂取量をもう少し増やしましょう。1,500ml/日以上の摂取が推奨されます。",
        priority: 3,
      });
    }
  }

  // 優先度で昇順ソート
  proposals.sort((a, b) => a.priority - b.priority);

  return proposals;
}

/**
 * 指示テキストを生成する
 */
export function generateInstructions(riskLevel: string, proposals: DehydrationProposal[]): string {
  const lines: string[] = [];
  lines.push(`【脱水評価】${DEHYDRATION_RISK_LEVEL_LABELS[riskLevel] ?? riskLevel}`);
  lines.push("");

  if (proposals.length === 0) {
    lines.push("現時点で特別な対処は不要です。引き続き水分摂取の状況を観察してください。");
  } else {
    lines.push("【対処提案】");
    for (const proposal of proposals) {
      lines.push(`- ${proposal.message}`);
    }
  }

  return lines.join("\n");
}

/**
 * 脱水アセスメントを実行する
 *
 * 入力されたアセスメント詳細データから、
 * 脱水リスクレベルと対処提案を生成して返す。
 */
export function assessDehydration(details: DehydrationDetails): DehydrationAssessmentResult {
  const score = calculateDehydrationRiskScore(details);
  const riskLevel = determineRiskLevel(score);
  const proposals = generateDehydrationProposals(details);
  const instructions = generateInstructions(riskLevel, proposals);

  return {
    riskLevel,
    riskLevelLabel: DEHYDRATION_RISK_LEVEL_LABELS[riskLevel] ?? riskLevel,
    proposals,
    instructions,
  };
}
