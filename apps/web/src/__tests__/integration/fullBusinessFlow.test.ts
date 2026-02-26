/**
 * 統合テスト: 主要業務フロー一貫性テスト
 *
 * 入院→電子カルテ同期→リスク評価→ケアプラン作成→転記の
 * 主要業務フロー全体を横断的に検証する。
 * 各APIの認証・入力バリデーション・レスポンス形式の整合性を確認する。
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// 認証モック
vi.mock("@/lib/auth", () => ({
  authorizeServerAction: vi.fn(),
}));

// 監査ログモック
vi.mock("@/lib/audit", () => ({
  recordAuditLog: vi.fn().mockResolvedValue(null),
  AUDIT_ACTIONS: { EMR_SYNC: "EMR_SYNC" },
  AUDIT_TARGET_TYPES: { EMR_DATA: "EMR_DATA" },
}));

// 各種モック
vi.mock("@/features/admissions/queries/getAdmissionList", () => ({
  getAdmissionList: vi.fn(),
}));

vi.mock("@/features/emr-sync/server-actions/executeEmrSync", () => ({
  executeManualImport: vi.fn(),
}));

vi.mock("@/features/emr-sync/repositories/importLock", () => ({
  checkImportLock: vi.fn(),
}));

vi.mock("@/features/risk-assessment/server-actions", () => ({
  executeRiskAssessmentAction: vi.fn(),
}));

vi.mock("@/features/care-plan/queries/getCarePlan", () => ({
  getCarePlan: vi.fn(),
}));

vi.mock("@/features/care-plan/server-actions/createCarePlanAction", () => ({
  createCarePlanAction: vi.fn(),
}));

vi.mock("@/features/care-plan/detail/queries/getCarePlanDetail", () => ({
  getCarePlanDetail: vi.fn(),
}));

vi.mock("@/features/care-plan/detail/queries/getTranscriptionHistory", () => ({
  getTranscriptionHistory: vi.fn(),
}));

vi.mock("@/features/care-plan/detail/server-actions/createTranscriptionAction", () => ({
  createTranscriptionAction: vi.fn(),
}));

vi.mock("@/features/high-risk-kasan/queries/getHighRiskKasanAssessment", () => ({
  getHighRiskKasanAssessment: vi.fn(),
}));

vi.mock("@/features/high-risk-kasan/server-actions/saveHighRiskKasanAction", () => ({
  saveHighRiskKasanAction: vi.fn(),
}));

import { GET as getAdmissionsRoute } from "@/app/api/admissions/route";
import { POST as emrSyncRoute } from "@/app/api/emr-sync/route";
import { POST as riskAssessmentRoute } from "@/app/api/risk-assessment/route";
import { POST as createCarePlanRoute } from "@/app/api/care-plan/route";
import { GET as getCarePlanDetailRoute } from "@/app/api/care-plan/detail/route";
import { POST as createTranscriptionRoute } from "@/app/api/care-plan/detail/transcription/route";
import { GET as getHighRiskKasanRoute, PUT as saveHighRiskKasanRoute } from "@/app/api/high-risk-kasan/[admissionId]/route";

import { authorizeServerAction } from "@/lib/auth";
import { getAdmissionList } from "@/features/admissions/queries/getAdmissionList";
import { executeManualImport } from "@/features/emr-sync/server-actions/executeEmrSync";
import { executeRiskAssessmentAction } from "@/features/risk-assessment/server-actions";
import { createCarePlanAction } from "@/features/care-plan/server-actions/createCarePlanAction";
import { getCarePlanDetail } from "@/features/care-plan/detail/queries/getCarePlanDetail";
import { getTranscriptionHistory } from "@/features/care-plan/detail/queries/getTranscriptionHistory";
import { createTranscriptionAction } from "@/features/care-plan/detail/server-actions/createTranscriptionAction";
import { getHighRiskKasanAssessment } from "@/features/high-risk-kasan/queries/getHighRiskKasanAssessment";
import { saveHighRiskKasanAction } from "@/features/high-risk-kasan/server-actions/saveHighRiskKasanAction";

import {
  GENERAL_USER,
  SUPER_ADMIN_USER,
  TEST_ADMISSION_LIST_RESPONSE,
  TEST_CARE_PLAN,
  TEST_CARE_PLAN_DETAIL,
  TEST_TRANSCRIPTION,
  TEST_HIGH_RISK_KASAN_RESULT,
  TEST_HIGH_RISK_KASAN_ASSESSMENT,
  createAuthSuccess,
  createAuthUnauthorized,
  createAuthForbidden,
} from "./helpers/testSeedData";

const mockAuth = vi.mocked(authorizeServerAction);
const mockGetAdmissionList = vi.mocked(getAdmissionList);
const mockExecuteManualImport = vi.mocked(executeManualImport);
const mockExecuteRiskAssessment = vi.mocked(executeRiskAssessmentAction);
const mockCreateCarePlanAction = vi.mocked(createCarePlanAction);
const mockGetCarePlanDetail = vi.mocked(getCarePlanDetail);
const mockGetTranscriptionHistory = vi.mocked(getTranscriptionHistory);
const mockCreateTranscriptionAction = vi.mocked(createTranscriptionAction);
// getHighRiskKasanAssessmentは直接API routeで使用されるのでモック登録のみ
vi.mocked(getHighRiskKasanAssessment);
const mockSaveHighRiskKasanAction = vi.mocked(saveHighRiskKasanAction);

function createMockGetRequest(url: string) {
  const fullUrl = new URL(url, "http://localhost:3000");
  return {
    nextUrl: fullUrl,
    url: fullUrl.toString(),
    headers: new Headers(),
    cookies: { get: vi.fn() },
  } as never;
}

function createMockPostRequest(url: string, body: unknown) {
  const fullUrl = new URL(url, "http://localhost:3000");
  return {
    nextUrl: fullUrl,
    url: fullUrl.toString(),
    headers: new Headers(),
    cookies: { get: vi.fn() },
    json: vi.fn().mockResolvedValue(body),
    method: "POST",
  } as never;
}

describe("統合テスト: 主要業務フロー一貫性", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("一般ユーザーの業務フロー: 入院一覧→ケアプラン作成→転記", () => {
    it("一般ユーザーが入院一覧表示→ケアプラン作成→詳細表示→転記を一貫して実行できる", async () => {
      mockAuth.mockResolvedValue(createAuthSuccess(GENERAL_USER));

      // Step 1: 入院一覧表示
      mockGetAdmissionList.mockResolvedValue({
        success: true,
        value: TEST_ADMISSION_LIST_RESPONSE as never,
      });
      const admissionResponse = await getAdmissionsRoute(createMockGetRequest("/api/admissions"));
      const admissionData = await admissionResponse.json();
      expect(admissionResponse.status).toBe(200);
      expect(admissionData.admissions).toHaveLength(2);

      // Step 2: ケアプラン作成
      mockCreateCarePlanAction.mockResolvedValue({
        success: true,
        value: TEST_CARE_PLAN as never,
      });
      const createCpResponse = await createCarePlanRoute(
        createMockPostRequest("/api/care-plan", { admissionId: 1 }),
      );
      expect(createCpResponse.status).toBe(201);

      // Step 3: ケアプラン詳細表示
      mockGetCarePlanDetail.mockResolvedValue({
        success: true,
        value: TEST_CARE_PLAN_DETAIL as never,
      });
      mockGetTranscriptionHistory.mockResolvedValue({
        success: true,
        value: [],
      });
      const detailResponse = await getCarePlanDetailRoute(
        createMockGetRequest("/api/care-plan/detail?admissionId=1"),
      );
      const detailData = await detailResponse.json();
      expect(detailResponse.status).toBe(200);
      expect(detailData.detail.items).toHaveLength(2);

      // Step 4: 看護記録転記
      mockCreateTranscriptionAction.mockResolvedValue({
        success: true,
        value: TEST_TRANSCRIPTION,
      });
      const transcribeResponse = await createTranscriptionRoute(
        createMockPostRequest("/api/care-plan/detail/transcription", {
          carePlanId: 1,
          content: "ケアプラン転記内容",
        }),
      );
      expect(transcribeResponse.status).toBe(201);
    });
  });

  describe("全権管理者の業務フロー: EMR同期→リスク評価→ケアプラン", () => {
    it("全権管理者がEMR同期→リスク評価→ハイリスクケア加算→ケアプラン作成を一貫して実行できる", async () => {
      mockAuth.mockResolvedValue(createAuthSuccess(SUPER_ADMIN_USER));

      // Step 1: EMR同期
      mockExecuteManualImport.mockResolvedValue({
        success: true,
        value: {
          totalAdmissions: 2,
          successCount: 2,
          failedCount: 0,
          failedAdmissionIds: [],
          vitalSignCount: 4,
          labResultCount: 6,
          prescriptionCount: 3,
          startedAt: "2026-01-15T00:00:00.000Z",
          completedAt: "2026-01-15T00:01:00.000Z",
        },
      });
      const syncResponse = await emrSyncRoute(
        createMockPostRequest("/api/emr-sync", {
          startDate: "2026-01-15",
          endDate: "2026-01-17",
        }),
      );
      const syncData = await syncResponse.json();
      expect(syncResponse.status).toBe(200);
      expect(syncData.value.totalAdmissions).toBe(2);

      // Step 2: リスク評価
      mockExecuteRiskAssessment.mockResolvedValue({
        success: true,
        value: {
          successCount: 2,
          failureCount: 0,
          indeterminateCount: 0,
          results: [
            { admissionId: 1, success: true, riskLevel: "HIGH" },
            { admissionId: 2, success: true, riskLevel: "LOW" },
          ],
        },
      });
      const riskResponse = await riskAssessmentRoute(
        createMockPostRequest("/api/risk-assessment", { admissionIds: [1, 2] }),
      );
      const riskData = await riskResponse.json();
      expect(riskResponse.status).toBe(200);
      expect(riskData.successCount).toBe(2);

      // Step 3: ハイリスクケア加算アセスメント
      mockSaveHighRiskKasanAction.mockResolvedValue({
        success: true,
        value: TEST_HIGH_RISK_KASAN_RESULT as never,
      });
      const kasanResponse = await saveHighRiskKasanRoute(
        createMockPostRequest("/api/high-risk-kasan/1", {
          medicalHistoryItems: TEST_HIGH_RISK_KASAN_ASSESSMENT.medicalHistoryItems,
        }) as never,
        { params: Promise.resolve({ admissionId: "1" }) },
      );
      const kasanData = await kasanResponse.json();
      expect(kasanResponse.status).toBe(200);
      expect(kasanData.isHighRisk).toBe(true);

      // Step 4: ケアプラン作成
      mockCreateCarePlanAction.mockResolvedValue({
        success: true,
        value: TEST_CARE_PLAN as never,
      });
      const cpResponse = await createCarePlanRoute(
        createMockPostRequest("/api/care-plan", { admissionId: 1 }),
      );
      expect(cpResponse.status).toBe(201);
    });
  });

  describe("未認証ユーザーの全API拒否テスト", () => {
    it("すべてのAPIエンドポイントで未認証アクセスが拒否される", async () => {
      mockAuth.mockResolvedValue(createAuthUnauthorized());

      // 入院一覧
      const admissionResponse = await getAdmissionsRoute(createMockGetRequest("/api/admissions"));
      expect(admissionResponse.status).toBe(401);

      // リスク評価
      const riskResponse = await riskAssessmentRoute(
        createMockPostRequest("/api/risk-assessment", { admissionIds: [1] }),
      );
      expect(riskResponse.status).toBe(401);

      // ケアプラン作成
      const cpResponse = await createCarePlanRoute(
        createMockPostRequest("/api/care-plan", { admissionId: 1 }),
      );
      expect(cpResponse.status).toBe(401);

      // ケアプラン詳細
      const detailResponse = await getCarePlanDetailRoute(
        createMockGetRequest("/api/care-plan/detail?admissionId=1"),
      );
      expect(detailResponse.status).toBe(401);

      // 転記
      const transcribeResponse = await createTranscriptionRoute(
        createMockPostRequest("/api/care-plan/detail/transcription", {
          carePlanId: 1,
          content: "テスト",
        }),
      );
      expect(transcribeResponse.status).toBe(401);

      // ハイリスクケア加算
      const kasanGetResponse = await getHighRiskKasanRoute(
        createMockGetRequest("/api/high-risk-kasan/1") as never,
        { params: Promise.resolve({ admissionId: "1" }) },
      );
      expect(kasanGetResponse.status).toBe(401);
    });
  });

  describe("権限不足ユーザーの制限テスト", () => {
    it("EMR同期は権限チェックで制御される", async () => {
      // 一般ユーザー向けにFORBIDDENを返す
      mockAuth.mockResolvedValue(createAuthForbidden());

      const syncResponse = await emrSyncRoute(
        createMockPostRequest("/api/emr-sync", {
          startDate: "2026-01-15",
          endDate: "2026-01-15",
        }),
      );
      expect(syncResponse.status).toBe(403);
    });

    it("リスク評価は権限チェックで制御される", async () => {
      mockAuth.mockResolvedValue(createAuthForbidden());

      const riskResponse = await riskAssessmentRoute(
        createMockPostRequest("/api/risk-assessment", { admissionIds: [1] }),
      );
      expect(riskResponse.status).toBe(403);
    });
  });

  describe("レスポンス形式の統一性テスト", () => {
    it("成功レスポンスが一貫した形式を返す", async () => {
      mockAuth.mockResolvedValue(createAuthSuccess(GENERAL_USER));
      mockGetAdmissionList.mockResolvedValue({
        success: true,
        value: TEST_ADMISSION_LIST_RESPONSE as never,
      });

      const response = await getAdmissionsRoute(createMockGetRequest("/api/admissions"));
      const data = await response.json();

      // レスポンスがオブジェクトであること
      expect(typeof data).toBe("object");
      // 一覧系はadmissionsとpaginationを含む
      expect(data).toHaveProperty("admissions");
      expect(data).toHaveProperty("pagination");
    });

    it("エラーレスポンスがerrorフィールドを含む", async () => {
      mockAuth.mockResolvedValue(createAuthUnauthorized());

      const response = await getAdmissionsRoute(createMockGetRequest("/api/admissions"));
      const data = await response.json();

      expect(data).toHaveProperty("error");
    });
  });
});
