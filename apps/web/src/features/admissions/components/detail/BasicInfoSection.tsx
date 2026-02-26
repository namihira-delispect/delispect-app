import type { AdmissionDetailResponse } from "../../types";
import { GENDER_LABELS } from "../../types";
import {
  sectionCardStyle,
  sectionTitleStyle,
  fieldRowStyle,
  fieldLabelStyle,
  fieldValueStyle,
} from "./sectionStyles";

export interface BasicInfoSectionProps {
  detail: AdmissionDetailResponse;
}

/**
 * 基本情報セクション
 *
 * 患者ID、氏名、年齢、性別、入院日、病棟、主治医を表示する。
 */
export function BasicInfoSection({ detail }: BasicInfoSectionProps) {
  return (
    <div style={sectionCardStyle}>
      <h2 style={sectionTitleStyle}>基本情報</h2>
      <div>
        <div style={fieldRowStyle}>
          <span style={fieldLabelStyle}>患者ID</span>
          <span style={fieldValueStyle}>{detail.patientId}</span>
        </div>
        <div style={fieldRowStyle}>
          <span style={fieldLabelStyle}>氏名</span>
          <span style={fieldValueStyle}>
            {detail.patientName}
            {detail.patientNameKana && (
              <span style={{ color: "#94a3b8", marginLeft: "0.5rem", fontSize: "0.75rem" }}>
                ({detail.patientNameKana})
              </span>
            )}
          </span>
        </div>
        <div style={fieldRowStyle}>
          <span style={fieldLabelStyle}>年齢</span>
          <span style={fieldValueStyle}>
            {detail.age != null ? `${detail.age}歳` : "-"}
          </span>
        </div>
        <div style={fieldRowStyle}>
          <span style={fieldLabelStyle}>性別</span>
          <span style={fieldValueStyle}>
            {GENDER_LABELS[detail.gender] ?? detail.gender}
          </span>
        </div>
        <div style={fieldRowStyle}>
          <span style={fieldLabelStyle}>入院日</span>
          <span style={fieldValueStyle}>
            {detail.admissionDate.replace(/-/g, "/")}
          </span>
        </div>
        {detail.dischargeDate && (
          <div style={fieldRowStyle}>
            <span style={fieldLabelStyle}>退院日</span>
            <span style={fieldValueStyle}>
              {detail.dischargeDate.replace(/-/g, "/")}
            </span>
          </div>
        )}
        <div style={fieldRowStyle}>
          <span style={fieldLabelStyle}>病棟</span>
          <span style={fieldValueStyle}>{detail.ward ?? "-"}</span>
        </div>
        <div style={fieldRowStyle}>
          <span style={fieldLabelStyle}>病室</span>
          <span style={fieldValueStyle}>{detail.room ?? "-"}</span>
        </div>
        <div style={fieldRowStyle}>
          <span style={fieldLabelStyle}>主治医</span>
          <span style={fieldValueStyle}>{detail.attendingDoctor ?? "-"}</span>
        </div>
      </div>
    </div>
  );
}
