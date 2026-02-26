"use client";

import type { CSSProperties } from "react";
import type { PainSiteId, PainSiteGroup } from "../types";
import { PAIN_SITE_GROUP_LABELS, groupPainSitesByGroup } from "../types";

export interface PainSiteSelectionStepProps {
  /** 選択済みの部位ID一覧 */
  selectedSiteIds: PainSiteId[];
  /** 選択変更コールバック */
  onToggleSite: (siteId: PainSiteId) => void;
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

const groupContainerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
};

const groupTitleStyle: CSSProperties = {
  fontSize: "0.875rem",
  fontWeight: 600,
  color: "#475569",
  paddingBottom: "0.25rem",
  borderBottom: "1px solid #e2e8f0",
};

const sitesGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
  gap: "0.5rem",
};

function getSiteButtonStyle(isSelected: boolean): CSSProperties {
  return {
    padding: "0.5rem 0.75rem",
    fontSize: "0.8125rem",
    fontWeight: 500,
    border: isSelected ? "2px solid #3b82f6" : "1px solid #d1d5db",
    borderRadius: "0.375rem",
    backgroundColor: isSelected ? "#eff6ff" : "#ffffff",
    color: isSelected ? "#1d4ed8" : "#374151",
    cursor: "pointer",
    textAlign: "center",
    whiteSpace: "nowrap",
  };
}

const selectedCountStyle: CSSProperties = {
  fontSize: "0.8125rem",
  color: "#3b82f6",
  fontWeight: 500,
};

/**
 * 痛みの部位選択ステップ
 *
 * デルマトーム図を参考にした部位をグループ別に表示し、
 * 複数箇所の選択に対応する。
 */
export function PainSiteSelectionStep({
  selectedSiteIds,
  onToggleSite,
}: PainSiteSelectionStepProps) {
  const groupedSites = groupPainSitesByGroup();
  const groupOrder: PainSiteGroup[] = ["HEAD_NECK", "TRUNK", "UPPER_LIMB", "LOWER_LIMB"];

  return (
    <div style={containerStyle}>
      <h3 style={titleStyle}>痛みのある部位を選択してください</h3>
      <p style={descriptionStyle}>
        痛みのある部位をすべて選択してください。複数箇所の選択が可能です。
      </p>
      {selectedSiteIds.length > 0 && (
        <span style={selectedCountStyle}>{selectedSiteIds.length}箇所 選択中</span>
      )}
      {groupOrder.map((group) => (
        <div key={group} style={groupContainerStyle}>
          <span style={groupTitleStyle}>{PAIN_SITE_GROUP_LABELS[group]}</span>
          <div style={sitesGridStyle}>
            {groupedSites[group].map((site) => {
              const isSelected = selectedSiteIds.includes(site.id);
              return (
                <button
                  key={site.id}
                  type="button"
                  style={getSiteButtonStyle(isSelected)}
                  onClick={() => onToggleSite(site.id)}
                  aria-pressed={isSelected}
                >
                  {site.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
