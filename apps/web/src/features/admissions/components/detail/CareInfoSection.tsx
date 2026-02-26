import type { CSSProperties } from "react";
import type { CareInfoDisplay } from "../../types";
import { PRESCRIPTION_TYPE_LABELS, CARE_PLAN_ITEM_STATUS_LABELS } from "../../types";
import {
  sectionCardStyle,
  sectionTitleStyle,
  fieldRowStyle,
  fieldLabelStyle,
  fieldValueStyle,
  tableStyle,
  thStyle,
  tdStyle,
  emptyStyle,
  getBadgeStyle,
} from "./sectionStyles";

export interface CareInfoSectionProps {
  careInfo: CareInfoDisplay;
}

const riskDrugBadge: CSSProperties = getBadgeStyle("#fef2f2", "#dc2626");
const normalDrugBadge: CSSProperties = getBadgeStyle("#f1f5f9", "#64748b");

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
 * ケア関連情報セクション
 *
 * 痛みの状態、便秘の状態、処方薬剤、評価日時を表示する。
 */
export function CareInfoSection({ careInfo }: CareInfoSectionProps) {
  return (
    <div style={sectionCardStyle}>
      <h2 style={sectionTitleStyle}>ケア関連情報</h2>
      <div>
        <div style={fieldRowStyle}>
          <span style={fieldLabelStyle}>痛みの状態</span>
          <span style={fieldValueStyle}>
            {careInfo.painStatus
              ? (CARE_PLAN_ITEM_STATUS_LABELS[careInfo.painStatus] ?? careInfo.painStatus)
              : "-"}
          </span>
        </div>
        <div style={fieldRowStyle}>
          <span style={fieldLabelStyle}>便秘の状態</span>
          <span style={fieldValueStyle}>
            {careInfo.constipationStatus
              ? (CARE_PLAN_ITEM_STATUS_LABELS[careInfo.constipationStatus] ??
                careInfo.constipationStatus)
              : "-"}
          </span>
        </div>
        <div style={fieldRowStyle}>
          <span style={fieldLabelStyle}>評価日時</span>
          <span style={fieldValueStyle}>
            {careInfo.assessedAt ? formatDateTime(careInfo.assessedAt) : "-"}
          </span>
        </div>
      </div>

      {/* 処方薬剤一覧 */}
      <h3
        style={{
          fontSize: "0.875rem",
          fontWeight: 600,
          color: "#475569",
          marginTop: "0.75rem",
          marginBottom: "0.5rem",
        }}
      >
        処方薬剤
      </h3>
      {careInfo.prescriptions.length === 0 ? (
        <div style={emptyStyle}>処方薬剤データがありません</div>
      ) : (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>薬剤名</th>
              <th style={thStyle}>種別</th>
              <th style={thStyle}>リスク</th>
              <th style={thStyle}>処方日時</th>
            </tr>
          </thead>
          <tbody>
            {careInfo.prescriptions.map((prescription, index) => (
              <tr key={index}>
                <td style={tdStyle}>{prescription.drugName}</td>
                <td style={tdStyle}>
                  {PRESCRIPTION_TYPE_LABELS[prescription.prescriptionType] ??
                    prescription.prescriptionType}
                </td>
                <td style={tdStyle}>
                  <span style={prescription.isRiskDrug ? riskDrugBadge : normalDrugBadge}>
                    {prescription.isRiskDrug ? "リスク薬" : "-"}
                  </span>
                </td>
                <td style={tdStyle}>{formatDateTime(prescription.prescribedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
