import { describe, it, expect, vi, beforeEach } from "vitest";

// 認証のモック
vi.mock("@/lib/auth", () => ({
  authorizeServerAction: vi.fn(),
}));

// 監査ログのモック
vi.mock("@/lib/audit", () => ({
  recordAuditLog: vi.fn().mockResolvedValue(null),
  AUDIT_ACTIONS: { EMR_SYNC: "EMR_SYNC" },
  AUDIT_TARGET_TYPES: { EMR_DATA: "EMR_DATA" },
}));

// 電子カルテAPIのモック
vi.mock("@/lib/emr", () => ({
  fetchEmrData: vi.fn(),
}));

// リポジトリのモック
vi.mock("../repositories/importLock", () => ({
  acquireImportLock: vi.fn(),
  releaseImportLock: vi.fn(),
}));

vi.mock("../repositories/upsertEmrData", () => ({
  upsertSingleAdmission: vi.fn(),
}));

import { executeManualImport } from "../server-actions/executeEmrSync";
import { authorizeServerAction } from "@/lib/auth";
import { fetchEmrData } from "@/lib/emr";
import { acquireImportLock, releaseImportLock } from "../repositories/importLock";
import { upsertSingleAdmission } from "../repositories/upsertEmrData";
import type { EmrPatientDataResponse } from "../types";

const mockAuthorize = vi.mocked(authorizeServerAction);
const mockFetchEmrData = vi.mocked(fetchEmrData);
const mockAcquireLock = vi.mocked(acquireImportLock);
const mockReleaseLock = vi.mocked(releaseImportLock);
const mockUpsert = vi.mocked(upsertSingleAdmission);

const mockUser = {
  id: 1,
  username: "admin",
  email: "admin@example.com",
  roles: ["SYSTEM_ADMIN" as const],
};

const mockEmrData: EmrPatientDataResponse = {
  admission: {
    externalAdmissionId: "ADM-001",
    patientId: "P000001",
    lastName: "田中",
    firstName: "太郎",
    birthday: "1955-03-15",
    sex: "MALE",
    admissionDate: "2026-01-15",
  },
  vitalSigns: [
    {
      admissionId: "ADM-001",
      bodyTemperature: 36.5,
      pulse: 72,
      systolicBp: 120,
      diastolicBp: 80,
      spo2: 98.0,
      respiratoryRate: 16,
      measuredAt: "2026-01-15T08:00:00.000Z",
    },
  ],
  labResults: [
    {
      admissionId: "ADM-001",
      itemCode: "WBC",
      value: 5500,
      measuredAt: "2026-01-15T06:00:00.000Z",
    },
  ],
  prescriptions: [
    {
      admissionId: "ADM-001",
      drugName: "ロキソプロフェン錠60mg",
      prescriptionType: "ORAL",
      prescribedAt: "2026-01-15T10:00:00.000Z",
    },
  ],
};

