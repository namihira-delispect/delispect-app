/**
 * エラー情報のサニタイズ処理
 *
 * 本番環境でスタックトレースを非表示にし、
 * 機密情報（患者情報・認証情報等）がエラーメッセージに含まれないようにする。
 */

/** サニタイズ済みエラー情報 */
export interface SanitizedError {
  /** ユーザー向けメッセージ */
  message: string;
  /** エラーの要約（デバッグ用、本番では汎用メッセージ） */
  digest?: string;
}

/**
 * 本番環境かどうかを判定する
 */
function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

/**
 * エラー情報をサニタイズする
 *
 * 本番環境ではスタックトレースを除去し、汎用的なエラーメッセージのみを返す。
 * 開発環境では詳細なエラー情報を返す。
 *
 * @param error - エラーオブジェクト
 * @returns サニタイズ済みエラー情報
 */
export function sanitizeError(error: unknown): SanitizedError {
  if (isProduction()) {
    return {
      message:
        "システムエラーが発生しました。しばらく時間をおいて再度お試しください。",
    };
  }

  // 開発環境: 詳細情報を返す
  if (error instanceof Error) {
    return {
      message: error.message,
      digest: error.stack,
    };
  }

  return {
    message: String(error),
  };
}

/**
 * エラーからメッセージ文字列を安全に取得する
 *
 * @param error - エラーオブジェクト
 * @returns エラーメッセージ文字列
 */
export function getErrorString(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "不明なエラー";
}
