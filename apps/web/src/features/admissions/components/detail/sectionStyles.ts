import type { CSSProperties } from "react";

/** セクションカードのスタイル */
export const sectionCardStyle: CSSProperties = {
  border: "1px solid #e2e8f0",
  borderRadius: "0.5rem",
  padding: "1rem",
  backgroundColor: "#ffffff",
};

/** セクションタイトルのスタイル */
export const sectionTitleStyle: CSSProperties = {
  fontSize: "1rem",
  fontWeight: 600,
  color: "#1e293b",
  marginBottom: "0.75rem",
  paddingBottom: "0.5rem",
  borderBottom: "1px solid #e2e8f0",
};

/** ラベル・値ペアのスタイル */
export const fieldRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  padding: "0.375rem 0",
  borderBottom: "1px solid #f1f5f9",
};

/** フィールドラベルのスタイル */
export const fieldLabelStyle: CSSProperties = {
  fontSize: "0.8125rem",
  color: "#64748b",
  fontWeight: 500,
};

/** フィールド値のスタイル */
export const fieldValueStyle: CSSProperties = {
  fontSize: "0.8125rem",
  color: "#1e293b",
  fontWeight: 500,
  textAlign: "right",
};

/** 空データのスタイル */
export const emptyStyle: CSSProperties = {
  fontSize: "0.8125rem",
  color: "#94a3b8",
  textAlign: "center",
  padding: "1rem",
};

/** テーブルスタイル */
export const tableStyle: CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: "0.8125rem",
};

/** テーブルヘッダーのスタイル */
export const thStyle: CSSProperties = {
  padding: "0.375rem 0.5rem",
  backgroundColor: "#f8fafc",
  borderBottom: "2px solid #e2e8f0",
  textAlign: "left",
  fontWeight: 600,
  color: "#475569",
  fontSize: "0.75rem",
};

/** テーブルデータセルのスタイル */
export const tdStyle: CSSProperties = {
  padding: "0.375rem 0.5rem",
  borderBottom: "1px solid #e2e8f0",
  color: "#1e293b",
};

/** バッジスタイル生成関数 */
export function getBadgeStyle(bgColor: string, textColor: string): CSSProperties {
  return {
    display: "inline-block",
    padding: "0.125rem 0.5rem",
    borderRadius: "9999px",
    fontSize: "0.75rem",
    fontWeight: 500,
    backgroundColor: bgColor,
    color: textColor,
  };
}
