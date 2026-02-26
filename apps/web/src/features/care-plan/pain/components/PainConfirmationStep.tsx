"use client";

import type { CSSProperties } from "react";
import type { PainCarePlanDetails, PainMedicationInfo } from "../types";
import { PAIN_SITE_MAP, LIFE_IMPACT_ITEMS } from "../types";

export interface PainConfirmationStepProps {
  /** 疼痛ケアプランの詳細データ */
  details: PainCarePlanDetails;
  /** 痛み止め処方一覧 */
  medications: PainMedicationInfo[];
}

const containerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "1.25rem",
};

const titleStyle: CSSProperties = {
  fontSize: "1rem",
  fontWeight: 600,
  color: "#1e293b",
};

const sectionStyle: CSSProperties = {
  border: "1px solid #e2e8f0",
  borderRadius: "0.5rem",
  overflow: "hidden",
};

const sectionHeaderStyle: CSSProperties = {
  padding: "0.625rem 1rem",
  backgroundColor: "#f8fafc",
  fontWeight: 600,
  fontSize: "0.8125rem",
  color: "#475569",
  borderBottom: "1px solid #e2e8f0",
};

const sectionBodyStyle: CSSProperties = {
  padding: "0.75rem 1rem",
};

const itemRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "0.375rem 0",
  fontSize: "0.875rem",
};

const labelStyle: CSSProperties = {
  color: "#475569",
};

function getBooleanBadgeStyle(value: boolean | null): CSSProperties {
  if (value === null) {
    return {
      display: "inline-block",
      padding: "0.125rem 0.5rem",
      borderRadius: "9999px",
      fontSize: "0.75rem",
      fontWeight: 500,
      backgroundColor: "#f1f5f9",
      color: "#94a3b8",
    };
  }
  return {
    display: "inline-block",
    padding: "0.125rem 0.5rem",
    borderRadius: "9999px",
    fontSize: "0.75rem",
    fontWeight: 500,
    backgroundColor: value ? "#fef2f2" : "#f0fdf4",
    color: value ? "#dc2626" : "#16a34a",
  };
}

function booleanLabel(value: boolean | null): string {
  if (value === null) return "未回答";
  return value ? "はい" : "いいえ";
}

const siteTagStyle: CSSProperties = {
  display: "inline-block",
  padding: "0.25rem 0.5rem",
  margin: "0.125rem",
  borderRadius: "0.25rem",
  fontSize: "0.75rem",
  backgroundColor: "#eff6ff",
  color: "#1d4ed8",
};

const detailLineStyle: CSSProperties = {
  fontSize: "0.8125rem",
  color: "#475569",
  padding: "0.25rem 0",
};

/**
 * 確認ステップ
 *
 * 入力内容を一覧表示し、ユーザーに確認を促す。
 */
export function PainConfirmationStep({ details, medications }: PainConfirmationStepProps) {
  return (
    <div style={containerStyle}>
      <h3 style={titleStyle}>入力内容の確認</h3>

      {/* 処方情報 */}
      <div style={sectionStyle}>
        <div style={sectionHeaderStyle}>痛み止めの処方</div>
        <div style={sectionBodyStyle}>
          {medications.length === 0 ? (
            <span style={{ fontSize: "0.875rem", color: "#64748b" }}>処方なし</span>
          ) : (
            medications.map((med) => (
              <div key={med.id} style={detailLineStyle}>
                {med.drugName}
              </div>
            ))
          )}
        </div>
      </div>

      {/* 痛みの状況 */}
      <div style={sectionStyle}>
        <div style={sectionHeaderStyle}>痛みの状況</div>
        <div style={sectionBodyStyle}>
          <div style={itemRowStyle}>
            <span style={labelStyle}>日中活動時の痛み</span>
            <span style={getBooleanBadgeStyle(details.hasDaytimePain)}>
              {booleanLabel(details.hasDaytimePain)}
            </span>
          </div>
          <div style={itemRowStyle}>
            <span style={labelStyle}>痛みによる夜間覚醒</span>
            <span style={getBooleanBadgeStyle(details.hasNighttimeAwakening)}>
              {booleanLabel(details.hasNighttimeAwakening)}
            </span>
          </div>
        </div>
      </div>

      {/* 痛みの部位 */}
      <div style={sectionStyle}>
        <div style={sectionHeaderStyle}>痛みの部位</div>
        <div style={sectionBodyStyle}>
          {details.selectedSiteIds.length === 0 ? (
            <span style={{ fontSize: "0.875rem", color: "#64748b" }}>部位の選択なし</span>
          ) : (
            <div>
              <div style={{ marginBottom: "0.5rem" }}>
                {details.selectedSiteIds.map((siteId) => (
                  <span key={siteId} style={siteTagStyle}>
                    {PAIN_SITE_MAP[siteId]?.label ?? siteId}
                  </span>
                ))}
              </div>
              {details.siteDetails.map((detail) => {
                const siteName = PAIN_SITE_MAP[detail.siteId]?.label ?? detail.siteId;
                const findings: string[] = [];
                if (detail.touchPain) findings.push("触痛あり");
                if (detail.movementPain) findings.push("運動時痛あり");
                if (detail.numbness) findings.push("しびれあり");
                if (findings.length === 0) return null;
                return (
                  <div key={detail.siteId} style={detailLineStyle}>
                    {siteName}: {findings.join("、")}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 生活への影響 */}
      <div style={sectionStyle}>
        <div style={sectionHeaderStyle}>生活への影響</div>
        <div style={sectionBodyStyle}>
          {LIFE_IMPACT_ITEMS.map((item) => {
            let value: boolean | null = null;
            switch (item.id) {
              case "SLEEP_IMPACT":
                value = details.sleepImpact;
                break;
              case "MOBILITY_IMPACT":
                value = details.mobilityImpact;
                break;
              case "TOILET_IMPACT":
                value = details.toiletImpact;
                break;
            }
            return (
              <div key={item.id} style={itemRowStyle}>
                <span style={labelStyle}>{item.label}</span>
                <span style={getBooleanBadgeStyle(value)}>{booleanLabel(value)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
