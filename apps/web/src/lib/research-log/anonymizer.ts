/**
 * 匿名化ユーティリティ
 *
 * 解析用操作ログに記録するIDを不可逆な匿名化IDに変換する。
 * SHA-256ハッシュ + ソルトにより、元のIDへの逆引きを防止する。
 * 同一IDからは同一の匿名化IDが生成されるため、行動追跡は可能。
 */

import { createHash } from "crypto";

/**
 * 匿名化用ソルト
 *
 * 環境変数から取得し、設定されていない場合はデフォルト値を使用する。
 * 本番環境では必ず環境変数で設定すること。
 */
const ANONYMIZATION_SALT =
  process.env.RESEARCH_LOG_ANONYMIZATION_SALT ?? "delispect-research-log-salt-default";

/**
 * IDを不可逆な匿名化IDに変換する
 *
 * SHA-256ハッシュを使用し、ソルトを付加して計算する。
 * 同一の入力からは常に同一のハッシュが生成される。
 *
 * @param entityType - エンティティ種別（"user" | "patient" など）
 * @param entityId - 元のID（数値または文字列）
 * @returns 64文字の16進数文字列（SHA-256ハッシュ値）
 */
export function anonymizeId(entityType: string, entityId: number | string): string {
  const input = `${ANONYMIZATION_SALT}:${entityType}:${String(entityId)}`;
  return createHash("sha256").update(input).digest("hex");
}

/**
 * ユーザーIDを匿名化する
 *
 * @param userId - ユーザーID
 * @returns 匿名化されたユーザーID
 */
export function anonymizeUserId(userId: number): string {
  return anonymizeId("user", userId);
}

/**
 * 患者IDを匿名化する
 *
 * @param patientId - 患者ID（内部ID）
 * @returns 匿名化された患者ID
 */
export function anonymizePatientId(patientId: number): string {
  return anonymizeId("patient", patientId);
}
