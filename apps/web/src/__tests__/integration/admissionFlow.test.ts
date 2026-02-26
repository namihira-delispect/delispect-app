/**
 * 統合テスト: 入院一覧表示フロー
 *
 * ログイン → 患者入院一覧表示の業務フローを検証する。
 * DB接続はモック化し、API Route層の認証・バリデーション・レスポンスを統合的にテストする。
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// 認証モック
vi.mock("@/lib/auth", () => ({
  authorizeServerAction: vi.fn(),
}));

// クエリモック
vi.mock("@/features/admissions/queries/getAdmissionList", () => ({
  getAdmissionList: vi.fn(),
}));

import { GET } from "@/app/api/admissions/route";
import { authorizeServerAction } from "@/lib/auth";
import { getAdmissionList } from "@/features/admissions/queries/getAdmissionList";
import {
  GENERAL_USER,
  SYSTEM_ADMIN_USER,
  SUPER_ADMIN_USER,
  TEST_ADMISSION_LIST_RESPONSE,
  createAuthSuccess,
  createAuthUnauthorized,
} from "./helpers/testSeedData";

const mockAuth = vi.mocked(authorizeServerAction);
const mockGetAdmissionList = vi.mocked(getAdmissionList);

/**
 * NextRequestのモックを作成する
 */
function createMockNextRequest(url: string) {
  const fullUrl = new URL(url, "http://localhost:3000");
  return {
    nextUrl: fullUrl,
    url: fullUrl.toString(),
    headers: new Headers(),
    cookies: { get: vi.fn() },
  } as never;
}

describe("統合テスト: 入院一覧表示フロー", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("認証チェック", () => {
    it("未認証の場合は401エラーを返す", async () => {
      mockAuth.mockResolvedValue(createAuthUnauthorized());

      const request = createMockNextRequest("/api/admissions");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBeDefined();
    });

    it("認証済みユーザーはアクセスできる", async () => {
      mockAuth.mockResolvedValue(createAuthSuccess(GENERAL_USER));
      mockGetAdmissionList.mockResolvedValue({
        success: true,
        value: TEST_ADMISSION_LIST_RESPONSE as never,
      });

      const request = createMockNextRequest("/api/admissions");
      const response = await GET(request);

      expect(response.status).toBe(200);
    });
  });

  describe("各ロールからの一覧取得", () => {
    it("一般ユーザーが入院一覧を取得できる", async () => {
      mockAuth.mockResolvedValue(createAuthSuccess(GENERAL_USER));
      mockGetAdmissionList.mockResolvedValue({
        success: true,
        value: TEST_ADMISSION_LIST_RESPONSE as never,
      });

      const request = createMockNextRequest("/api/admissions");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.admissions).toHaveLength(2);
      expect(data.pagination.totalItems).toBe(2);
    });

    it("システム管理者が入院一覧を取得できる", async () => {
      mockAuth.mockResolvedValue(createAuthSuccess(SYSTEM_ADMIN_USER));
      mockGetAdmissionList.mockResolvedValue({
        success: true,
        value: TEST_ADMISSION_LIST_RESPONSE as never,
      });

      const request = createMockNextRequest("/api/admissions");
      const response = await GET(request);

      expect(response.status).toBe(200);
    });

    it("全権管理者が入院一覧を取得できる", async () => {
      mockAuth.mockResolvedValue(createAuthSuccess(SUPER_ADMIN_USER));
      mockGetAdmissionList.mockResolvedValue({
        success: true,
        value: TEST_ADMISSION_LIST_RESPONSE as never,
      });

      const request = createMockNextRequest("/api/admissions");
      const response = await GET(request);

      expect(response.status).toBe(200);
    });
  });

  describe("検索パラメータ付きの取得", () => {
    it("リスクレベルで絞り込める", async () => {
      mockAuth.mockResolvedValue(createAuthSuccess(GENERAL_USER));
      mockGetAdmissionList.mockResolvedValue({
        success: true,
        value: {
          admissions: [TEST_ADMISSION_LIST_RESPONSE.admissions[1]],
          pagination: { currentPage: 1, totalPages: 1, totalItems: 1, pageSize: 20 },
        } as never,
      });

      const request = createMockNextRequest("/api/admissions?riskLevel=HIGH");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(mockGetAdmissionList).toHaveBeenCalledWith(
        expect.objectContaining({ riskLevel: "HIGH" }),
      );
      expect(data.admissions).toHaveLength(1);
    });

    it("患者名で検索できる", async () => {
      mockAuth.mockResolvedValue(createAuthSuccess(GENERAL_USER));
      mockGetAdmissionList.mockResolvedValue({
        success: true,
        value: {
          admissions: [TEST_ADMISSION_LIST_RESPONSE.admissions[0]],
          pagination: { currentPage: 1, totalPages: 1, totalItems: 1, pageSize: 20 },
        } as never,
      });

      const request = createMockNextRequest("/api/admissions?name=%E7%94%B0%E4%B8%AD");
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(mockGetAdmissionList).toHaveBeenCalledWith(
        expect.objectContaining({ name: "田中" }),
      );
    });

    it("日付範囲で絞り込める", async () => {
      mockAuth.mockResolvedValue(createAuthSuccess(GENERAL_USER));
      mockGetAdmissionList.mockResolvedValue({
        success: true,
        value: TEST_ADMISSION_LIST_RESPONSE as never,
      });

      const request = createMockNextRequest(
        "/api/admissions?admissionDateFrom=2026-01-01&admissionDateTo=2026-01-31",
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(mockGetAdmissionList).toHaveBeenCalledWith(
        expect.objectContaining({
          admissionDateFrom: "2026-01-01",
          admissionDateTo: "2026-01-31",
        }),
      );
    });

    it("ページネーション指定が渡せる", async () => {
      mockAuth.mockResolvedValue(createAuthSuccess(GENERAL_USER));
      mockGetAdmissionList.mockResolvedValue({
        success: true,
        value: TEST_ADMISSION_LIST_RESPONSE as never,
      });

      const request = createMockNextRequest("/api/admissions?page=2&pageSize=10");
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(mockGetAdmissionList).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2, pageSize: 10 }),
      );
    });
  });

  describe("バリデーションエラー", () => {
    it("不正なriskLevelパラメータは400エラーを返す", async () => {
      mockAuth.mockResolvedValue(createAuthSuccess(GENERAL_USER));

      const request = createMockNextRequest("/api/admissions?riskLevel=INVALID");
      const response = await GET(request);

      expect(response.status).toBe(400);
    });

    it("不正な日付形式は400エラーを返す", async () => {
      mockAuth.mockResolvedValue(createAuthSuccess(GENERAL_USER));

      const request = createMockNextRequest("/api/admissions?admissionDateFrom=not-a-date");
      const response = await GET(request);

      expect(response.status).toBe(400);
    });
  });

  describe("サーバーエラー", () => {
    it("クエリ実行エラーの場合は500エラーを返す", async () => {
      mockAuth.mockResolvedValue(createAuthSuccess(GENERAL_USER));
      mockGetAdmissionList.mockResolvedValue({
        success: false,
        value: { code: "DB_ERROR", cause: "データベース接続エラー" },
      });

      const request = createMockNextRequest("/api/admissions");
      const response = await GET(request);

      expect(response.status).toBe(500);
    });
  });
});
