/**
 * 統合テスト: リスク評価実行フロー
 *
 * リスク評価実行→結果確認の業務フローを検証する。
 * ML API・DB接続はモック化し、API Route層を統合的にテストする。
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// 認証モック
vi.mock("@/lib/auth", () => ({
  authorizeServerAction: vi.fn(),
}));

// Server Actionモック
vi.mock("@/features/risk-assessment/server-actions", () => ({
  executeRiskAssessmentAction: vi.fn(),
}));

import { POST } from "@/app/api/risk-assessment/route";
import { authorizeServerAction } from "@/lib/auth";
import { executeRiskAssessmentAction } from "@/features/risk-assessment/server-actions";
import {
  SYSTEM_ADMIN_USER,
  SUPER_ADMIN_USER,
  TEST_RISK_RESULT,
  createAuthSuccess,
  createAuthUnauthorized,
  createAuthForbidden,
} from "./helpers/testSeedData";

const mockAuth = vi.mocked(authorizeServerAction);
const mockExecuteRiskAssessment = vi.mocked(executeRiskAssessmentAction);

function createMockNextRequest(body: unknown) {
  const fullUrl = new URL("/api/risk-assessment", "http://localhost:3000");
  return {
    nextUrl: fullUrl,
    url: fullUrl.toString(),
    headers: new Headers(),
    cookies: { get: vi.fn() },
    json: vi.fn().mockResolvedValue(body),
    method: "POST",
  } as never;
}

describe("統合テスト: リスク評価実行フロー", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("認証・認可チェック", () => {
    it("未認証の場合は401エラーを返す", async () => {
      mockAuth.mockResolvedValue(createAuthUnauthorized());

      const request = createMockNextRequest({ admissionIds: [1] });
      const response = await POST(request);

      expect(response.status).toBe(401);
    });

    it("権限不足の場合は403エラーを返す", async () => {
      mockAuth.mockResolvedValue(createAuthForbidden());

      const request = createMockNextRequest({ admissionIds: [1] });
      const response = await POST(request);

      expect(response.status).toBe(403);
    });

    it("一般ユーザーの場合もauthorizeServerActionの結果に従う", async () => {
      // API Route側はauthorizeServerAction(["SYSTEM_ADMIN", "SUPER_ADMIN"])を呼ぶ
      // 一般ユーザーの場合、authorizationの段階でFORBIDDENが返る想定
      mockAuth.mockResolvedValue(createAuthForbidden());

      const request = createMockNextRequest({ admissionIds: [1] });
      const response = await POST(request);

      expect(response.status).toBe(403);
    });
  });

  describe("正常系: リスク評価実行", () => {
    it("システム管理者が単一入院に対してリスク評価を実行できる", async () => {
      mockAuth.mockResolvedValue(createAuthSuccess(SYSTEM_ADMIN_USER));
      mockExecuteRiskAssessment.mockResolvedValue({
        success: true,
        value: {
          successCount: 1,
          failureCount: 0,
          indeterminateCount: 0,
          results: [
            {
              admissionId: 1,
              success: true,
              riskLevel: TEST_RISK_RESULT.riskLevel,
            },
          ],
        },
      });

      const request = createMockNextRequest({ admissionIds: [1] });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.successCount).toBe(1);
      expect(data.results[0].riskLevel).toBe("HIGH");
    });

    it("全権管理者が複数入院に対して一括リスク評価を実行できる", async () => {
      mockAuth.mockResolvedValue(createAuthSuccess(SUPER_ADMIN_USER));
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

      const request = createMockNextRequest({ admissionIds: [1, 2] });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.successCount).toBe(2);
      expect(data.results).toHaveLength(2);
    });

    it("一部の入院IDで失敗した場合も全体の結果を返す", async () => {
      mockAuth.mockResolvedValue(createAuthSuccess(SYSTEM_ADMIN_USER));
      mockExecuteRiskAssessment.mockResolvedValue({
        success: true,
        value: {
          successCount: 1,
          failureCount: 1,
          indeterminateCount: 0,
          results: [
            { admissionId: 1, success: true, riskLevel: "HIGH" },
            { admissionId: 999, success: false, error: "入院IDが見つかりません" },
          ],
        },
      });

      const request = createMockNextRequest({ admissionIds: [1, 999] });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.successCount).toBe(1);
      expect(data.failureCount).toBe(1);
    });

    it("判定不能の結果がindeterminateCountに計上される", async () => {
      mockAuth.mockResolvedValue(createAuthSuccess(SYSTEM_ADMIN_USER));
      mockExecuteRiskAssessment.mockResolvedValue({
        success: true,
        value: {
          successCount: 0,
          failureCount: 0,
          indeterminateCount: 1,
          results: [
            {
              admissionId: 1,
              success: true,
              riskLevel: "INDETERMINATE",
              missingFields: ["年齢"],
            },
          ],
        },
      });

      const request = createMockNextRequest({ admissionIds: [1] });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.indeterminateCount).toBe(1);
    });
  });

  describe("バリデーションエラー", () => {
    it("空の入院IDリストの場合は400エラーを返す", async () => {
      mockAuth.mockResolvedValue(createAuthSuccess(SYSTEM_ADMIN_USER));
      mockExecuteRiskAssessment.mockResolvedValue({
        success: false,
        value: { code: "INVALID_INPUT", cause: "評価対象を1件以上選択してください" },
      });

      const request = createMockNextRequest({ admissionIds: [] });
      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it("不正なリクエストボディの場合は400エラーを返す", async () => {
      mockAuth.mockResolvedValue(createAuthSuccess(SYSTEM_ADMIN_USER));

      // json()がエラーを投げるケース
      const request = {
        nextUrl: new URL("/api/risk-assessment", "http://localhost:3000"),
        url: "http://localhost:3000/api/risk-assessment",
        headers: new Headers(),
        cookies: { get: vi.fn() },
        json: vi.fn().mockRejectedValue(new Error("invalid json")),
        method: "POST",
      } as never;
      const response = await POST(request);

      expect(response.status).toBe(400);
    });
  });

  describe("サーバーエラー", () => {
    it("評価処理エラーの場合は500エラーを返す", async () => {
      mockAuth.mockResolvedValue(createAuthSuccess(SYSTEM_ADMIN_USER));
      mockExecuteRiskAssessment.mockResolvedValue({
        success: false,
        value: { code: "RISK_ASSESSMENT_ERROR", cause: "リスク評価処理でエラーが発生しました" },
      });

      const request = createMockNextRequest({ admissionIds: [1] });
      const response = await POST(request);

      expect(response.status).toBe(500);
    });
  });
});
