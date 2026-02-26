/**
 * 個人情報マスキングユーティリティ
 *
 * 監査ログ表示時に個人情報をマスキングする。
 * 医療情報セキュリティガイドラインに準拠し、
 * 管理者による調査目的の閲覧時のみマスキング解除可能とする。
 */

/**
 * ユーザー名をマスキングする
 *
 * 先頭1文字と末尾1文字を残し、中間を伏字にする。
 * 2文字以下の場合は先頭1文字のみ残す。
 *
 * @param name - マスキング対象のユーザー名
 * @returns マスキング済みのユーザー名
 *
 * @example
 * ```ts
 * maskUsername("yamada_taro") // "y*********o"
 * maskUsername("ab")          // "a*"
 * maskUsername("a")           // "a"
 * maskUsername("")            // "***"
 * ```
 */
export function maskUsername(name: string): string {
  if (!name) return "***";
  if (name.length <= 1) return name;
  if (name.length === 2) return name[0] + "*";
  return name[0] + "*".repeat(name.length - 2) + name[name.length - 1];
}

/**
 * 患者氏名をマスキングする
 *
 * 姓の1文字目と名の1文字目を残し、残りを伏字にする。
 * 姓名が分離されていない場合は先頭1文字のみ残す。
 *
 * @param lastName - 姓
 * @param firstName - 名
 * @returns マスキング済み氏名（例: 「山○太○」）
 */
export function maskPatientName(
  lastName: string | null | undefined,
  firstName: string | null | undefined,
): string {
  if (!lastName && !firstName) return "***";

  const maskedLast = lastName
    ? lastName[0] + "○".repeat(Math.max(lastName.length - 1, 1))
    : "***";
  const maskedFirst = firstName
    ? firstName[0] + "○".repeat(Math.max(firstName.length - 1, 1))
    : "";

  return maskedFirst ? `${maskedLast}${maskedFirst}` : maskedLast;
}

/**
 * 監査ログのデータフィールドから患者氏名を抽出してマスキングする
 *
 * beforeData/afterDataのJSONフィールドからpatientLastName/patientFirstNameを
 * 検索し、存在する場合はマスキング済み文字列を返す。
 */
export function extractAndMaskPatientName(
  data: Record<string, unknown> | null,
): string | null {
  if (!data) return null;

  const lastName =
    typeof data.patientLastName === "string" ? data.patientLastName : null;
  const firstName =
    typeof data.patientFirstName === "string" ? data.patientFirstName : null;

  if (!lastName && !firstName) return null;

  return maskPatientName(lastName, firstName);
}

/**
 * エクスポート用にデータフィールド内の個人情報をマスキングする
 *
 * JSONデータ内の既知の個人情報フィールドをマスキングした新しいオブジェクトを返す。
 */
export function maskDataFields(
  data: Record<string, unknown> | null,
): Record<string, unknown> | null {
  if (!data) return null;

  const masked = { ...data };

  // 患者氏名のマスキング
  if (typeof masked.patientLastName === "string") {
    masked.patientLastName = maskPatientName(
      masked.patientLastName as string,
      null,
    );
  }
  if (typeof masked.patientFirstName === "string") {
    masked.patientFirstName = maskPatientName(
      null,
      masked.patientFirstName as string,
    );
  }

  // ユーザー氏名のマスキング
  if (typeof masked.username === "string") {
    masked.username = maskUsername(masked.username as string);
  }
  if (typeof masked.actorName === "string") {
    masked.actorName = maskUsername(masked.actorName as string);
  }

  return masked;
}
