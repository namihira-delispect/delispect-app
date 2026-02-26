/**
 * アプリケーション共通エラーコード定義
 *
 * エラーコード体系: {DOMAIN}_{OPERATION}_{ERROR_TYPE}
 * 共通コードは短縮形を使用する。
 */

/** 共通エラーコード */
export const COMMON_ERROR_CODES = {
  /** リソースが見つからない */
  NOT_FOUND: "NOT_FOUND",
  /** 入力検証エラー */
  INVALID_INPUT: "INVALID_INPUT",
  /** 認証エラー */
  UNAUTHORIZED: "UNAUTHORIZED",
  /** 権限不足 */
  FORBIDDEN: "FORBIDDEN",
  /** サーバー内部エラー */
  INTERNAL_ERROR: "INTERNAL_ERROR",
  /** データベースエラー */
  DB_ERROR: "DB_ERROR",
  /** 外部サービスエラー */
  EXTERNAL_SERVICE_ERROR: "EXTERNAL_SERVICE_ERROR",
  /** タイムアウトエラー */
  TIMEOUT: "TIMEOUT",
  /** 不明なエラー */
  UNKNOWN: "UNKNOWN",
} as const;

export type CommonErrorCode =
  (typeof COMMON_ERROR_CODES)[keyof typeof COMMON_ERROR_CODES];

/**
 * エラーコードからユーザー向けメッセージを取得する
 *
 * @param code - エラーコード
 * @returns ユーザー向けエラーメッセージ
 */
export function getErrorMessage(code: string): string {
  const messages: Record<string, string> = {
    [COMMON_ERROR_CODES.NOT_FOUND]:
      "指定されたリソースが見つかりません。URLを確認してください。",
    [COMMON_ERROR_CODES.INVALID_INPUT]:
      "入力内容に誤りがあります。入力内容を確認してください。",
    [COMMON_ERROR_CODES.UNAUTHORIZED]:
      "ログインが必要です。ログイン画面からログインしてください。",
    [COMMON_ERROR_CODES.FORBIDDEN]:
      "この操作を行う権限がありません。管理者にお問い合わせください。",
    [COMMON_ERROR_CODES.INTERNAL_ERROR]:
      "システムエラーが発生しました。しばらく時間をおいて再度お試しください。",
    [COMMON_ERROR_CODES.DB_ERROR]:
      "データベースエラーが発生しました。しばらく時間をおいて再度お試しください。",
    [COMMON_ERROR_CODES.EXTERNAL_SERVICE_ERROR]:
      "外部サービスとの通信に失敗しました。しばらく時間をおいて再度お試しください。",
    [COMMON_ERROR_CODES.TIMEOUT]:
      "処理がタイムアウトしました。しばらく時間をおいて再度お試しください。",
    [COMMON_ERROR_CODES.UNKNOWN]:
      "予期しないエラーが発生しました。しばらく時間をおいて再度お試しください。",
  };

  return (
    messages[code] ??
    "予期しないエラーが発生しました。しばらく時間をおいて再度お試しください。"
  );
}

/**
 * リトライ可能なエラーかどうかを判定する
 *
 * @param code - エラーコード
 * @returns リトライ可能な場合true
 */
export function isRetryableError(code: string): boolean {
  const retryableCodes: string[] = [
    COMMON_ERROR_CODES.INTERNAL_ERROR,
    COMMON_ERROR_CODES.DB_ERROR,
    COMMON_ERROR_CODES.EXTERNAL_SERVICE_ERROR,
    COMMON_ERROR_CODES.TIMEOUT,
    COMMON_ERROR_CODES.UNKNOWN,
  ];

  return retryableCodes.includes(code);
}
