import { describe, it, expect, vi, beforeEach } from "vitest";

// モジュールモック
vi.mock("@delispect/db", () => ({
  prisma: {
    systemSetting: {
      findMany: vi.fn(),
      upsert: vi.fn(),
    },
    userRole: {
      findMany: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock("@delispect/auth", () => ({
  validateSession: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({
    get: vi.fn().mockReturnValue({ value: "test-session-id" }),
    set: vi.fn(),
    delete: vi.fn(),
  }),
}));

vi.mock("@/lib/audit", () => ({
  logAudit: vi.fn().mockResolvedValue(undefined),
  AUDIT_ACTIONS: { SETTINGS_CHANGE: "SETTINGS_CHANGE" },
  AUDIT_TARGET_TYPES: { SYSTEM_SETTING: "SYSTEM_SETTING" },
}));

import { prisma } from "@delispect/db";
import { validateSession } from "@delispect/auth";

const mockedValidateSession = vi.mocked(validateSession);
const mockedUserFindUnique = vi.mocked(prisma.user.findUnique);
const mockedUserRoleFindMany = vi.mocked(prisma.userRole.findMany);
const mockedSystemSettingFindMany = vi.mocked(prisma.systemSetting.findMany);
const mockedTransaction = vi.mocked(prisma.$transaction);

/** SYSTEM_ADMIN セッションのセットアップ */
function setupSystemAdminSession() {
  mockedValidateSession.mockResolvedValue({
    sessionId: "test-session-id",
    userId: 1,
    username: "admin",
    expiresAt: new Date(Date.now() + 3600000),
  });
  mockedUserFindUnique.mockResolvedValue({
    id: 1,
    username: "admin",
    email: "admin@example.com",
  } as never);
  mockedUserRoleFindMany.mockResolvedValue([
    {
      userId: 1,
      roleId: 2,
      createdAt: new Date(),
      role: { name: "SYSTEM_ADMIN" },
    },
  ] as never);
}

/** FormDataを生成するヘルパー */
function createFormData(data: Record<string, string>): FormData {
  const formData = new FormData();
  for (const [key, value] of Object.entries(data)) {
    formData.set(key, value);
  }
  return formData;
}

describe("updateSystemSettingsAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("有効な入力で設定を更新できる", async () => {
    // Arrange
    setupSystemAdminSession();
    mockedSystemSettingFindMany.mockResolvedValue([]);
    mockedTransaction.mockResolvedValue([{}, {}] as never);

    const { updateSystemSettingsAction } = await import(
      "../server-actions/updateSystemSettingsAction"
    );

    const formData = createFormData({
      batchImportTime: "08:30",
      batchImportDateRangeDays: "5",
    });

    // Act
    const result = await updateSystemSettingsAction({}, formData);

    // Assert
    expect(result.success).toBe(true);
    expect(result.message).toContain("システム設定を更新しました");
  });

  it("未認証の場合エラーメッセージを返す", async () => {
    // Arrange
    mockedValidateSession.mockResolvedValue(null);

    const { updateSystemSettingsAction } = await import(
      "../server-actions/updateSystemSettingsAction"
    );

    const formData = createFormData({
      batchImportTime: "08:30",
      batchImportDateRangeDays: "5",
    });

    // Act
    const result = await updateSystemSettingsAction({}, formData);

    // Assert
    expect(result.success).toBe(false);
    expect(result.message).toContain("認証が必要です");
  });

  it("一般ユーザーの場合権限エラーメッセージを返す", async () => {
    // Arrange
    mockedValidateSession.mockResolvedValue({
      sessionId: "test-session-id",
      userId: 1,
      username: "general",
      expiresAt: new Date(Date.now() + 3600000),
    });
    mockedUserFindUnique.mockResolvedValue({
      id: 1,
      username: "general",
      email: "general@example.com",
    } as never);
    mockedUserRoleFindMany.mockResolvedValue([
      { userId: 1, roleId: 1, createdAt: new Date(), role: { name: "GENERAL" } },
    ] as never);

    const { updateSystemSettingsAction } = await import(
      "../server-actions/updateSystemSettingsAction"
    );

    const formData = createFormData({
      batchImportTime: "08:30",
      batchImportDateRangeDays: "5",
    });

    // Act
    const result = await updateSystemSettingsAction({}, formData);

    // Assert
    expect(result.success).toBe(false);
    expect(result.message).toContain("権限がありません");
  });

  it("不正な時刻形式の場合バリデーションエラーを返す", async () => {
    // Arrange
    setupSystemAdminSession();

    const { updateSystemSettingsAction } = await import(
      "../server-actions/updateSystemSettingsAction"
    );

    const formData = createFormData({
      batchImportTime: "invalid",
      batchImportDateRangeDays: "2",
    });

    // Act
    const result = await updateSystemSettingsAction({}, formData);

    // Assert
    expect(result.success).toBe(false);
    expect(result.fieldErrors?.batchImportTime).toBeDefined();
  });

  it("対象日数が範囲外の場合バリデーションエラーを返す", async () => {
    // Arrange
    setupSystemAdminSession();

    const { updateSystemSettingsAction } = await import(
      "../server-actions/updateSystemSettingsAction"
    );

    const formData = createFormData({
      batchImportTime: "06:00",
      batchImportDateRangeDays: "0",
    });

    // Act
    const result = await updateSystemSettingsAction({}, formData);

    // Assert
    expect(result.success).toBe(false);
    expect(result.fieldErrors?.batchImportDateRangeDays).toBeDefined();
  });

  it("DB更新エラー時にエラーメッセージを返す", async () => {
    // Arrange
    setupSystemAdminSession();
    mockedSystemSettingFindMany.mockResolvedValue([]);
    mockedTransaction.mockRejectedValue(new Error("DB error"));

    const { updateSystemSettingsAction } = await import(
      "../server-actions/updateSystemSettingsAction"
    );

    const formData = createFormData({
      batchImportTime: "08:30",
      batchImportDateRangeDays: "5",
    });

    // Act
    const result = await updateSystemSettingsAction({}, formData);

    // Assert
    expect(result.success).toBe(false);
    expect(result.message).toContain("失敗しました");
  });
});
