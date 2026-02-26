"use client";

import { useState, useCallback, useEffect, type CSSProperties } from "react";
import Link from "next/link";
import type { AdmissionDetailResponse } from "../types";
import { getAdmissionDetailAction } from "../server-actions/getAdmissionDetailAction";
import { checkVersionAction } from "../server-actions/checkVersionAction";
import { BasicInfoSection } from "./detail/BasicInfoSection";
import { VitalSignSection } from "./detail/VitalSignSection";
import { LabResultSection } from "./detail/LabResultSection";
import { CareInfoSection } from "./detail/CareInfoSection";
import { RiskAssessmentSection } from "./detail/RiskAssessmentSection";
import { CarePlanSection } from "./detail/CarePlanSection";
import { HighRiskKasanSection } from "@/features/high-risk-kasan/components";

export interface AdmissionDetailViewerProps {
  /** 入院ID */
  admissionId: number;
}

const containerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "1.5rem",
};

const headerStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: "1rem",
};

const breadcrumbStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  fontSize: "0.875rem",
  color: "#64748b",
};

const breadcrumbLinkStyle: CSSProperties = {
  color: "#3b82f6",
  textDecoration: "none",
};

const actionButtonsStyle: CSSProperties = {
  display: "flex",
  gap: "0.5rem",
};

const buttonStyle: CSSProperties = {
  padding: "0.5rem 1rem",
  backgroundColor: "#3b82f6",
  color: "#ffffff",
  border: "none",
  borderRadius: "0.375rem",
  fontSize: "0.875rem",
  fontWeight: 500,
  cursor: "pointer",
};

const refreshButtonStyle: CSSProperties = {
  ...buttonStyle,
  backgroundColor: "#6b7280",
};

const errorStyle: CSSProperties = {
  padding: "0.75rem",
  backgroundColor: "#fef2f2",
  color: "#991b1b",
  borderRadius: "0.375rem",
  fontSize: "0.875rem",
};

const warningStyle: CSSProperties = {
  padding: "0.75rem",
  backgroundColor: "#fffbeb",
  color: "#92400e",
  borderRadius: "0.375rem",
  fontSize: "0.875rem",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const loadingStyle: CSSProperties = {
  padding: "2rem",
  textAlign: "center",
  color: "#64748b",
};

const sectionsGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
  gap: "1.5rem",
};

const highRiskBadgeStyle = (isHighRisk: boolean): CSSProperties => ({
  display: "inline-block",
  padding: "0.25rem 0.75rem",
  borderRadius: "9999px",
  fontSize: "0.75rem",
  fontWeight: 600,
  backgroundColor: isHighRisk ? "#fef2f2" : "#f0fdf4",
  color: isHighRisk ? "#dc2626" : "#16a34a",
  marginLeft: "0.5rem",
});

/**
 * 患者入院詳細ビューアーコンポーネント
 *
 * 基本情報・バイタル・採血結果・ケア関連情報・リスク評価情報・ケアプラン情報を表示する。
 * 楽観的ロック（バージョン管理）による競合制御をサポートする。
 */
export function AdmissionDetailViewer({ admissionId }: AdmissionDetailViewerProps) {
  const [detail, setDetail] = useState<AdmissionDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [versionConflict, setVersionConflict] = useState(false);

  // 詳細データの取得
  const fetchDetail = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setVersionConflict(false);

    try {
      const result = await getAdmissionDetailAction({ id: admissionId });
      if (result.success) {
        setDetail(result.value);
      } else {
        setError(
          typeof result.value.cause === "string"
            ? result.value.cause
            : "入院詳細の取得に失敗しました",
        );
      }
    } catch {
      setError("入院詳細の取得中にエラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  }, [admissionId]);

  // 初回ロード
  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  // バージョンチェック（更新前に呼び出す）
  const handleVersionCheck = useCallback(async () => {
    if (!detail) return;

    try {
      const result = await checkVersionAction({
        admissionId: detail.admissionId,
        expectedVersion: detail.version,
      });

      if (!result.success) {
        if (result.value.code === "VERSION_CONFLICT") {
          setVersionConflict(true);
        } else {
          setError(
            typeof result.value.cause === "string"
              ? result.value.cause
              : "バージョンチェックに失敗しました",
          );
        }
      }
    } catch {
      setError("バージョンチェック中にエラーが発生しました");
    }
  }, [detail]);

  // 最新データの再取得
  const handleRefresh = useCallback(() => {
    setVersionConflict(false);
    fetchDetail();
  }, [fetchDetail]);

  if (isLoading) {
    return <div style={loadingStyle}>読み込み中...</div>;
  }

  if (error) {
    return (
      <div style={containerStyle}>
        <div style={breadcrumbStyle}>
          <Link href="/admissions" style={breadcrumbLinkStyle}>
            患者入院一覧
          </Link>
          <span>/</span>
          <span>詳細</span>
        </div>
        <div style={errorStyle}>{error}</div>
        <button type="button" style={refreshButtonStyle} onClick={handleRefresh}>
          再読み込み
        </button>
      </div>
    );
  }

  if (!detail) {
    return null;
  }

  return (
    <div style={containerStyle}>
      {/* パンくずリスト */}
      <div style={breadcrumbStyle}>
        <Link href="/admissions" style={breadcrumbLinkStyle}>
          患者入院一覧
        </Link>
        <span>/</span>
        <span>
          {detail.patientName}
          <span style={highRiskBadgeStyle(detail.isHighRisk)}>
            {detail.isHighRisk ? "ハイリスク" : "非ハイリスク"}
          </span>
        </span>
      </div>

      {/* 競合警告 */}
      {versionConflict && (
        <div style={warningStyle}>
          <span>
            データが他のユーザーによって更新されています。最新データを再取得してください。
          </span>
          <button type="button" style={buttonStyle} onClick={handleRefresh}>
            最新データを取得
          </button>
        </div>
      )}

      {/* ヘッダー */}
      <div style={headerStyle}>
        <div style={actionButtonsStyle}>
          {detail.carePlan ? (
            <Link
              href={`/admissions/${detail.admissionId}/care-plan`}
              style={{ ...buttonStyle, textDecoration: "none" }}
            >
              ケアプラン編集
            </Link>
          ) : (
            <Link
              href={`/admissions/${detail.admissionId}/care-plan/new`}
              style={{ ...buttonStyle, textDecoration: "none" }}
            >
              ケアプラン作成
            </Link>
          )}
          <button type="button" style={refreshButtonStyle} onClick={handleRefresh}>
            再読み込み
          </button>
          <button type="button" style={refreshButtonStyle} onClick={handleVersionCheck}>
            競合チェック
          </button>
        </div>
      </div>

      {/* セクション */}
      <div style={sectionsGridStyle}>
        <BasicInfoSection detail={detail} />
        <VitalSignSection vitalSign={detail.latestVitalSign} />
        <LabResultSection labResults={detail.labResults} />
        <CareInfoSection careInfo={detail.careInfo} />
      </div>

      {/* せん妄ハイリスクケア加算アセスメント */}
      <HighRiskKasanSection admissionId={detail.admissionId} />

      {/* リスク評価・ケアプランは全幅で表示 */}
      <RiskAssessmentSection riskAssessments={detail.riskAssessments} />
      <CarePlanSection carePlan={detail.carePlan} admissionId={detail.admissionId} />
    </div>
  );
}
