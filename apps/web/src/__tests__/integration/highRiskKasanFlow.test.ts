/**
 * 統合テスト: ハイリスクケア加算アセスメントフロー
 *
 * ハイリスクケア加算アセスメントの取得・保存の業務フローを検証する。
 * DB接続はモック化し、API Route層を統合的にテストする。
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// 認証モック
vi.mock("@/lib/auth", () => ({
  authorizeServerAction: vi.fn(),
}));

// クエリ・アクションモック
vi.mock("@/features/high-risk-kasan/queries/getHighRiskKasanAssessment", () => ({
  getHighRiskKasanAssessment: vi.fn(),
}));

vi.mock("@/features/high-risk-kasan/server-actions/saveHighRiskKasanAction", () => ({
  saveHighRiskKasanAction: vi.fn(),
}));

import { GET, PUT } from "@/app/api/high-risk-kasan/[admissionId]/route";
import { authorizeServerAction } from "@/lib/auth";
import { getHighRiskKasanAssessment } from "@/features/high-risk-kasan/queries/getHighRiskKasanAssessment";
import { saveHighRiskKasanAction } from "@/features/high-risk-kasan/server-actions/saveHighRiskKasanAction";
import {
  GENERAL_USER,
  TEST_HIGH_RISK_KASAN_ASSESSMENT,
  TEST_HIGH_RISK_KASAN_RESULT,
  createAuthSuccess,
  createAuthUnauthorized,
} from "./helpers/testSeedData";

const mockAuth = vi.mocked(authorizeServerAction);
const mockGetAssessment = vi.mocked(getHighRiskKasanAssessment);
const mockSaveAssessment = vi.mocked(saveHighRiskKasanAction);

function createMockNextRequest(options?: { body?: unknown }) {
  const fullUrl = new URL("/api/high-risk-kasan/1", "http://localhost:3000");
  return {
    nextUrl: fullUrl,
    url: fullUrl.toString(),
    headers: new Headers(),
    cookies: { get: vi.fn() },
    json: options?.body
      ? vi.fn().mockResolvedValue(options.body)
      : vi.fn().mockRejectedValue(new Error("no body")),
  } as never;
}

function createParams(admissionId: string) {
  return { params: Promise.resolve({ admissionId }) };
}

describe("統合テスト: ハイリスクケア加算アセスメントフロー", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/high-risk-kasan/[admissionId]（アセスメント取得）", () => {
    it("未認証の場合は401エラーを返す", async () => {
      mockAuth.mockResolvedValue(createAuthUnauthorized());

      const request = createMockNextRequest();
      const response = await GET(request, createParams("1"));

      expect(response.status).toBe(401);
    });

    it("認証済みユーザーがアセスメント情報を取得できる", async () => {
      mockAuth.mockResolvedValue(createAuthSuccess(GENERAL_USER));
      mockGetAssessment.mockResolvedValue({
        success: true,
        value: TEST_HIGH_RISK_KASAN_RESULT as never,
      });

      const request = createMockNextRequest();
      const response = await GET(request, createParams("1"));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.isHighRisk).toBe(true);
      expect(data.matchedCount).toBe(2);
    });

    it("不正なadmissionIdの場合は400エラーを返す", async () => {
      mockAuth.mockResolvedValue(createAuthSuccess(GENERAL_USER));

      const request = createMockNextRequest();
      const response = await GET(request, createParams("abc"));

      expect(response.status).toBe(400);
    });

    it("入院データが存在しない場合は404エラーを返す", async () => {
      mockAuth.mockResolvedValue(createAuthSuccess(GENERAL_USER));
      mockGetAssessment.mockResolvedValue({
        success: false,
        value: { code: "NOT_FOUND", cause: "入院データが見つかりません" },
      });

      const request = createMockNextRequest();
      const response = await GET(request, createParams("999"));

      expect(response.status).toBe(404);
    });
  });

  describe("PUT /api/high-risk-kasan/[admissionId]（アセスメント保存）", () => {
    it("未認証の場合は401エラーを返す", async () => {
      mockAuth.mockResolvedValue(createAuthUnauthorized());

      const request = createMockNextRequest({
        body: TEST_HIGH_RISK_KASAN_ASSESSMENT.medicalHistoryItems,
      });
      const response = await PUT(request, createParams("1"));

      expect(response.status).toBe(401);
    });

    it("認証済みユーザーがアセスメントを保存できる", async () => {
      mockAuth.mockResolvedValue(createAuthSuccess(GENERAL_USER));
      mockSaveAssessment.mockResolvedValue({
        success: true,
        value: TEST_HIGH_RISK_KASAN_RESULT as never,
      });

      const request = createMockNextRequest({
        body: { medicalHistoryItems: TEST_HIGH_RISK_KASAN_ASSESSMENT.medicalHistoryItems },
      });
      const response = await PUT(request, createParams("1"));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.isHighRisk).toBe(true);
      expect(data.matchedCount).toBe(2);
    });

    it("必須項目が不足している場合は400エラーを返す", async () => {
      mockAuth.mockResolvedValue(createAuthSuccess(GENERAL_USER));

      const request = createMockNextRequest({
        body: { medicalHistoryItems: { hasDementia: true } }, // 不完全なデータ
      });
      const response = await PUT(request, createParams("1"));

      expect(response.status).toBe(400);
    });

    it("入院データが存在しない場合は404エラーを返す", async () => {
      mockAuth.mockResolvedValue(createAuthSuccess(GENERAL_USER));
      mockSaveAssessment.mockResolvedValue({
        success: false,
        value: { code: "NOT_FOUND", cause: "入院データが見つかりません" },
      });

      const request = createMockNextRequest({
        body: { medicalHistoryItems: TEST_HIGH_RISK_KASAN_ASSESSMENT.medicalHistoryItems },
      });
      const response = await PUT(request, createParams("999"));

      expect(response.status).toBe(404);
    });
  });

  describe("業務フロー: アセスメント取得→保存→再取得", () => {
    it("アセスメント取得後に保存し、再取得で反映を確認できる", async () => {
      mockAuth.mockResolvedValue(createAuthSuccess(GENERAL_USER));

      // Step 1: 初回取得（未評価状態）
      mockGetAssessment.mockResolvedValueOnce({
        success: true,
        value: {
          admissionId: 1,
          isHighRisk: false,
          matchedCount: 0,
          items: {
            hasDementia: false,
            hasOrganicBrainDamage: false,
            isHeavyAlcohol: false,
            hasDeliriumHistory: false,
            hasGeneralAnesthesia: false,
          },
        } as never,
      });

      const getRequest1 = createMockNextRequest();
      const getResponse1 = await GET(getRequest1, createParams("1"));
      const getData1 = await getResponse1.json();
      expect(getResponse1.status).toBe(200);
      expect(getData1.isHighRisk).toBe(false);

      // Step 2: アセスメント保存
      mockSaveAssessment.mockResolvedValue({
        success: true,
        value: TEST_HIGH_RISK_KASAN_RESULT as never,
      });

      const putRequest = createMockNextRequest({
        body: { medicalHistoryItems: TEST_HIGH_RISK_KASAN_ASSESSMENT.medicalHistoryItems },
      });
      const putResponse = await PUT(putRequest, createParams("1"));
      expect(putResponse.status).toBe(200);

      // Step 3: 再取得（保存後の状態）
      mockGetAssessment.mockResolvedValueOnce({
        success: true,
        value: TEST_HIGH_RISK_KASAN_RESULT as never,
      });

      const getRequest2 = createMockNextRequest();
      const getResponse2 = await GET(getRequest2, createParams("1"));
      const getData2 = await getResponse2.json();
      expect(getResponse2.status).toBe(200);
      expect(getData2.isHighRisk).toBe(true);
      expect(getData2.matchedCount).toBe(2);
    });
  });
});
