/**
 * 統合テスト: 電子カルテ同期フロー
 *
 * 電子カルテ同期→データ反映確認の業務フローを検証する。
 * EMR API・DB接続はモック化し、API Route層を統合的にテストする。
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

// Server Actionモック
vi.mock("@/features/emr-sync/server-actions/executeEmrSync", () => ({
  executeManualImport: vi.fn(),
}));

// インポートロックモック
vi.mock("@/features/emr-sync/repositories/importLock", () => ({
  checkImportLock: vi.fn(),
}));

import { GET, POST } from "@/app/api/emr-sync/route";
import { authorizeServerAction } from "@/lib/auth";
import { executeManualImport } from "@/features/emr-sync/server-actions/executeEmrSync";
import { checkImportLock } from "@/features/emr-sync/repositories/importLock";
import {
  SYSTEM_ADMIN_USER,
  SUPER_ADMIN_USER,
  createAuthSuccess,
  createAuthUnauthorized,
  createAuthForbidden,
} from "./helpers/testSeedData";

const mockAuth = vi.mocked(authorizeServerAction);
const mockExecuteManualImport = vi.mocked(executeManualImport);
const mockCheckImportLock = vi.mocked(checkImportLock);

function createMockNextRequest(url: string, options?: { method?: string; body?: unknown }) {
  const fullUrl = new URL(url, "http://localhost:3000");
  return {
    nextUrl: fullUrl,
    url: fullUrl.toString(),
    headers: new Headers(),
    cookies: { get: vi.fn() },
    json: vi.fn().mockResolvedValue(options?.body ?? {}),
    method: options?.method ?? "GET",
  } as never;
}

describe("統合テスト: 電子カルテ同期フロー", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/emr-sync（インポートロック状態確認）", () => {
    it("未認証の場合は401エラーを返す", async () => {
      mockAuth.mockResolvedValue(createAuthUnauthorized());

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
    });

    it("一般ユーザーはアクセスできない（403）", async () => {
      mockAuth.mockResolvedValue(createAuthForbidden());

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
    });

    it("システム管理者はロック状態を取得できる", async () => {
      mockAuth.mockResolvedValue(createAuthSuccess(SYSTEM_ADMIN_USER));
      mockCheckImportLock.mockResolvedValue({
        success: true,
        value: null,
      });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.value.isLocked).toBe(false);
    });

    it("全権管理者はロック状態を取得できる", async () => {
      mockAuth.mockResolvedValue(createAuthSuccess(SUPER_ADMIN_USER));
      mockCheckImportLock.mockResolvedValue({
        success: true,
        value: null,
      });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it("ロック中の場合はisLocked=trueを返す", async () => {
      mockAuth.mockResolvedValue(createAuthSuccess(SYSTEM_ADMIN_USER));
      mockCheckImportLock.mockResolvedValue({
        success: true,
        value: {
          id: 1,
          lockKey: "emr_sync",
          userId: 2,
          isActive: true,
          expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        },
      });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.value.isLocked).toBe(true);
    });
  });

  describe("POST /api/emr-sync（手動インポート実行）", () => {
    it("未認証の場合は401エラーを返す", async () => {
      mockAuth.mockResolvedValue(createAuthUnauthorized());

      const request = createMockNextRequest("/api/emr-sync", {
        method: "POST",
        body: { startDate: "2026-01-15", endDate: "2026-01-15" },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
    });

    it("一般ユーザーはインポートを実行できない（403）", async () => {
      mockAuth.mockResolvedValue(createAuthForbidden());

      const request = createMockNextRequest("/api/emr-sync", {
        method: "POST",
        body: { startDate: "2026-01-15", endDate: "2026-01-15" },
      });
      const response = await POST(request);

      expect(response.status).toBe(403);
    });

    it("システム管理者はインポートを実行できる", async () => {
      mockAuth.mockResolvedValue(createAuthSuccess(SYSTEM_ADMIN_USER));
      mockExecuteManualImport.mockResolvedValue({
        success: true,
        value: {
          totalAdmissions: 1,
          successCount: 1,
          failedCount: 0,
          failedAdmissionIds: [],
          vitalSignCount: 1,
          labResultCount: 2,
          prescriptionCount: 1,
          startedAt: "2026-01-15T00:00:00.000Z",
          completedAt: "2026-01-15T00:01:00.000Z",
        },
      });

      const request = createMockNextRequest("/api/emr-sync", {
        method: "POST",
        body: { startDate: "2026-01-15", endDate: "2026-01-15" },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.value.totalAdmissions).toBe(1);
      expect(data.value.successCount).toBe(1);
    });

    it("インポートロック中の場合は409エラーを返す", async () => {
      mockAuth.mockResolvedValue(createAuthSuccess(SYSTEM_ADMIN_USER));
      mockExecuteManualImport.mockResolvedValue({
        success: false,
        value: { code: "IMPORT_LOCKED", cause: "他のユーザーがインポート処理を実行中です。" },
      });

      const request = createMockNextRequest("/api/emr-sync", {
        method: "POST",
        body: { startDate: "2026-01-15", endDate: "2026-01-15" },
      });
      const response = await POST(request);

      expect(response.status).toBe(409);
    });

    it("バリデーションエラーの場合は400エラーを返す", async () => {
      mockAuth.mockResolvedValue(createAuthSuccess(SYSTEM_ADMIN_USER));

      const request = createMockNextRequest("/api/emr-sync", {
        method: "POST",
        body: { startDate: "", endDate: "" },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it("日付範囲が7日を超える場合は400エラーを返す", async () => {
      mockAuth.mockResolvedValue(createAuthSuccess(SYSTEM_ADMIN_USER));

      const request = createMockNextRequest("/api/emr-sync", {
        method: "POST",
        body: { startDate: "2026-01-01", endDate: "2026-01-10" },
      });
      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it("全権管理者もインポートを実行できる", async () => {
      mockAuth.mockResolvedValue(createAuthSuccess(SUPER_ADMIN_USER));
      mockExecuteManualImport.mockResolvedValue({
        success: true,
        value: {
          totalAdmissions: 3,
          successCount: 3,
          failedCount: 0,
          failedAdmissionIds: [],
          vitalSignCount: 5,
          labResultCount: 8,
          prescriptionCount: 3,
          startedAt: "2026-01-15T00:00:00.000Z",
          completedAt: "2026-01-15T00:01:00.000Z",
        },
      });

      const request = createMockNextRequest("/api/emr-sync", {
        method: "POST",
        body: { startDate: "2026-01-15", endDate: "2026-01-17" },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.value.totalAdmissions).toBe(3);
    });
  });
});
