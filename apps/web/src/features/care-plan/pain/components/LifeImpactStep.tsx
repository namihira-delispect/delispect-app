"use client";

import type { CSSProperties } from "react";
import { LIFE_IMPACT_ITEMS } from "../types";
import type { LifeImpactId } from "../types";

export interface LifeImpactStepProps {
  /** 睡眠への影響 */
  sleepImpact: boolean | null;
  /** 動きへの影響 */
  mobilityImpact: boolean | null;
  /** 排泄への影響 */
  toiletImpact: boolean | null;
  /** 影響変更コールバック */
  onChangeImpact: (id: LifeImpactId, value: boolean) => void;
}

const containerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
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

const impactCardStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "0.75rem 1rem",
  border: "1px solid #e2e8f0",
  borderRadius: "0.375rem",
  backgroundColor: "#ffffff",
};

const impactInfoStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.25rem",
  flex: 1,
};

const impactLabelStyle: CSSProperties = {
  fontSize: "0.875rem",
  fontWeight: 500,
  color: "#1e293b",
};

const impactDescStyle: CSSProperties = {
  fontSize: "0.75rem",
  color: "#64748b",
};

const buttonGroupStyle: CSSProperties = {
  display: "flex",
  gap: "0.5rem",
};

function getButtonStyle(isSelected: boolean, isYes: boolean): CSSProperties {
  const baseColor = isYes ? "#3b82f6" : "#6b7280";
  return {
    padding: "0.375rem 1rem",
    fontSize: "0.8125rem",
    fontWeight: 500,
    border: isSelected ? `2px solid ${baseColor}` : "1px solid #d1d5db",
    borderRadius: "0.375rem",
    backgroundColor: isSelected ? (isYes ? "#eff6ff" : "#f3f4f6") : "#ffffff",
    color: isSelected ? baseColor : "#6b7280",
    cursor: "pointer",
  };
}

function getImpactValue(id: LifeImpactId, props: LifeImpactStepProps): boolean | null {
  switch (id) {
    case "SLEEP_IMPACT":
      return props.sleepImpact;
    case "MOBILITY_IMPACT":
      return props.mobilityImpact;
    case "TOILET_IMPACT":
      return props.toiletImpact;
    default:
      return null;
  }
}

/**
 * 生活への影響入力ステップ
 *
 * 睡眠・動き・排泄への影響をそれぞれ確認する。
 */
export function LifeImpactStep(props: LifeImpactStepProps) {
  const { onChangeImpact } = props;

  return (
    <div style={containerStyle}>
      <h3 style={titleStyle}>痛みの生活への影響</h3>
      <p style={descriptionStyle}>痛みが日常生活に与えている影響を確認します。</p>
      {LIFE_IMPACT_ITEMS.map((item) => {
        const currentValue = getImpactValue(item.id, props);

        return (
          <div key={item.id} style={impactCardStyle}>
            <div style={impactInfoStyle}>
              <span style={impactLabelStyle}>{item.label}</span>
              <span style={impactDescStyle}>{item.description}</span>
            </div>
            <div style={buttonGroupStyle}>
              <button
                type="button"
                style={getButtonStyle(currentValue === true, true)}
                onClick={() => onChangeImpact(item.id, true)}
                aria-pressed={currentValue === true}
              >
                はい
              </button>
              <button
                type="button"
                style={getButtonStyle(currentValue === false, false)}
                onClick={() => onChangeImpact(item.id, false)}
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
}
