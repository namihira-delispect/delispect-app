import { describe, it, expect } from "vitest";
import { anonymizeId, anonymizeUserId, anonymizePatientId } from "../anonymizer";

describe("anonymizer", () => {
  describe("anonymizeId", () => {
    it("同一の入力からは同一のハッシュを生成する", () => {
      const hash1 = anonymizeId("user", 1);
      const hash2 = anonymizeId("user", 1);
      expect(hash1).toBe(hash2);
    });

    it("64文字の16進数文字列を返す", () => {
      const hash = anonymizeId("user", 1);
      expect(hash).toMatch(/^[0-9a-f]{64}$/);
    });

    it("異なるIDからは異なるハッシュを生成する", () => {
      const hash1 = anonymizeId("user", 1);
      const hash2 = anonymizeId("user", 2);
      expect(hash1).not.toBe(hash2);
    });

    it("異なるエンティティ種別からは異なるハッシュを生成する", () => {
      const hash1 = anonymizeId("user", 1);
      const hash2 = anonymizeId("patient", 1);
      expect(hash1).not.toBe(hash2);
    });

    it("文字列IDにも対応する", () => {
      const hash = anonymizeId("user", "abc123");
      expect(hash).toMatch(/^[0-9a-f]{64}$/);
    });
  });

  describe("anonymizeUserId", () => {
    it("ユーザーIDを匿名化する", () => {
      const hash = anonymizeUserId(42);
      expect(hash).toMatch(/^[0-9a-f]{64}$/);
    });

    it("anonymizeIdのuser種別と同一の結果を返す", () => {
      const hash1 = anonymizeUserId(42);
      const hash2 = anonymizeId("user", 42);
      expect(hash1).toBe(hash2);
    });
  });

  describe("anonymizePatientId", () => {
    it("患者IDを匿名化する", () => {
      const hash = anonymizePatientId(100);
      expect(hash).toMatch(/^[0-9a-f]{64}$/);
    });

    it("anonymizeIdのpatient種別と同一の結果を返す", () => {
      const hash1 = anonymizePatientId(100);
      const hash2 = anonymizeId("patient", 100);
      expect(hash1).toBe(hash2);
    });

    it("ユーザーIDの匿名化とは異なる結果を返す", () => {
      const userHash = anonymizeUserId(1);
      const patientHash = anonymizePatientId(1);
      expect(userHash).not.toBe(patientHash);
    });
  });
});
