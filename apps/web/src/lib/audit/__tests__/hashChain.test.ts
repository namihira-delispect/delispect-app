import { describe, it, expect } from "vitest";
import { computeAuditLogHash, verifyAuditLogHash } from "../hashChain";
import type { AuditLogInput } from "../types";

describe("computeAuditLogHash", () => {
  const baseInput: AuditLogInput = {
    actorId: 1,
    action: "CREATE",
    targetType: "PATIENT",
    targetId: "123",
    beforeData: null,
    afterData: { name: "テスト患者" },
  };

  const fixedDate = new Date("2026-01-15T10:00:00.000Z");

  it("SHA-256ハッシュ値（64文字の16進文字列）を返す", () => {
    const hash = computeAuditLogHash(baseInput, fixedDate, null);

    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("同じ入力に対して同じハッシュ値を返す（決定論的）", () => {
    const hash1 = computeAuditLogHash(baseInput, fixedDate, null);
    const hash2 = computeAuditLogHash(baseInput, fixedDate, null);

    expect(hash1).toBe(hash2);
  });

  it("入力が異なる場合は異なるハッシュ値を返す", () => {
    const modifiedInput: AuditLogInput = {
      ...baseInput,
      action: "UPDATE",
    };

    const hash1 = computeAuditLogHash(baseInput, fixedDate, null);
    const hash2 = computeAuditLogHash(modifiedInput, fixedDate, null);

    expect(hash1).not.toBe(hash2);
  });

  it("prevHashが異なる場合は異なるハッシュ値を返す", () => {
    const hash1 = computeAuditLogHash(baseInput, fixedDate, null);
    const hash2 = computeAuditLogHash(baseInput, fixedDate, "abc123");

    expect(hash1).not.toBe(hash2);
  });

  it("日時が異なる場合は異なるハッシュ値を返す", () => {
    const anotherDate = new Date("2026-01-16T10:00:00.000Z");

    const hash1 = computeAuditLogHash(baseInput, fixedDate, null);
    const hash2 = computeAuditLogHash(baseInput, anotherDate, null);

    expect(hash1).not.toBe(hash2);
  });

  it("beforeData/afterDataがundefinedの場合はnullとして扱う", () => {
    const inputWithUndefined: AuditLogInput = {
      actorId: 1,
      action: "VIEW",
      targetType: "PATIENT",
      targetId: "123",
    };

    const inputWithNull: AuditLogInput = {
      actorId: 1,
      action: "VIEW",
      targetType: "PATIENT",
      targetId: "123",
      beforeData: null,
      afterData: null,
    };

    const hash1 = computeAuditLogHash(inputWithUndefined, fixedDate, null);
    const hash2 = computeAuditLogHash(inputWithNull, fixedDate, null);

    expect(hash1).toBe(hash2);
  });
});

describe("verifyAuditLogHash", () => {
  const fixedDate = new Date("2026-01-15T10:00:00.000Z");

  it("正しいレコードの検証はtrueを返す", () => {
    const input: AuditLogInput = {
      actorId: 1,
      action: "CREATE",
      targetType: "PATIENT",
      targetId: "123",
      beforeData: null,
      afterData: { name: "テスト患者" },
    };

    const hash = computeAuditLogHash(input, fixedDate, null);

    const record = {
      actorId: 1,
      action: "CREATE",
      targetType: "PATIENT",
      targetId: "123",
      beforeData: null,
      afterData: { name: "テスト患者" },
      occurredAt: fixedDate,
      hash,
    };

    expect(verifyAuditLogHash(record, null)).toBe(true);
  });

  it("改ざんされたレコードの検証はfalseを返す", () => {
    const input: AuditLogInput = {
      actorId: 1,
      action: "CREATE",
      targetType: "PATIENT",
      targetId: "123",
      beforeData: null,
      afterData: { name: "テスト患者" },
    };

    const hash = computeAuditLogHash(input, fixedDate, null);

    // actionを改ざん
    const tamperedRecord = {
      actorId: 1,
      action: "DELETE",
      targetType: "PATIENT",
      targetId: "123",
      beforeData: null,
      afterData: { name: "テスト患者" },
      occurredAt: fixedDate,
      hash,
    };

    expect(verifyAuditLogHash(tamperedRecord, null)).toBe(false);
  });

  it("prevHashが異なる場合はfalseを返す", () => {
    const input: AuditLogInput = {
      actorId: 1,
      action: "VIEW",
      targetType: "PATIENT",
      targetId: "123",
    };

    const hash = computeAuditLogHash(input, fixedDate, "original_prev_hash");

    const record = {
      actorId: 1,
      action: "VIEW",
      targetType: "PATIENT",
      targetId: "123",
      beforeData: null,
      afterData: null,
      occurredAt: fixedDate,
      hash,
    };

    // 異なるprevHashで検証
    expect(verifyAuditLogHash(record, "tampered_prev_hash")).toBe(false);
  });

  describe("ハッシュチェーンの整合性", () => {
    it("連続するレコードのチェーンを検証できる", () => {
      // レコード1（チェーンの先頭）
      const input1: AuditLogInput = {
        actorId: 1,
        action: "LOGIN",
        targetType: "SESSION",
        targetId: "session-1",
      };
      const date1 = new Date("2026-01-15T10:00:00.000Z");
      const hash1 = computeAuditLogHash(input1, date1, null);

      // レコード2（レコード1のハッシュを参照）
      const input2: AuditLogInput = {
        actorId: 1,
        action: "VIEW",
        targetType: "PATIENT",
        targetId: "patient-1",
      };
      const date2 = new Date("2026-01-15T10:01:00.000Z");
      const hash2 = computeAuditLogHash(input2, date2, hash1);

      // レコード3（レコード2のハッシュを参照）
      const input3: AuditLogInput = {
        actorId: 1,
        action: "LOGOUT",
        targetType: "SESSION",
        targetId: "session-1",
      };
      const date3 = new Date("2026-01-15T10:05:00.000Z");
      const hash3 = computeAuditLogHash(input3, date3, hash2);

      // チェーン検証
      const record1 = {
        actorId: 1,
        action: "LOGIN",
        targetType: "SESSION",
        targetId: "session-1",
        beforeData: null,
        afterData: null,
        occurredAt: date1,
        hash: hash1,
      };

      const record2 = {
        actorId: 1,
        action: "VIEW",
        targetType: "PATIENT",
        targetId: "patient-1",
        beforeData: null,
        afterData: null,
        occurredAt: date2,
        hash: hash2,
      };

      const record3 = {
        actorId: 1,
        action: "LOGOUT",
        targetType: "SESSION",
        targetId: "session-1",
        beforeData: null,
        afterData: null,
        occurredAt: date3,
        hash: hash3,
      };

      expect(verifyAuditLogHash(record1, null)).toBe(true);
      expect(verifyAuditLogHash(record2, hash1)).toBe(true);
      expect(verifyAuditLogHash(record3, hash2)).toBe(true);
    });
  });
});
