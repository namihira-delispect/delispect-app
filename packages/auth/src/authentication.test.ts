import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  MAX_FAILED_ATTEMPTS,
  LOCK_DURATION_HOURS,
} from "./constants";

// Prisma をモック
vi.mock("@delispect/db", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    session: {
      create: vi.fn(),
      deleteMany: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

// bcryptjs をモック
vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("$2a$12$mockedhash"),
    compare: vi.fn(),
  },
}));

import { prisma } from "@delispect/db";
import bcrypt from "bcryptjs";
import { authenticate, checkAccountLock, incrementFailedAttempts, resetFailedAttempts, unlockAccount } from "./authentication";

const mockPrisma = vi.mocked(prisma);
const mockBcrypt = vi.mocked(bcrypt);

describe("checkAccountLock", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("ユーザーが存在しない場合はロックされていないと判定する", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);

    const result = await checkAccountLock(999);
    expect(result.isLocked).toBe(false);
  });

  it("ロック期限が将来の場合はロックされていると判定する", async () => {
    const futureDate = new Date();
    futureDate.setHours(futureDate.getHours() + 12);

    mockPrisma.user.findUnique.mockResolvedValue({
      lockedUntil: futureDate,
      failedLoginAttempts: MAX_FAILED_ATTEMPTS,
    } as never);

    const result = await checkAccountLock(1);
    expect(result.isLocked).toBe(true);
    expect(result.lockedUntil).toEqual(futureDate);
  });

  it("ロック期限が過ぎている場合は自動解除する", async () => {
    const pastDate = new Date();
    pastDate.setHours(pastDate.getHours() - 1);

    mockPrisma.user.findUnique.mockResolvedValue({
      lockedUntil: pastDate,
      failedLoginAttempts: MAX_FAILED_ATTEMPTS,
    } as never);
    mockPrisma.user.update.mockResolvedValue({} as never);

    const result = await checkAccountLock(1);
    expect(result.isLocked).toBe(false);
    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { lockedUntil: null, failedLoginAttempts: 0 },
    });
  });
});

describe("incrementFailedAttempts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("失敗回数を1増やす", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      failedLoginAttempts: 2,
    } as never);
    mockPrisma.user.update.mockResolvedValue({} as never);

    await incrementFailedAttempts(1);
    expect(mockPrisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 1 },
        data: expect.objectContaining({ failedLoginAttempts: 3 }),
      }),
    );
  });

  it("MAX_FAILED_ATTEMPTS に達するとアカウントをロックする", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      failedLoginAttempts: MAX_FAILED_ATTEMPTS - 1,
    } as never);
    mockPrisma.user.update.mockResolvedValue({} as never);

    await incrementFailedAttempts(1);
    expect(mockPrisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          failedLoginAttempts: MAX_FAILED_ATTEMPTS,
          lockedUntil: expect.any(Date),
        }),
      }),
    );
  });
});

describe("resetFailedAttempts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("失敗回数をリセットする", async () => {
    mockPrisma.user.update.mockResolvedValue({} as never);

    await resetFailedAttempts(1);
    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { failedLoginAttempts: 0, lockedUntil: null },
    });
  });
});

describe("unlockAccount", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("アカウントのロックを解除する", async () => {
    mockPrisma.user.update.mockResolvedValue({} as never);

    await unlockAccount(1);
    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { failedLoginAttempts: 0, lockedUntil: null },
    });
  });
});

describe("authenticate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("存在しないユーザーの場合はINVALID_CREDENTIALSを返す", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);

    const result = await authenticate({
      username: "nonexistent",
      password: "password",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.value.code).toBe("INVALID_CREDENTIALS");
    }
  });

  it("無効なアカウントの場合はACCOUNT_DISABLEDを返す", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 1,
      username: "user001",
      isActive: false,
      passwordHash: "hash",
      failedLoginAttempts: 0,
      lockedUntil: null,
    } as never);

    const result = await authenticate({
      username: "user001",
      password: "password",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.value.code).toBe("ACCOUNT_DISABLED");
    }
  });

  it("ロックされたアカウントの場合はACCOUNT_LOCKEDを返す", async () => {
    const futureDate = new Date();
    futureDate.setHours(futureDate.getHours() + LOCK_DURATION_HOURS);

    mockPrisma.user.findUnique.mockResolvedValue({
      id: 1,
      username: "user001",
      isActive: true,
      passwordHash: "hash",
      failedLoginAttempts: MAX_FAILED_ATTEMPTS,
      lockedUntil: futureDate,
    } as never);

    const result = await authenticate({
      username: "user001",
      password: "password",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.value.code).toBe("ACCOUNT_LOCKED");
    }
  });

  it("パスワードが間違っている場合はINVALID_CREDENTIALSを返す", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 1,
      username: "user001",
      isActive: true,
      passwordHash: "$2a$12$hash",
      failedLoginAttempts: 0,
      lockedUntil: null,
    } as never);
    mockBcrypt.compare.mockResolvedValue(false as never);
    mockPrisma.user.update.mockResolvedValue({} as never);

    const result = await authenticate({
      username: "user001",
      password: "wrongpassword",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.value.code).toBe("INVALID_CREDENTIALS");
    }
  });

  it("正しいパスワードの場合はセッション情報を返す", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 1,
      username: "user001",
      isActive: true,
      passwordHash: "$2a$12$hash",
      failedLoginAttempts: 0,
      lockedUntil: null,
    } as never);
    mockBcrypt.compare.mockResolvedValue(true as never);
    mockPrisma.user.update.mockResolvedValue({} as never);
    mockPrisma.session.deleteMany.mockResolvedValue({ count: 0 });
    mockPrisma.session.create.mockResolvedValue({
      id: "session-id",
      userId: 1,
      expiresAt: new Date(),
      ipAddress: null,
      createdAt: new Date(),
    });

    const result = await authenticate({
      username: "user001",
      password: "correctpassword",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.userId).toBe(1);
      expect(result.value.username).toBe("user001");
      expect(result.value.sessionId).toBeDefined();
    }
  });
});
