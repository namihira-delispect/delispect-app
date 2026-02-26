import { describe, it, expect, vi, beforeEach } from "vitest";

// モジュールモック
vi.mock("@delispect/db", () => ({
  prisma: {
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

describe("authorizeServerAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("認証済みユーザーの情報を返す", async () => {
    // Arrange
    mockedValidateSession.mockResolvedValue({
      sessionId: "test-session-id",
      userId: 1,
      username: "testuser",
      expiresAt: new Date(Date.now() + 3600000),
    });
    mockedUserFindUnique.mockResolvedValue({
      id: 1,
      username: "testuser",
      email: "test@example.com",
    } as never);
    mockedUserRoleFindMany.mockResolvedValue([
      { userId: 1, roleId: 1, createdAt: new Date(), role: { name: "GENERAL" } },
    ] as never);

    // 動的インポート（モック設定後）
    const { authorizeServerAction } = await import("../authorization");

    // Act
    const result = await authorizeServerAction();

    // Assert
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.id).toBe(1);
      expect(result.value.username).toBe("testuser");
      expect(result.value.roles).toContain("GENERAL");
    }
  });

  it("未認証の場合UNAUTHORIZEDエラーを返す", async () => {
    // Arrange
    mockedValidateSession.mockResolvedValue(null);

    const { authorizeServerAction } = await import("../authorization");

    // Act
    const result = await authorizeServerAction();

    // Assert
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.value.code).toBe("UNAUTHORIZED");
    }
  });

  it("必要なロールを持つ場合は成功する", async () => {
    // Arrange
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
        roleId: 3,
        createdAt: new Date(),
        role: { name: "SUPER_ADMIN" },
      },
    ] as never);

    const { authorizeServerAction } = await import("../authorization");

    // Act
    const result = await authorizeServerAction(["SUPER_ADMIN"]);

    // Assert
    expect(result.success).toBe(true);
  });

  it("必要なロールを持たない場合FORBIDDENエラーを返す", async () => {
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

    const { authorizeServerAction } = await import("../authorization");

    // Act
    const result = await authorizeServerAction(["SUPER_ADMIN"]);

    // Assert
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.value.code).toBe("FORBIDDEN");
    }
  });

  it("ロール指定なしの場合は認証のみチェックする", async () => {
    // Arrange
    mockedValidateSession.mockResolvedValue({
      sessionId: "test-session-id",
      userId: 1,
      username: "testuser",
      expiresAt: new Date(Date.now() + 3600000),
    });
    mockedUserFindUnique.mockResolvedValue({
      id: 1,
      username: "testuser",
      email: "test@example.com",
    } as never);
    mockedUserRoleFindMany.mockResolvedValue([
      { userId: 1, roleId: 1, createdAt: new Date(), role: { name: "GENERAL" } },
    ] as never);

    const { authorizeServerAction } = await import("../authorization");

    // Act
    const result = await authorizeServerAction();

    // Assert
    expect(result.success).toBe(true);
  });
});

describe("authorizeServerActionByPermission", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("必要な権限を持つ場合は成功する", async () => {
    // Arrange
    mockedValidateSession.mockResolvedValue({
      sessionId: "test-session-id",
      userId: 1,
      username: "nurse",
      expiresAt: new Date(Date.now() + 3600000),
    });
    mockedUserFindUnique.mockResolvedValue({
      id: 1,
      username: "nurse",
      email: "nurse@example.com",
    } as never);
    mockedUserRoleFindMany.mockResolvedValue([
      { userId: 1, roleId: 1, createdAt: new Date(), role: { name: "GENERAL" } },
    ] as never);

    const { authorizeServerActionByPermission } = await import(
      "../authorization"
    );
    const { PERMISSION_CODES } = await import("../permissions");

    // Act
    const result = await authorizeServerActionByPermission([
      PERMISSION_CODES.PATIENT_VIEW,
    ]);

    // Assert
    expect(result.success).toBe(true);
  });

  it("必要な権限を持たない場合FORBIDDENエラーを返す", async () => {
    // Arrange
    mockedValidateSession.mockResolvedValue({
      sessionId: "test-session-id",
      userId: 1,
      username: "nurse",
      expiresAt: new Date(Date.now() + 3600000),
    });
    mockedUserFindUnique.mockResolvedValue({
      id: 1,
      username: "nurse",
      email: "nurse@example.com",
    } as never);
    mockedUserRoleFindMany.mockResolvedValue([
      { userId: 1, roleId: 1, createdAt: new Date(), role: { name: "GENERAL" } },
    ] as never);

    const { authorizeServerActionByPermission } = await import(
      "../authorization"
    );
    const { PERMISSION_CODES } = await import("../permissions");

    // Act
    const result = await authorizeServerActionByPermission([
      PERMISSION_CODES.MASTER_DATA_EDIT,
    ]);

    // Assert
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.value.code).toBe("FORBIDDEN");
    }
  });
});
