import { describe, it, expect, vi, beforeEach } from "vitest";

// モジュールモック
vi.mock("@delispect/db", () => ({
  prisma: {
    systemSetting: {
      findMany: vi.fn(),
    },
    userRole: {
      findMany: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
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

import { prisma } from "@delispect/db";
import { validateSession } from "@delispect/auth";

const mockedValidateSession = vi.mocked(validateSession);
const mockedUserFindUnique = vi.mocked(prisma.user.findUnique);
const mockedUserRoleFindMany = vi.mocked(prisma.userRole.findMany);
const mockedSystemSettingFindMany = vi.mocked(prisma.systemSetting.findMany);

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

describe("getSystemSettingsAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("DBに設定値がある場合その値を返す", async () => {
    // Arrange
    setupSystemAdminSession();
    mockedSystemSettingFindMany.mockResolvedValue([
      {
        id: 1,
        key: "batch_import_time",
        value: "08:30",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        key: "batch_import_date_range_days",
        value: "5",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const { getSystemSettingsAction } = await import(
      "../server-actions/getSystemSettingsAction"
    );

    // Act
    const result = await getSystemSettingsAction();

    // Assert
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.batchImportTime).toBe("08:30");
      expect(result.value.batchImportDateRangeDays).toBe(5);
    }
  });

  it("DBに設定値がない場合デフォルト値を返す", async () => {
    // Arrange
    setupSystemAdminSession();
    mockedSystemSettingFindMany.mockResolvedValue([]);

    const { getSystemSettingsAction } = await import(
      "../server-actions/getSystemSettingsAction"
    );

    // Act
    const result = await getSystemSettingsAction();

    // Assert
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.batchImportTime).toBe("06:00");
      expect(result.value.batchImportDateRangeDays).toBe(2);
    }
  });

  it("未認証の場合UNAUTHORIZEDエラーを返す", async () => {
    // Arrange
    mockedValidateSession.mockResolvedValue(null);

    const { getSystemSettingsAction } = await import(
      "../server-actions/getSystemSettingsAction"
    );

    // Act
    const result = await getSystemSettingsAction();

    // Assert
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.value.code).toBe("UNAUTHORIZED");
    }
  });

  it("一般ユーザーの場合FORBIDDENエラーを返す", async () => {
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

    const { getSystemSettingsAction } = await import(
      "../server-actions/getSystemSettingsAction"
    );

    // Act
    const result = await getSystemSettingsAction();

    // Assert
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.value.code).toBe("FORBIDDEN");
    }
  });

  it("DB取得エラー時にINTERNAL_ERRORを返す", async () => {
    // Arrange
    setupSystemAdminSession();
    mockedSystemSettingFindMany.mockRejectedValue(new Error("DB error"));

    const { getSystemSettingsAction } = await import(
      "../server-actions/getSystemSettingsAction"
    );

    // Act
    const result = await getSystemSettingsAction();

    // Assert
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.value.code).toBe("INTERNAL_ERROR");
    }
  });
});
