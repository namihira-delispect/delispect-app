/**
 * Result型ヘルパー関数
 *
 * Result型の生成・変換を簡潔に行うためのユーティリティ。
 */

import type { Result } from "@/shared/types";

/**
 * 成功のResult型を生成する
 *
 * @param value - 成功時の値
 * @returns 成功のResult
 *
 * @example
 * ```ts
 * const result = ok({ id: 1, name: "テスト" });
 * // { success: true, value: { id: 1, name: "テスト" } }
 * ```
 */
export function ok<T>(value: T): Result<T> {
  return { success: true, value };
}

/**
 * 失敗のResult型を生成する
 *
 * @param code - エラーコード
 * @param cause - エラー原因
 * @returns 失敗のResult
 *
 * @example
 * ```ts
 * const result = err("NOT_FOUND", "患者が見つかりません");
 * // { success: false, value: { code: "NOT_FOUND", cause: "患者が見つかりません" } }
 * ```
 */
export function err<T>(code: string, cause: unknown): Result<T> {
  return { success: false, value: { code, cause } };
}

/**
 * Result型のmapメソッド（成功時のみ値を変換する）
 *
 * @param result - 元のResult
 * @param fn - 成功時の値を変換する関数
 * @returns 変換後のResult
 */
export function mapResult<T, U>(
  result: Result<T>,
  fn: (value: T) => U,
): Result<U> {
  if (result.success) {
    return ok(fn(result.value));
  }
  return result;
}

/**
 * Result型のflatMapメソッド（成功時のみ別のResult返却関数を適用する）
 *
 * @param result - 元のResult
 * @param fn - 成功時に別のResultを返す関数
 * @returns 変換後のResult
 */
export async function flatMapResult<T, U>(
  result: Result<T>,
  fn: (value: T) => Promise<Result<U>>,
): Promise<Result<U>> {
  if (result.success) {
    return fn(result.value);
  }
  return result;
}

/**
 * try-catchをResult型でラップする
 *
 * @param fn - 実行する非同期関数
 * @param errorCode - エラー時のエラーコード
 * @returns Result型
 *
 * @example
 * ```ts
 * const result = await tryCatch(
 *   () => prisma.patient.findUnique({ where: { id } }),
 *   "DB_ERROR"
 * );
 * ```
 */
export async function tryCatch<T>(
  fn: () => Promise<T>,
  errorCode: string,
): Promise<Result<T>> {
  try {
    const value = await fn();
    return ok(value);
  } catch (error) {
    return err(errorCode, error);
  }
}
