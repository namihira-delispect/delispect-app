"use client";

import { useState, type CSSProperties } from "react";

export interface DehydrationVitalQuestionProps {
  /** 質問タイトル */
  title: string;
  /** 質問説明文 */
  description: string;
  /** 質問タイプ */
  questionType: "pulse" | "bp";
  /** 脈拍の初期値 */
  initialPulse?: number | null;
  /** 収縮期血圧の初期値 */
  initialSystolicBp?: number | null;
  /** 拡張期血圧の初期値 */
  initialDiastolicBp?: number | null;
  /** 値変更コールバック */
  onValueChange: (values: {
    pulse?: number | null;
    systolicBp?: number | null;
    diastolicBp?: number | null;
  }) => void;
  /** 次へ進むコールバック */
  onNext: () => void;
  /** 戻るコールバック */
  onBack: (() => void) | null;
}

const containerStyle: CSSProperties = {
  padding: "1.5rem",
  backgroundColor: "#ffffff",
  borderRadius: "0.5rem",
  border: "1px solid #e2e8f0",
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
  marginBottom: "1.5rem",
};

const inputGroupStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  marginBottom: "1.5rem",
};

const inputRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
};

const labelStyle: CSSProperties = {
  fontSize: "0.875rem",
  fontWeight: 500,
  color: "#475569",
  minWidth: "80px",
};

const inputStyle: CSSProperties = {
  padding: "0.5rem",
  border: "1px solid #e2e8f0",
  borderRadius: "0.375rem",
  fontSize: "0.875rem",
  width: "100px",
};

const unitStyle: CSSProperties = {
  fontSize: "0.875rem",
  color: "#64748b",
};

const buttonGroupStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: "0.75rem",
};

const backButtonStyle: CSSProperties = {
  padding: "0.5rem 1.5rem",
  backgroundColor: "#f1f5f9",
  color: "#475569",
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
  marginLeft: "auto",
};

/**
 * バイタルサイン入力コンポーネント
 *
 * 脈拍または血圧の入力フォームを表示する。
 */
export function DehydrationVitalQuestion({
  title,
  description,
  questionType,
  initialPulse,
  initialSystolicBp,
  initialDiastolicBp,
  onValueChange,
  onNext,
  onBack,
}: DehydrationVitalQuestionProps) {
  const [pulse, setPulse] = useState<string>(initialPulse != null ? String(initialPulse) : "");
  const [systolicBp, setSystolicBp] = useState<string>(
    initialSystolicBp != null ? String(initialSystolicBp) : "",
  );
  const [diastolicBp, setDiastolicBp] = useState<string>(
    initialDiastolicBp != null ? String(initialDiastolicBp) : "",
  );

  const handlePulseChange = (value: string) => {
    setPulse(value);
    const numValue = value === "" ? null : parseInt(value, 10);
    onValueChange({ pulse: isNaN(numValue as number) ? null : numValue });
  };

  const handleSystolicChange = (value: string) => {
    setSystolicBp(value);
    const numValue = value === "" ? null : parseInt(value, 10);
    const diastolicValue = diastolicBp === "" ? null : parseInt(diastolicBp, 10);
    onValueChange({
      systolicBp: isNaN(numValue as number) ? null : numValue,
      diastolicBp: isNaN(diastolicValue as number) ? null : diastolicValue,
    });
  };

  const handleDiastolicChange = (value: string) => {
    setDiastolicBp(value);
    const numValue = value === "" ? null : parseInt(value, 10);
    const systolicValue = systolicBp === "" ? null : parseInt(systolicBp, 10);
    onValueChange({
      systolicBp: isNaN(systolicValue as number) ? null : systolicValue,
      diastolicBp: isNaN(numValue as number) ? null : numValue,
    });
  };

  return (
    <div style={containerStyle}>
      <h3 style={titleStyle}>{title}</h3>
      <p style={descriptionStyle}>{description}</p>

      <div style={inputGroupStyle}>
        {questionType === "pulse" ? (
          <div style={inputRowStyle}>
            <span style={labelStyle}>脈拍</span>
            <input
              type="number"
              value={pulse}
              onChange={(e) => handlePulseChange(e.target.value)}
              style={inputStyle}
              min={0}
              max={300}
              placeholder="--"
              aria-label="脈拍"
            />
            <span style={unitStyle}>bpm</span>
          </div>
        ) : (
          <>
            <div style={inputRowStyle}>
              <span style={labelStyle}>収縮期血圧</span>
              <input
                type="number"
                value={systolicBp}
                onChange={(e) => handleSystolicChange(e.target.value)}
                style={inputStyle}
                min={0}
                max={300}
                placeholder="--"
                aria-label="収縮期血圧"
              />
              <span style={unitStyle}>mmHg</span>
            </div>
            <div style={inputRowStyle}>
              <span style={labelStyle}>拡張期血圧</span>
              <input
                type="number"
                value={diastolicBp}
                onChange={(e) => handleDiastolicChange(e.target.value)}
                style={inputStyle}
                min={0}
                max={300}
                placeholder="--"
                aria-label="拡張期血圧"
              />
              <span style={unitStyle}>mmHg</span>
            </div>
          </>
        )}
      </div>

      <div style={buttonGroupStyle}>
        {onBack && (
          <button type="button" onClick={onBack} style={backButtonStyle}>
            戻る
          </button>
        )}
        <button type="button" onClick={onNext} style={nextButtonStyle}>
          次へ
        </button>
      </div>
    </div>
  );
}
