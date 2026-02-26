"use client";

import type { CSSProperties } from "react";
import type { RiskDrugMatch, SelectedAlternative } from "../types";

export interface AlternativeDrugPanelProps {
  /** リスク薬剤照合結果 */
  riskDrugMatches: RiskDrugMatch[];
  /** 選択済みの代替薬剤 */
  selectedAlternatives: SelectedAlternative[];
  /** 代替薬剤選択時のコールバック */
  onSelectAlternative: (alternative: SelectedAlternative) => void;
  /** 代替薬剤解除時のコールバック */
  onRemoveAlternative: (originalPrescriptionId: number) => void;
}

const containerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
};

const emptyStyle: CSSProperties = {
  padding: "1.5rem",
  textAlign: "center",
  color: "#16a34a",
  backgroundColor: "#f0fdf4",
  borderRadius: "0.5rem",
  fontSize: "0.875rem",
};

const matchCardStyle: CSSProperties = {
  border: "1px solid #e2e8f0",
  borderRadius: "0.5rem",
  backgroundColor: "#ffffff",
  overflow: "hidden",
};

const matchHeaderStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "0.75rem 1rem",
  backgroundColor: "#f8fafc",
  borderBottom: "1px solid #e2e8f0",
};

const matchDrugNameStyle: CSSProperties = {
  fontSize: "0.875rem",
  fontWeight: 600,
  color: "#1e293b",
};

const changeReasonStyle: CSSProperties = {
  padding: "0.75rem 1rem",
  fontSize: "0.8125rem",
  color: "#475569",
  lineHeight: 1.5,
  borderBottom: "1px solid #e2e8f0",
  backgroundColor: "#fffbeb",
};

const alternativesContainerStyle: CSSProperties = {
  padding: "0.75rem 1rem",
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
};

const alternativeLabelStyle: CSSProperties = {
  fontSize: "0.75rem",
  fontWeight: 600,
  color: "#64748b",
  marginBottom: "0.25rem",
};

const alternativeItemStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "0.5rem 0.75rem",
  border: "1px solid #e2e8f0",
  borderRadius: "0.375rem",
  backgroundColor: "#f8fafc",
};

const selectedAlternativeItemStyle: CSSProperties = {
  ...alternativeItemStyle,
  border: "1px solid #3b82f6",
  backgroundColor: "#eff6ff",
};

const altDrugInfoStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.125rem",
  flex: 1,
};

const altDrugNameStyle: CSSProperties = {
  fontSize: "0.8125rem",
  fontWeight: 600,
  color: "#1e293b",
};

const altDrugReasonStyle: CSSProperties = {
  fontSize: "0.75rem",
  color: "#64748b",
};

const selectButtonStyle: CSSProperties = {
  padding: "0.375rem 0.75rem",
  fontSize: "0.75rem",
  fontWeight: 500,
  borderRadius: "0.375rem",
  border: "1px solid #3b82f6",
  backgroundColor: "#3b82f6",
  color: "#ffffff",
  cursor: "pointer",
  whiteSpace: "nowrap",
};

const deselectButtonStyle: CSSProperties = {
  ...selectButtonStyle,
  backgroundColor: "#ef4444",
  borderColor: "#ef4444",
};

const noAlternativesStyle: CSSProperties = {
  padding: "0.5rem",
  fontSize: "0.8125rem",
  color: "#94a3b8",
  textAlign: "center",
};

/**
 * 薬剤変更提案パネルコンポーネント
 *
 * リスク薬剤ごとに代替薬剤の提案を表示し、
 * 選択/解除を行う。
 */
export function AlternativeDrugPanel({
  riskDrugMatches,
  selectedAlternatives,
  onSelectAlternative,
  onRemoveAlternative,
}: AlternativeDrugPanelProps) {
  const matchesWithAlternatives = riskDrugMatches.filter((m) => m.alternatives.length > 0);

  if (matchesWithAlternatives.length === 0) {
    return <div style={emptyStyle}>代替薬剤の提案はありません</div>;
  }

  return (
    <div style={containerStyle}>
      {matchesWithAlternatives.map((match) => {
        const isSelected = selectedAlternatives.some(
          (sa) => sa.originalPrescriptionId === match.prescription.id,
        );
        const selectedAlt = selectedAlternatives.find(
          (sa) => sa.originalPrescriptionId === match.prescription.id,
        );

        return (
          <div key={match.prescription.id} style={matchCardStyle}>
            <div style={matchHeaderStyle}>
              <span style={matchDrugNameStyle}>{match.prescription.drugName}</span>
            </div>
            <div style={changeReasonStyle}>{match.changeReason}</div>
            <div style={alternativesContainerStyle}>
              <span style={alternativeLabelStyle}>代替薬剤の候補</span>
              {match.alternatives.map((alt) => {
                const isThisSelected =
                  isSelected && selectedAlt?.alternativeDrugName === alt.drugName;

                return (
                  <div
                    key={alt.medicinesCode}
                    style={isThisSelected ? selectedAlternativeItemStyle : alternativeItemStyle}
                  >
                    <div style={altDrugInfoStyle}>
                      <span style={altDrugNameStyle}>{alt.drugName}</span>
                      <span style={altDrugReasonStyle}>{alt.reason}</span>
                    </div>
                    {isThisSelected ? (
                      <button
                        type="button"
                        onClick={() => onRemoveAlternative(match.prescription.id)}
                        style={deselectButtonStyle}
                      >
                        選択解除
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          onSelectAlternative({
                            originalPrescriptionId: match.prescription.id,
                            originalDrugName: match.prescription.drugName,
                            alternativeDrugName: alt.drugName,
                            changeReason: match.changeReason,
                          })
                        }
                        style={selectButtonStyle}
                      >
                        選択
                      </button>
                    )}
                  </div>
                );
              })}
              {match.alternatives.length === 0 && (
                <div style={noAlternativesStyle}>代替薬剤の候補がありません</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
