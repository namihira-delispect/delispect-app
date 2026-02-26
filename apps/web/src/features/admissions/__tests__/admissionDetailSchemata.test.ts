import { describe, it, expect } from "vitest";
import { admissionDetailParamsSchema, optimisticLockSchema } from "../schemata";

describe("admissionDetailParamsSchema", () => {
  describe("正常系", () => {
    it("正の整数IDを受け付ける", () => {
      const result = admissionDetailParamsSchema.safeParse({ id: 1 });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe(1);
      }
    });

    it("文字列のIDを数値に変換する", () => {
      const result = admissionDetailParamsSchema.safeParse({ id: "42" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe(42);
      }
    });

    it("大きな数値のIDを受け付ける", () => {
      const result = admissionDetailParamsSchema.safeParse({ id: 999999 });
      expect(result.success).toBe(true);
    });
  });

  describe("バリデーションエラー", () => {
    it("0の場合にエラーを返す", () => {
      const result = admissionDetailParamsSchema.safeParse({ id: 0 });
      expect(result.success).toBe(false);
    });

    it("負の数値の場合にエラーを返す", () => {
      const result = admissionDetailParamsSchema.safeParse({ id: -1 });
      expect(result.success).toBe(false);
    });

    it("小数の場合にエラーを返す", () => {
      const result = admissionDetailParamsSchema.safeParse({ id: 1.5 });
      expect(result.success).toBe(false);
    });

    it("文字列が数値に変換できない場合にエラーを返す", () => {
      const result = admissionDetailParamsSchema.safeParse({ id: "abc" });
      expect(result.success).toBe(false);
    });

    it("idが未指定の場合にエラーを返す", () => {
      const result = admissionDetailParamsSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });
});

describe("optimisticLockSchema", () => {
  describe("正常系", () => {
    it("正のadmissionIdとversion 0を受け付ける", () => {
      const result = optimisticLockSchema.safeParse({
        admissionId: 1,
        expectedVersion: 0,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.admissionId).toBe(1);
        expect(result.data.expectedVersion).toBe(0);
      }
    });

    it("大きなバージョン番号を受け付ける", () => {
      const result = optimisticLockSchema.safeParse({
        admissionId: 100,
        expectedVersion: 999,
      });
      expect(result.success).toBe(true);
    });
  });

  describe("バリデーションエラー", () => {
    it("admissionIdが0の場合にエラーを返す", () => {
      const result = optimisticLockSchema.safeParse({
        admissionId: 0,
        expectedVersion: 0,
      });
      expect(result.success).toBe(false);
    });

    it("admissionIdが負の場合にエラーを返す", () => {
      const result = optimisticLockSchema.safeParse({
        admissionId: -1,
        expectedVersion: 0,
      });
      expect(result.success).toBe(false);
    });

    it("expectedVersionが負の場合にエラーを返す", () => {
      const result = optimisticLockSchema.safeParse({
        admissionId: 1,
        expectedVersion: -1,
      });
      expect(result.success).toBe(false);
    });

    it("admissionIdが未指定の場合にエラーを返す", () => {
      const result = optimisticLockSchema.safeParse({
        expectedVersion: 0,
      });
      expect(result.success).toBe(false);
    });

    it("expectedVersionが未指定の場合にエラーを返す", () => {
      const result = optimisticLockSchema.safeParse({
        admissionId: 1,
      });
      expect(result.success).toBe(false);
    });
  });
});
