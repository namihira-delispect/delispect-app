import type { VitalSignDisplay } from "../../types";
import {
  sectionCardStyle,
  sectionTitleStyle,
  fieldRowStyle,
  fieldLabelStyle,
  fieldValueStyle,
  emptyStyle,
} from "./sectionStyles";

export interface VitalSignSectionProps {
  vitalSign: VitalSignDisplay | null;
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
 * バイタルサインセクション
 *
 * 体温、脈拍、血圧、SpO2、取得日時を表示する。
 */
export function VitalSignSection({ vitalSign }: VitalSignSectionProps) {
  return (
    <div style={sectionCardStyle}>
      <h2 style={sectionTitleStyle}>バイタルサイン</h2>
      {!vitalSign ? (
        <div style={emptyStyle}>バイタルサインデータがありません</div>
      ) : (
        <div>
          <div style={fieldRowStyle}>
            <span style={fieldLabelStyle}>体温</span>
            <span style={fieldValueStyle}>
              {vitalSign.bodyTemperature != null
                ? `${vitalSign.bodyTemperature} °C`
                : "-"}
            </span>
          </div>
          <div style={fieldRowStyle}>
            <span style={fieldLabelStyle}>脈拍</span>
            <span style={fieldValueStyle}>
              {vitalSign.pulse != null ? `${vitalSign.pulse} bpm` : "-"}
            </span>
          </div>
          <div style={fieldRowStyle}>
            <span style={fieldLabelStyle}>血圧</span>
            <span style={fieldValueStyle}>
              {vitalSign.systolicBp != null && vitalSign.diastolicBp != null
                ? `${vitalSign.systolicBp}/${vitalSign.diastolicBp} mmHg`
                : "-"}
            </span>
          </div>
          <div style={fieldRowStyle}>
            <span style={fieldLabelStyle}>SpO2</span>
            <span style={fieldValueStyle}>
              {vitalSign.spo2 != null ? `${vitalSign.spo2} %` : "-"}
            </span>
          </div>
          <div style={fieldRowStyle}>
            <span style={fieldLabelStyle}>測定日時</span>
            <span style={fieldValueStyle}>{formatDateTime(vitalSign.measuredAt)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
