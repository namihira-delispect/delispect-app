import Link from "next/link";
import type { CSSProperties } from "react";
import type { CarePlanDisplay } from "../../types";
import { CARE_PLAN_CATEGORY_LABELS, CARE_PLAN_ITEM_STATUS_LABELS } from "../../types";
import {
  sectionCardStyle,
  sectionTitleStyle,
  tableStyle,
  thStyle,
  tdStyle,
  emptyStyle,
  getBadgeStyle,
} from "./sectionStyles";

export interface CarePlanSectionProps {
  carePlan: CarePlanDisplay | null;
  admissionId: number;
}

const statusBadgeStyles: Record<string, CSSProperties> = {
  NOT_STARTED: getBadgeStyle("#f1f5f9", "#64748b"),
  IN_PROGRESS: getBadgeStyle("#fffbeb", "#d97706"),
  COMPLETED: getBadgeStyle("#f0fdf4", "#16a34a"),
  NOT_APPLICABLE: getBadgeStyle("#f1f5f9", "#94a3b8"),
};

const headerStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const editLinkStyle: CSSProperties = {
  fontSize: "0.8125rem",
  color: "#3b82f6",
  textDecoration: "none",
  fontWeight: 500,
};

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
 * ケアプラン情報セクション
 *
 * ケアプランの作成実施状況と実施日付を表示する。
 * ケアプラン編集画面への遷移リンクを提供する。
 */
export function CarePlanSection({ carePlan, admissionId }: CarePlanSectionProps) {
  return (
    <div style={sectionCardStyle}>
      <div style={headerStyle}>
        <h2 style={{ ...sectionTitleStyle, marginBottom: 0, borderBottom: "none", paddingBottom: 0 }}>
          ケアプラン情報
        </h2>
        {carePlan ? (
          <Link href={`/admissions/${admissionId}/care-plan`} style={editLinkStyle}>
            ケアプラン編集
          </Link>
        ) : (
          <Link href={`/admissions/${admissionId}/care-plan/new`} style={editLinkStyle}>
            ケアプラン作成
          </Link>
        )}
      </div>
      <div
        style={{
          borderBottom: "1px solid #e2e8f0",
          marginBottom: "0.75rem",
          marginTop: "0.5rem",
        }}
      />

      {!carePlan ? (
        <div style={emptyStyle}>ケアプランが作成されていません</div>
      ) : (
        <>
          <div
            style={{
              display: "flex",
              gap: "1.5rem",
              fontSize: "0.8125rem",
              color: "#64748b",
              marginBottom: "0.75rem",
            }}
          >
            <span>作成者: {carePlan.createdBy}</span>
            <span>作成日: {formatDateTime(carePlan.createdAt)}</span>
            <span>更新日: {formatDateTime(carePlan.updatedAt)}</span>
          </div>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>カテゴリー</th>
                <th style={thStyle}>ステータス</th>
                <th style={thStyle}>指示内容</th>
              </tr>
            </thead>
            <tbody>
              {carePlan.items.map((item, index) => (
                <tr key={index}>
                  <td style={tdStyle}>
                    {CARE_PLAN_CATEGORY_LABELS[item.category] ?? item.category}
                  </td>
                  <td style={tdStyle}>
                    <span style={statusBadgeStyles[item.status] ?? statusBadgeStyles.NOT_STARTED}>
                      {CARE_PLAN_ITEM_STATUS_LABELS[item.status] ?? item.status}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, maxWidth: "400px", wordBreak: "break-all" }}>
                    {item.instructions ?? "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
