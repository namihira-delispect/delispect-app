/**
 * 統合テスト: ケアプラン作成フロー
 *
 * ケアプラン作成→詳細表示→看護記録転記の業務フローを検証する。
 * DB接続はモック化し、API Route層を統合的にテストする。
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// 認証モック
vi.mock("@/lib/auth", () => ({
  authorizeServerAction: vi.fn(),
}));

// ケアプランクエリ・アクションモック
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

import { GET as getCarePlanRoute, POST as createCarePlanRoute } from "@/app/api/care-plan/route";
import { GET as getCarePlanDetailRoute } from "@/app/api/care-plan/detail/route";
import { GET as getTranscriptionRoute, POST as createTranscriptionRoute } from "@/app/api/care-plan/detail/transcription/route";
import { authorizeServerAction } from "@/lib/auth";
import { getCarePlan } from "@/features/care-plan/queries/getCarePlan";
import { createCarePlanAction } from "@/features/care-plan/server-actions/createCarePlanAction";
import { getCarePlanDetail } from "@/features/care-plan/detail/queries/getCarePlanDetail";
import { getTranscriptionHistory } from "@/features/care-plan/detail/queries/getTranscriptionHistory";
import { createTranscriptionAction } from "@/features/care-plan/detail/server-actions/createTranscriptionAction";
import {
  GENERAL_USER,
  TEST_CARE_PLAN,
  TEST_CARE_PLAN_DETAIL,
  TEST_TRANSCRIPTION,
  createAuthSuccess,
  createAuthUnauthorized,
} from "./helpers/testSeedData";

const mockAuth = vi.mocked(authorizeServerAction);
const mockGetCarePlan = vi.mocked(getCarePlan);
const mockCreateCarePlanAction = vi.mocked(createCarePlanAction);
const mockGetCarePlanDetail = vi.mocked(getCarePlanDetail);
const mockGetTranscriptionHistory = vi.mocked(getTranscriptionHistory);
const mockCreateTranscriptionAction = vi.mocked(createTranscriptionAction);

function createMockNextRequest(url: string, options?: { body?: unknown }) {
  const fullUrl = new URL(url, "http://localhost:3000");
  return {
    nextUrl: fullUrl,
    url: fullUrl.toString(),
    headers: new Headers(),
    cookies: { get: vi.fn() },
    json: options?.body ? vi.fn().mockResolvedValue(options.body) : vi.fn().mockRejectedValue(new Error("no body")),
    method: options?.body ? "POST" : "GET",
  } as never;
}

describe("統合テスト: ケアプラン作成フロー", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("ケアプラン取得 (GET /api/care-plan)", () => {
    it("未認証の場合は401エラーを返す", async () => {
      mockAuth.mockResolvedValue(createAuthUnauthorized());

      const request = createMockNextRequest("/api/care-plan?admissionId=1");
      const response = await getCarePlanRoute(request);

      expect(response.status).toBe(401);
    });

    it("認証済みユーザーがケアプランを取得できる", async () => {
      mockAuth.mockResolvedValue(createAuthSuccess(GENERAL_USER));
      mockGetCarePlan.mockResolvedValue({
        success: true,
        value: TEST_CARE_PLAN as never,
      });

      const request = createMockNextRequest("/api/care-plan?admissionId=1");
      const response = await getCarePlanRoute(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.carePlan).toBeDefined();
      expect(data.carePlan.admissionId).toBe(1);
      expect(data.carePlan.categories).toHaveLength(6);
    });

    it("admissionIdが指定されていない場合は400エラーを返す", async () => {
      mockAuth.mockResolvedValue(createAuthSuccess(GENERAL_USER));

      const request = createMockNextRequest("/api/care-plan");
      const response = await getCarePlanRoute(request);

      expect(response.status).toBe(400);
    });

    it("不正なadmissionIdの場合は400エラーを返す", async () => {
      mockAuth.mockResolvedValue(createAuthSuccess(GENERAL_USER));

      const request = createMockNextRequest("/api/care-plan?admissionId=abc");
      const response = await getCarePlanRoute(request);

      expect(response.status).toBe(400);
    });
  });

  describe("ケアプラン作成 (POST /api/care-plan)", () => {
    it("未認証の場合は401エラーを返す", async () => {
      mockAuth.mockResolvedValue(createAuthUnauthorized());

      const request = createMockNextRequest("/api/care-plan", { body: { admissionId: 1 } });
      const response = await createCarePlanRoute(request);

      expect(response.status).toBe(401);
    });

    it("認証済みユーザーがケアプランを作成できる", async () => {
      mockAuth.mockResolvedValue(createAuthSuccess(GENERAL_USER));
      mockCreateCarePlanAction.mockResolvedValue({
        success: true,
        value: TEST_CARE_PLAN as never,
      });

      const request = createMockNextRequest("/api/care-plan", { body: { admissionId: 1 } });
      const response = await createCarePlanRoute(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.admissionId).toBe(1);
    });

    it("既にケアプランが存在する場合は409エラーを返す", async () => {
      mockAuth.mockResolvedValue(createAuthSuccess(GENERAL_USER));
      mockCreateCarePlanAction.mockResolvedValue({
        success: false,
        value: { code: "CARE_PLAN_ALREADY_EXISTS", cause: "このケアプランは既に作成済みです" },
      });

      const request = createMockNextRequest("/api/care-plan", { body: { admissionId: 1 } });
      const response = await createCarePlanRoute(request);

      expect(response.status).toBe(409);
    });

    it("入院IDが存在しない場合は404エラーを返す", async () => {
      mockAuth.mockResolvedValue(createAuthSuccess(GENERAL_USER));
      mockCreateCarePlanAction.mockResolvedValue({
        success: false,
        value: { code: "NOT_FOUND", cause: "入院データが見つかりません" },
      });

      const request = createMockNextRequest("/api/care-plan", { body: { admissionId: 999 } });
      const response = await createCarePlanRoute(request);

      expect(response.status).toBe(404);
    });

    it("admissionIdが未指定の場合は400エラーを返す", async () => {
      mockAuth.mockResolvedValue(createAuthSuccess(GENERAL_USER));

      const request = createMockNextRequest("/api/care-plan", { body: {} });
      const response = await createCarePlanRoute(request);

      expect(response.status).toBe(400);
    });
  });

  describe("ケアプラン詳細取得 (GET /api/care-plan/detail)", () => {
    it("未認証の場合は401エラーを返す", async () => {
      mockAuth.mockResolvedValue(createAuthUnauthorized());

      const request = createMockNextRequest("/api/care-plan/detail?admissionId=1");
      const response = await getCarePlanDetailRoute(request);

      expect(response.status).toBe(401);
    });

    it("認証済みユーザーがケアプラン詳細を取得できる", async () => {
      mockAuth.mockResolvedValue(createAuthSuccess(GENERAL_USER));
      mockGetCarePlanDetail.mockResolvedValue({
        success: true,
        value: TEST_CARE_PLAN_DETAIL as never,
      });
      mockGetTranscriptionHistory.mockResolvedValue({
        success: true,
        value: [TEST_TRANSCRIPTION] as never,
      });

      const request = createMockNextRequest("/api/care-plan/detail?admissionId=1");
      const response = await getCarePlanDetailRoute(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.detail).toBeDefined();
      expect(data.detail.patientName).toBe("田中 太郎");
      expect(data.histories).toHaveLength(1);
    });

    it("ケアプランが未作成の場合はnullを返す", async () => {
      mockAuth.mockResolvedValue(createAuthSuccess(GENERAL_USER));
      mockGetCarePlanDetail.mockResolvedValue({
        success: true,
        value: null,
      });

      const request = createMockNextRequest("/api/care-plan/detail?admissionId=1");
      const response = await getCarePlanDetailRoute(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.detail).toBeNull();
      expect(data.histories).toEqual([]);
    });
  });

  describe("転記履歴取得 (GET /api/care-plan/detail/transcription)", () => {
    it("未認証の場合は401エラーを返す", async () => {
      mockAuth.mockResolvedValue(createAuthUnauthorized());

      const request = createMockNextRequest("/api/care-plan/detail/transcription?carePlanId=1");
      const response = await getTranscriptionRoute(request);

      expect(response.status).toBe(401);
    });

    it("認証済みユーザーが転記履歴を取得できる", async () => {
      mockAuth.mockResolvedValue(createAuthSuccess(GENERAL_USER));
      mockGetTranscriptionHistory.mockResolvedValue({
        success: true,
        value: [TEST_TRANSCRIPTION] as never,
      });

      const request = createMockNextRequest("/api/care-plan/detail/transcription?carePlanId=1");
      const response = await getTranscriptionRoute(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.histories).toHaveLength(1);
      expect(data.histories[0].content).toContain("脱水予防");
    });
  });

  describe("転記履歴作成 (POST /api/care-plan/detail/transcription)", () => {
    it("未認証の場合は401エラーを返す", async () => {
      mockAuth.mockResolvedValue(createAuthUnauthorized());

      const request = createMockNextRequest("/api/care-plan/detail/transcription", {
        body: { carePlanId: 1, content: "テスト転記" },
      });
      const response = await createTranscriptionRoute(request);

      expect(response.status).toBe(401);
    });

    it("認証済みユーザーが転記履歴を作成できる", async () => {
      mockAuth.mockResolvedValue(createAuthSuccess(GENERAL_USER));
      mockCreateTranscriptionAction.mockResolvedValue({
        success: true,
        value: TEST_TRANSCRIPTION as never,
      });

      const request = createMockNextRequest("/api/care-plan/detail/transcription", {
        body: { carePlanId: 1, content: "ケアプラン転記テスト内容。脱水予防のため水分摂取を促す。" },
      });
      const response = await createTranscriptionRoute(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.content).toContain("脱水予防");
    });

    it("転記内容が空の場合は400エラーを返す", async () => {
      mockAuth.mockResolvedValue(createAuthSuccess(GENERAL_USER));

      const request = createMockNextRequest("/api/care-plan/detail/transcription", {
        body: { carePlanId: 1, content: "" },
      });
      const response = await createTranscriptionRoute(request);

      expect(response.status).toBe(400);
    });

    it("carePlanIdが未指定の場合は400エラーを返す", async () => {
      mockAuth.mockResolvedValue(createAuthSuccess(GENERAL_USER));

      const request = createMockNextRequest("/api/care-plan/detail/transcription", {
        body: { content: "テスト転記" },
      });
      const response = await createTranscriptionRoute(request);

      expect(response.status).toBe(400);
    });

    it("存在しないケアプランに対する転記は404エラーを返す", async () => {
      mockAuth.mockResolvedValue(createAuthSuccess(GENERAL_USER));
      mockCreateTranscriptionAction.mockResolvedValue({
        success: false,
        value: { code: "NOT_FOUND", cause: "ケアプランが見つかりません" },
      });

      const request = createMockNextRequest("/api/care-plan/detail/transcription", {
        body: { carePlanId: 999, content: "テスト" },
      });
      const response = await createTranscriptionRoute(request);

      expect(response.status).toBe(404);
    });
  });

  describe("業務フロー一貫性テスト: ケアプラン作成→詳細表示→転記", () => {
    it("ケアプラン作成→取得→詳細表示→転記の一連のフローが正しく動作する", async () => {
      mockAuth.mockResolvedValue(createAuthSuccess(GENERAL_USER));

      // Step 1: ケアプラン作成
      mockCreateCarePlanAction.mockResolvedValue({
        success: true,
        value: TEST_CARE_PLAN as never,
      });
      const createRequest = createMockNextRequest("/api/care-plan", { body: { admissionId: 1 } });
      const createResponse = await createCarePlanRoute(createRequest);
      expect(createResponse.status).toBe(201);

      // Step 2: ケアプラン一覧取得で作成確認
      mockGetCarePlan.mockResolvedValue({
        success: true,
        value: TEST_CARE_PLAN as never,
      });
      const listRequest = createMockNextRequest("/api/care-plan?admissionId=1");
      const listResponse = await getCarePlanRoute(listRequest);
      const listData = await listResponse.json();
      expect(listResponse.status).toBe(200);
      expect(listData.carePlan.admissionId).toBe(1);

      // Step 3: ケアプラン詳細表示
      mockGetCarePlanDetail.mockResolvedValue({
        success: true,
        value: TEST_CARE_PLAN_DETAIL as never,
      });
      mockGetTranscriptionHistory.mockResolvedValue({
        success: true,
        value: [],
      });
      const detailRequest = createMockNextRequest("/api/care-plan/detail?admissionId=1");
      const detailResponse = await getCarePlanDetailRoute(detailRequest);
      const detailData = await detailResponse.json();
      expect(detailResponse.status).toBe(200);
      expect(detailData.detail.items).toHaveLength(2);
      expect(detailData.histories).toHaveLength(0);

      // Step 4: 看護記録への転記
      mockCreateTranscriptionAction.mockResolvedValue({
        success: true,
        value: TEST_TRANSCRIPTION as never,
      });
      const transcribeRequest = createMockNextRequest("/api/care-plan/detail/transcription", {
        body: { carePlanId: 1, content: "ケアプラン転記テスト内容。脱水予防のため水分摂取を促す。" },
      });
      const transcribeResponse = await createTranscriptionRoute(transcribeRequest);
      expect(transcribeResponse.status).toBe(201);

      // Step 5: 転記履歴の確認
      mockGetTranscriptionHistory.mockResolvedValue({
        success: true,
        value: [TEST_TRANSCRIPTION] as never,
      });
      const historyRequest = createMockNextRequest("/api/care-plan/detail/transcription?carePlanId=1");
      const historyResponse = await getTranscriptionRoute(historyRequest);
      const historyData = await historyResponse.json();
      expect(historyResponse.status).toBe(200);
      expect(historyData.histories).toHaveLength(1);
    });
  });
});
