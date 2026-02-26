"use client";

import type { CSSProperties } from "react";
import type { PainSiteId, PainSiteDetail } from "../types";
import { PAIN_SITE_MAP, SITE_DETAIL_CHECKS } from "../types";

export interface SiteDetailStepProps {
  /** 選択された部位ID一覧 */
  selectedSiteIds: PainSiteId[];
  /** 部位ごとの詳細データ */
  siteDetails: PainSiteDetail[];
  /** 詳細変更コールバック */
  onUpdateSiteDetail: (siteId: PainSiteId, field: keyof PainSiteDetail, value: boolean) => void;
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

const descriptionStyle: CSSProperties = {
  fontSize: "0.875rem",
  color: "#64748b",
};

const siteCardStyle: CSSProperties = {
  border: "1px solid #e2e8f0",
  borderRadius: "0.5rem",
  overflow: "hidden",
};

const siteHeaderStyle: CSSProperties = {
  padding: "0.75rem 1rem",
  backgroundColor: "#f8fafc",
  fontWeight: 600,
  fontSize: "0.875rem",
  color: "#1e293b",
  borderBottom: "1px solid #e2e8f0",
};

const checkItemStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "0.625rem 1rem",
  borderBottom: "1px solid #f1f5f9",
};

const checkLabelContainerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.125rem",
};

const checkLabelStyle: CSSProperties = {
  fontSize: "0.875rem",
  fontWeight: 500,
  color: "#374151",
};

const checkDescStyle: CSSProperties = {
  fontSize: "0.75rem",
  color: "#9ca3af",
};

const buttonGroupStyle: CSSProperties = {
  display: "flex",
  gap: "0.5rem",
};

function getSmallButtonStyle(isSelected: boolean, isYes: boolean): CSSProperties {
  const baseColor = isYes ? "#3b82f6" : "#6b7280";
  return {
    padding: "0.25rem 0.75rem",
    fontSize: "0.8125rem",
    fontWeight: 500,
    border: isSelected ? `2px solid ${baseColor}` : "1px solid #d1d5db",
    borderRadius: "0.375rem",
    backgroundColor: isSelected ? (isYes ? "#eff6ff" : "#f3f4f6") : "#ffffff",
    color: isSelected ? baseColor : "#6b7280",
    cursor: "pointer",
  };
}

function getDetailField(checkId: string): keyof PainSiteDetail {
  switch (checkId) {
    case "TOUCH_PAIN":
      return "touchPain";
    case "MOVEMENT_PAIN":
      return "movementPain";
    case "NUMBNESS":
      return "numbness";
    default:
      return "touchPain";
  }
}

/**
 * 部位ごとの詳細確認ステップ
 *
 * 選択された各部位について、触った時の痛み・動かした時の痛み・
 * 違和感/しびれの3項目を確認する。
 */
export function SiteDetailStep({
  selectedSiteIds,
  siteDetails,
  onUpdateSiteDetail,
}: SiteDetailStepProps) {
  const getDetailForSite = (siteId: PainSiteId): PainSiteDetail => {
    return (
      siteDetails.find((d) => d.siteId === siteId) ?? {
        siteId,
        touchPain: null,
        movementPain: null,
        numbness: null,
      }
    );
  };

  return (
    <div style={containerStyle}>
      <h3 style={titleStyle}>各部位の痛みの詳細</h3>
      <p style={descriptionStyle}>選択した各部位について、痛みの種類を確認します。</p>
      {selectedSiteIds.map((siteId) => {
        const site = PAIN_SITE_MAP[siteId];
        const detail = getDetailForSite(siteId);

        return (
          <div key={siteId} style={siteCardStyle}>
            <div style={siteHeaderStyle}>{site?.label ?? siteId}</div>
            {SITE_DETAIL_CHECKS.map((check) => {
              const field = getDetailField(check.id);
              const currentValue = detail[field] as boolean | null;

              return (
                <div key={check.id} style={checkItemStyle}>
                  <div style={checkLabelContainerStyle}>
                    <span style={checkLabelStyle}>{check.label}</span>
                    <span style={checkDescStyle}>{check.description}</span>
                  </div>
                  <div style={buttonGroupStyle}>
                    <button
                      type="button"
                      style={getSmallButtonStyle(currentValue === true, true)}
                      onClick={() => onUpdateSiteDetail(siteId, field, true)}
                      aria-pressed={currentValue === true}
                    >
                      はい
                    </button>
                    <button
                      type="button"
                      style={getSmallButtonStyle(currentValue === false, false)}
                      onClick={() => onUpdateSiteDetail(siteId, field, false)}
                      aria-pressed={currentValue === false}
                    >
                      いいえ
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
