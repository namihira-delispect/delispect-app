"use client";

import type { CSSProperties } from "react";
import type { VitalSignEntry } from "../types";

export interface VitalSignsStepProps {
  vitalSigns: VitalSignEntry | null;
  onBack: () => void;
  onNext: () => void;
}

const containerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
};

const titleStyle: CSSProperties = {
  fontSize: "1.125rem",
  fontWeight: 600,
  color: "#1e293b",
  marginBottom: "0.5rem",
};

const descriptionStyle: CSSProperties = {
  fontSize: "0.875rem",
  color: "#64748b",
  marginBottom: "1rem",
};

const gridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: "1rem",
};

const cardStyle: CSSProperties = {
  border: "1px solid #e2e8f0",
  borderRadius: "0.5rem",
  padding: "1rem",
  backgroundColor: "#ffffff",
};

const cardLabelStyle: CSSProperties = {
  fontSize: "0.75rem",
  color: "#64748b",
  fontWeight: 500,
  marginBottom: "0.25rem",
};

const cardValueStyle: CSSProperties = {
  fontSize: "1.25rem",
  fontWeight: 700,
  color: "#1e293b",
};

const cardUnitStyle: CSSProperties = {
  fontSize: "0.75rem",
  color: "#94a3b8",
  marginLeft: "0.25rem",
};

const noDataStyle: CSSProperties = {
  textAlign: "center",
  padding: "2rem",
  color: "#94a3b8",
  fontSize: "0.875rem",
};

const noteStyle: CSSProperties = {
  fontSize: "0.75rem",
  color: "#94a3b8",
  fontStyle: "italic",
  marginTop: "0.5rem",
};

const dateStyle: CSSProperties = {
  fontSize: "0.75rem",
  color: "#94a3b8",
  marginTop: "0.5rem",
};

const buttonContainerStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  marginTop: "1rem",
};

const backButtonStyle: CSSProperties = {
  padding: "0.5rem 1.5rem",
  backgroundColor: "transparent",
  color: "#64748b",
  border: "1px solid #e2e8f0",
  borderRadius: "0.375rem",
  fontSize: "0.875rem",
  fontWeight: 500,
  cursor: "pointer",
};

const nextButtonStyle: CSSProperties = {
  padding: "0.5rem 1.5rem",
  backgroundColor: "#3b82f6",
  color: "#ffffff",
  border: "none",
  borderRadius: "0.375rem",
  fontSize: "0.875rem",
  fontWeight: 500,
  cursor: "pointer",
};

function formatDate(isoString: string | null): string {
  if (!isoString) return "";
  const date = new Date(isoString);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${y}/${m}/${d} ${h}:${min}`;
}

function formatBp(systolic: number | null, diastolic: number | null): string {
  if (systolic === null && diastolic === null) return "-";
  return `${systolic ?? "-"}/${diastolic ?? "-"}`;
}

/**
 * バイタルサイン確認ステップ
 *
 * 脈拍・血圧・SpO2を表示する。
 * 年齢の影響が出やすいため基準値は表示しない。
 */
export function VitalSignsStep({ vitalSigns, onBack, onNext }: VitalSignsStepProps) {
  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>バイタルサインの確認</h2>
      <p style={descriptionStyle}>
        脈拍・血圧・SpO2を確認します。年齢の影響が出やすいため基準値は表示しません。
      </p>

      {!vitalSigns ? (
        <div style={noDataStyle}>
          バイタルサインが取得されていません。電子カルテとの同期を確認してください。
        </div>
      ) : (
        <>
          <div style={gridStyle}>
            <div style={cardStyle}>
              <div style={cardLabelStyle}>脈拍</div>
              <div>
                <span style={cardValueStyle}>
                  {vitalSigns.pulse !== null ? vitalSigns.pulse : "-"}
                </span>
                <span style={cardUnitStyle}>bpm</span>
              </div>
            </div>

            <div style={cardStyle}>
              <div style={cardLabelStyle}>血圧</div>
              <div>
                <span style={cardValueStyle}>
                  {formatBp(vitalSigns.systolicBp, vitalSigns.diastolicBp)}
                </span>
                <span style={cardUnitStyle}>mmHg</span>
              </div>
            </div>

            <div style={cardStyle}>
              <div style={cardLabelStyle}>SpO2</div>
              <div>
                <span style={cardValueStyle}>
                  {vitalSigns.spo2 !== null ? vitalSigns.spo2 : "-"}
                </span>
                <span style={cardUnitStyle}>%</span>
              </div>
            </div>

            <div style={cardStyle}>
              <div style={cardLabelStyle}>体温</div>
              <div>
                <span style={cardValueStyle}>
                  {vitalSigns.bodyTemperature !== null ? vitalSigns.bodyTemperature : "-"}
                </span>
                <span style={cardUnitStyle}>度</span>
              </div>
            </div>
          </div>

          {vitalSigns.measuredAt && (
            <div style={dateStyle}>測定日時: {formatDate(vitalSigns.measuredAt)}</div>
          )}
        </>
      )}

      <div style={noteStyle}>
        ※ 脈拍・血圧・SpO2は年齢の影響が出やすいため、基準値は表示していません。
      </div>

      <div style={buttonContainerStyle}>
        <button onClick={onBack} style={backButtonStyle}>
          戻る
        </button>
        <button onClick={onNext} style={nextButtonStyle}>
          次へ
        </button>
      </div>
    </div>
  );
}
