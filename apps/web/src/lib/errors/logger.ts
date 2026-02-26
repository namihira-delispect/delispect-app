/**
 * 構造化ログ出力モジュール
 *
 * アプリケーション全体で統一的なログ出力を行う。
 * 個人情報・機密情報のマスキング処理を含む。
 */

/** ログレベル */
export type LogLevel = "error" | "warn" | "info" | "debug";

/** ログコンテキスト */
export interface LogContext {
  [key: string]: unknown;
}

/** マスキング対象のキー（患者情報・認証情報等） */
const SENSITIVE_KEYS = new Set([
  "password",
  "passwordHash",
  "token",
  "accessToken",
  "refreshToken",
  "secret",
  "patientName",
  "patientAddress",
  "phoneNumber",
  "email",
  "birthDate",
  "ssn",
  "insuranceNumber",
]);

/**
 * コンテキスト内の機密情報をマスキングする
 *
 * @param context - ログコンテキスト
 * @returns マスキング済みコンテキスト
 */
export function maskSensitiveData(context: LogContext): LogContext {
  const masked: LogContext = {};

  for (const [key, value] of Object.entries(context)) {
    if (SENSITIVE_KEYS.has(key)) {
      masked[key] = "[MASKED]";
    } else if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      masked[key] = maskSensitiveData(value as LogContext);
    } else {
      masked[key] = value;
    }
  }

  return masked;
}

/**
 * 本番環境かどうかを判定する
 */
function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

/**
 * 構造化ログを出力する
 *
 * @param level - ログレベル
 * @param message - ログメッセージ
 * @param context - ログコンテキスト
 */
function log(level: LogLevel, message: string, context?: LogContext): void {
  // デバッグログは開発環境のみ出力
  if (level === "debug" && isProduction()) {
    return;
  }

  const maskedContext = context ? maskSensitiveData(context) : undefined;

  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(maskedContext && { context: maskedContext }),
  };

  switch (level) {
    case "error":
      console.error(JSON.stringify(logEntry));
      break;
    case "warn":
      console.warn(JSON.stringify(logEntry));
      break;
    case "info":
      console.info(JSON.stringify(logEntry));
      break;
    case "debug":
      console.debug(JSON.stringify(logEntry));
      break;
  }
}

/**
 * 構造化ロガー
 *
 * @example
 * ```ts
 * logger.info("Patient created", { patientId: "123", userId: "456" });
 * logger.error("Failed to create patient", { error, userId: "456" });
 * ```
 */
export const logger = {
  error: (message: string, context?: LogContext) => log("error", message, context),
  warn: (message: string, context?: LogContext) => log("warn", message, context),
  info: (message: string, context?: LogContext) => log("info", message, context),
  debug: (message: string, context?: LogContext) => log("debug", message, context),
};
