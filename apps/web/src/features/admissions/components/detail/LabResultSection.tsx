import type { LabResultDisplay } from "../../types";
import {
  sectionCardStyle,
  sectionTitleStyle,
  tableStyle,
  thStyle,
  tdStyle,
  emptyStyle,
} from "./sectionStyles";

export interface LabResultSectionProps {
  labResults: LabResultDisplay[];
}

/**
 * 日時をフォーマットする（YYYY/MM/DD HH:mm）
 */
function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${y}/${m}/${d} ${h}:${min}`;
}

/**
 * 採血結果セクション
 *
 * CRP、WBC、Ht、Hb等の採血結果と取得日時を表示する。
 */
export function LabResultSection({ labResults }: LabResultSectionProps) {
  return (
    <div style={sectionCardStyle}>
      <h2 style={sectionTitleStyle}>採血結果</h2>
      {labResults.length === 0 ? (
        <div style={emptyStyle}>採血結果データがありません</div>
      ) : (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>項目</th>
              <th style={{ ...thStyle, textAlign: "right" }}>値</th>
              <th style={thStyle}>取得日時</th>
            </tr>
          </thead>
          <tbody>
            {labResults.map((result) => (
              <tr key={result.itemCode}>
                <td style={tdStyle}>{result.itemName}</td>
                <td style={{ ...tdStyle, textAlign: "right" }}>{result.value}</td>
                <td style={tdStyle}>{formatDateTime(result.measuredAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