describe("executeManualImport", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("認証エラー", () => {
    it("認証失敗時にエラーを返す", async () => {
      mockAuthorize.mockResolvedValue({
        success: false,
        value: { code: "UNAUTHORIZED", cause: "認証が必要です" },
      });

      const result = await executeManualImport({
        startDate: "2026-01-15",
        endDate: "2026-01-15",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.value.code).toBe("UNAUTHORIZED");
      }
    });

    it("権限不足時にエラーを返す", async () => {
      mockAuthorize.mockResolvedValue({
        success: false,
        value: { code: "FORBIDDEN", cause: "この操作を実行する権限がありません" },
      });

      const result = await executeManualImport({
        startDate: "2026-01-15",
        endDate: "2026-01-15",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.value.code).toBe("FORBIDDEN");
      }
    });
  });

  describe("バリデーションエラー", () => {
    it("日付範囲が7日以上の場合にエラーを返す", async () => {
      mockAuthorize.mockResolvedValue({ success: true, value: mockUser });

      const result = await executeManualImport({
        startDate: "2026-01-01",
        endDate: "2026-01-08",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.value.code).toBe("INVALID_INPUT");
      }
    });

    it("開始日が空の場合にエラーを返す", async () => {
      mockAuthorize.mockResolvedValue({ success: true, value: mockUser });

      const result = await executeManualImport({
        startDate: "",
        endDate: "2026-01-15",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.value.code).toBe("INVALID_INPUT");
      }
    });
  });

  describe("排他制御", () => {
    it("ロック取得失敗時にエラーを返す", async () => {
      mockAuthorize.mockResolvedValue({ success: true, value: mockUser });
      mockAcquireLock.mockResolvedValue({
        success: false,
        value: {
          code: "IMPORT_LOCKED",
          cause: "他のユーザーがインポート処理を実行中です。",
        },
      });

      const result = await executeManualImport({
        startDate: "2026-01-15",
        endDate: "2026-01-15",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.value.code).toBe("IMPORT_LOCKED");
      }
    });
  });

  describe("正常系", () => {
    it("全件成功の場合に正しい結果を返す", async () => {
      mockAuthorize.mockResolvedValue({ success: true, value: mockUser });
      mockAcquireLock.mockResolvedValue({
        success: true,
        value: {
          id: 1,
          lockKey: "emr_sync",
          userId: 1,
          isActive: true,
          expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        },
      });
      mockFetchEmrData.mockResolvedValue([mockEmrData]);
      mockUpsert.mockResolvedValue({
        success: true,
        value: {
          admissionId: "ADM-001",
          vitalSignCount: 1,
          labResultCount: 1,
          prescriptionCount: 1,
        },
      });
      mockReleaseLock.mockResolvedValue({ success: true, value: undefined });

      const result = await executeManualImport({
        startDate: "2026-01-15",
        endDate: "2026-01-15",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.totalAdmissions).toBe(1);
        expect(result.value.successCount).toBe(1);
        expect(result.value.failedCount).toBe(0);
        expect(result.value.failedAdmissionIds).toHaveLength(0);
        expect(result.value.vitalSignCount).toBe(1);
        expect(result.value.labResultCount).toBe(1);
        expect(result.value.prescriptionCount).toBe(1);
      }
    });

    it("一部失敗がある場合に正しい結果を返す", async () => {
      mockAuthorize.mockResolvedValue({ success: true, value: mockUser });
      mockAcquireLock.mockResolvedValue({
        success: true,
        value: {
          id: 1,
          lockKey: "emr_sync",
          userId: 1,
          isActive: true,
          expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        },
      });

      const emrData2: EmrPatientDataResponse = {
        ...mockEmrData,
        admission: { ...mockEmrData.admission, externalAdmissionId: "ADM-002" },
      };
      mockFetchEmrData.mockResolvedValue([mockEmrData, emrData2]);

      mockUpsert
        .mockResolvedValueOnce({
          success: true,
          value: {
            admissionId: "ADM-001",
            vitalSignCount: 1,
            labResultCount: 1,
            prescriptionCount: 1,
          },
        })
        .mockResolvedValueOnce({
          success: false,
          value: { code: "UPSERT_ERROR", cause: "入院ID ADM-002 のデータ更新に失敗しました" },
        });
      mockReleaseLock.mockResolvedValue({ success: true, value: undefined });

      const result = await executeManualImport({
        startDate: "2026-01-15",
        endDate: "2026-01-15",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.totalAdmissions).toBe(2);
        expect(result.value.successCount).toBe(1);
        expect(result.value.failedCount).toBe(1);
        expect(result.value.failedAdmissionIds).toContain("ADM-002");
      }
    });

    it("処理完了後にロックを解放する", async () => {
      mockAuthorize.mockResolvedValue({ success: true, value: mockUser });
      mockAcquireLock.mockResolvedValue({
        success: true,
        value: {
          id: 42,
          lockKey: "emr_sync",
          userId: 1,
          isActive: true,
          expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        },
      });
      mockFetchEmrData.mockResolvedValue([]);
      mockReleaseLock.mockResolvedValue({ success: true, value: undefined });

      await executeManualImport({
        startDate: "2026-01-15",
        endDate: "2026-01-15",
      });

      expect(mockReleaseLock).toHaveBeenCalledWith(42);
    });
  });
});
