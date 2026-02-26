/**
 * 電子カルテ同期結果表示パネル
 *
 * 同期処理の結果（成功/失敗件数、詳細）を表示する。
 * 失敗レコードがある場合は入院IDの一覧も表示する。
 */

import type { CSSProperties } from "react";
import type { EmrSyncResult } from "../types";

const panelStyle: CSSProperties = {
  marginTop: "1rem",
  border: "1px solid #e2e8f0",
  borderRadius: "0.5rem",
  padding: "1.5rem",
  backgroundColor: "#ffffff",
};

const successPanelStyle: CSSProperties = {
  ...panelStyle,
  borderColor: "#86efac",
  backgroundColor: "#f0fdf4",
};

const partialPanelStyle: CSSProperties = {
  ...panelStyle,
  borderColor: "#fde68a",
  backgroundColor: "#fffbeb",
};

const titleStyle: CSSProperties = {
  fontSize: "1rem",
  fontWeight: 600,
  marginBottom: "0.75rem",
};

const successTitleStyle: CSSProperties = {
  ...titleStyle,
  color: "#16a34a",
};

const partialTitleStyle: CSSProperties = {
  ...titleStyle,
  color: "#d97706",
};

const gridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
  gap: "0.75rem",
  marginBottom: "0.75rem",
};

const statItemStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.125rem",
};

const statLabelStyle: CSSProperties = {
  fontSize: "0.75rem",
  color: "#64748b",
};

const statValueStyle: CSSProperties = {
  fontSize: "1.125rem",
  fontWeight: 600,
  color: "#1e293b",
};

const failedListStyle: CSSProperties = {
  marginTop: "0.75rem",
  padding: "0.75rem",
  backgroundColor: "#fef2f2",
  borderRadius: "0.375rem",
  border: "1px solid #fecaca",
};

const failedListTitleStyle: CSSProperties = {
  fontSize: "0.875rem",
  fontWeight: 600,
  color: "#dc2626",
  marginBottom: "0.5rem",
};

const failedItemStyle: CSSProperties = {
  fontSize: "0.875rem",
  color: "#7f1d1d",
  fontFamily: "monospace",
};

const timeInfoStyle: CSSProperties = {
  fontSize: "0.75rem",
  color: "#94a3b8",
  marginTop: "0.5rem",
};

interface EmrSyncResultPanelProps {
  result: EmrSyncResult;
}

export function EmrSyncResultPanel({ result }: EmrSyncResultPanelProps) {
  const hasFailures = result.failedCount > 0;
  const panelContainerStyle = hasFailures ? partialPanelStyle : successPanelStyle;
  const panelTitleStyle = hasFailures ? partialTitleStyle : successTitleStyle;
  const panelTitleText = hasFailures
    ? "同期完了（一部失敗あり）"
    : "同期完了";

  return (
    <div style={panelContainerStyle} role="status">
      <div style={panelTitleStyle}>{panelTitleText}</div>

      <div style={gridStyle}>
        <div style={statItemStyle}>
          <span style={statLabelStyle}>処理入院数</span>
          <span style={statValueStyle}>{result.totalAdmissions}</span>
        </div>
        <div style={statItemStyle}>
          <span style={statLabelStyle}>成功</span>
          <span style={statValueStyle}>{result.successCount}</span>
        </div>
        <div style={statItemStyle}>
          <span style={statLabelStyle}>失敗</span>
          <span style={{ ...statValueStyle, color: hasFailures ? "#dc2626" : "#1e293b" }}>
            {result.failedCount}
          </span>
        </div>
        <div style={statItemStyle}>
          <span style={statLabelStyle}>バイタルサイン</span>
          <span style={statValueStyle}>{result.vitalSignCount}件</span>
        </div>
        <div style={statItemStyle}>
          <span style={statLabelStyle}>検査値</span>
          <span style={statValueStyle}>{result.labResultCount}件</span>
        </div>
        <div style={statItemStyle}>
          <span style={statLabelStyle}>処方</span>
          <span style={statValueStyle}>{result.prescriptionCount}件</span>
        </div>
      </div>

      {hasFailures && (
        <div style={failedListStyle}>
          <div style={failedListTitleStyle}>失敗した入院ID一覧</div>
          {result.failedAdmissionIds.map((id) => (
            <div key={id} style={failedItemStyle}>
              {id}
            </div>
          ))}
        </div>
      )}

      <div style={timeInfoStyle}>
        開始: {new Date(result.startedAt).toLocaleString("ja-JP")} / 完了:{" "}
        {new Date(result.completedAt).toLocaleString("ja-JP")}
      </div>
    </div>
  );
}
