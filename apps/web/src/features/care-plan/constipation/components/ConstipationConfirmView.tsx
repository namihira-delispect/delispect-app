"use client";

import type { CSSProperties } from "react";
import type { ConstipationAssessmentData } from "../types";
import { BRISTOL_SCALE_SHORT_LABELS, MEAL_AMOUNT_LABELS } from "../types";

export interface ConstipationConfirmViewProps {
  data: ConstipationAssessmentData;
}

const sectionStyle: CSSProperties = {
  marginBottom: "1.5rem",
};

const sectionTitleStyle: CSSProperties = {
  fontSize: "0.9375rem",
  fontWeight: 600,
  color: "#1e293b",
  marginBottom: "0.75rem",
  paddingBottom: "0.375rem",
  borderBottom: "1px solid #e2e8f0",
};

const rowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  padding: "0.375rem 0",
  fontSize: "0.875rem",
};

const itemLabelStyle: CSSProperties = {
  color: "#64748b",
};

const itemValueStyle: CSSProperties = {
  color: "#1e293b",
  fontWeight: 500,
};

const descriptionStyle: CSSProperties = {
  fontSize: "0.8125rem",
  color: "#64748b",
  marginBottom: "1rem",
};

/**
 * 便秘アセスメント入力内容確認ビュー
 *
 * 保存前に入力内容を一覧表示する。
 */
export function ConstipationConfirmView({ data }: ConstipationConfirmViewProps) {
  return (
    <div>
      <p style={descriptionStyle}>
        以下の内容で便秘アセスメントを保存します。内容を確認してください。
      </p>

      {/* 排便状況 */}
      <div style={sectionStyle}>
        <h4 style={sectionTitleStyle}>排便状況</h4>
        <div style={rowStyle}>
          <span style={itemLabelStyle}>便が出ていない日数</span>
          <span style={itemValueStyle}>{data.daysWithoutBowelMovement}日</span>
        </div>
        <div style={rowStyle}>
          <span style={itemLabelStyle}>便の性状（ブリストルスケール）</span>
          <span style={itemValueStyle}>
            {data.bristolScale !== null
              ? `タイプ${data.bristolScale}: ${BRISTOL_SCALE_SHORT_LABELS[data.bristolScale]}`
              : "該当なし（排便なし）"}
          </span>
        </div>
      </div>

      {/* 体調面 */}
      <div style={sectionStyle}>
        <h4 style={sectionTitleStyle}>体調面</h4>
        <div style={rowStyle}>
          <span style={itemLabelStyle}>吐き気、気分の悪さ</span>
          <span style={itemValueStyle}>{data.hasNausea ? "あり" : "なし"}</span>
        </div>
        <div style={rowStyle}>
          <span style={itemLabelStyle}>お腹の張り</span>
          <span style={itemValueStyle}>{data.hasAbdominalDistension ? "あり" : "なし"}</span>
        </div>
      </div>

      {/* 食事 */}
      <div style={sectionStyle}>
        <h4 style={sectionTitleStyle}>食事</h4>
        <div style={rowStyle}>
          <span style={itemLabelStyle}>食欲</span>
          <span style={itemValueStyle}>{data.hasAppetite ? "あり" : "なし"}</span>
        </div>
        <div style={rowStyle}>
          <span style={itemLabelStyle}>一度の食事量</span>
          <span style={itemValueStyle}>{MEAL_AMOUNT_LABELS[data.mealAmount]}</span>
        </div>
      </div>

      {/* 腸の状態 */}
      <div style={sectionStyle}>
        <h4 style={sectionTitleStyle}>腸の状態</h4>
        <div style={rowStyle}>
          <span style={itemLabelStyle}>腸蠕動音</span>
          <span style={itemValueStyle}>{data.hasBowelSounds ? "聴取あり" : "聴取なし"}</span>
        </div>
        <div style={rowStyle}>
          <span style={itemLabelStyle}>腸内ガス</span>
          <span style={itemValueStyle}>{data.hasIntestinalGas ? "あり" : "なし"}</span>
        </div>
        <div style={rowStyle}>
          <span style={itemLabelStyle}>触診による便塊</span>
          <span style={itemValueStyle}>{data.hasFecalMass ? "あり" : "なし"}</span>
        </div>
      </div>
    </div>
  );
}
