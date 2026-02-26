import { describe, it, expect } from "vitest";
import {
  carePlanParamsSchema,
  createCarePlanSchema,
  updateCarePlanItemStatusSchema,
} from "../schemata";

describe("carePlanParamsSchema", () => {
  describe("正常系", () => {
    it("正の整数admissionIdを受け付ける", () => {
      const result = carePlanParamsSchema.safeParse({ admissionId: 1 });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.admissionId).toBe(1);
      }
    });

    it("文字列のadmissionIdを数値に変換する", () => {
      const result = carePlanParamsSchema.safeParse({ admissionId: "42" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.admissionId).toBe(42);
      }
    });

    it("大きな数値のadmissionIdを受け付ける", () => {
      const result = carePlanParamsSchema.safeParse({ admissionId: 999999 });
      expect(result.success).toBe(true);
    });
  });

  describe("バリデーションエラー", () => {
    it("admissionIdが0の場合にエラーを返す", () => {
      const result = carePlanParamsSchema.safeParse({ admissionId: 0 });
      expect(result.success).toBe(false);
    });

    it("admissionIdが負の数値の場合にエラーを返す", () => {
      const result = carePlanParamsSchema.safeParse({ admissionId: -1 });
      expect(result.success).toBe(false);
    });

    it("admissionIdが小数の場合にエラーを返す", () => {
      const result = carePlanParamsSchema.safeParse({ admissionId: 1.5 });
      expect(result.success).toBe(false);
    });

    it("admissionIdが未指定の場合にエラーを返す", () => {
      const result = carePlanParamsSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });
});

describe("createCarePlanSchema", () => {
  describe("正常系", () => {
    it("正の整数admissionIdを受け付ける", () => {
      const result = createCarePlanSchema.safeParse({ admissionId: 5 });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.admissionId).toBe(5);
      }
    });

    it("文字列のadmissionIdを数値に変換する", () => {
      const result = createCarePlanSchema.safeParse({ admissionId: "10" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.admissionId).toBe(10);
      }
    });
  });

  describe("バリデーションエラー", () => {
    it("admissionIdが0の場合にエラーを返す", () => {
      const result = createCarePlanSchema.safeParse({ admissionId: 0 });
      expect(result.success).toBe(false);
    });

    it("admissionIdが負の場合にエラーを返す", () => {
      const result = createCarePlanSchema.safeParse({ admissionId: -1 });
      expect(result.success).toBe(false);
    });

    it("admissionIdが未指定の場合にエラーを返す", () => {
      const result = createCarePlanSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });
});

describe("updateCarePlanItemStatusSchema", () => {
  describe("正常系", () => {
    it("NOT_STARTEDステータスを受け付ける", () => {
      const result = updateCarePlanItemStatusSchema.safeParse({
        itemId: 1,
        status: "NOT_STARTED",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe("NOT_STARTED");
      }
    });

    it("IN_PROGRESSステータスを受け付ける", () => {
      const result = updateCarePlanItemStatusSchema.safeParse({
        itemId: 1,
        status: "IN_PROGRESS",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe("IN_PROGRESS");
      }
    });

    it("COMPLETEDステータスを受け付ける", () => {
      const result = updateCarePlanItemStatusSchema.safeParse({
        itemId: 1,
        status: "COMPLETED",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe("COMPLETED");
      }
    });

    it("NOT_APPLICABLEステータスを受け付ける", () => {
      const result = updateCarePlanItemStatusSchema.safeParse({
        itemId: 1,
        status: "NOT_APPLICABLE",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe("NOT_APPLICABLE");
      }
    });

    it("文字列のitemIdを数値に変換する", () => {
      const result = updateCarePlanItemStatusSchema.safeParse({
        itemId: "5",
        status: "COMPLETED",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.itemId).toBe(5);
      }
    });
  });

  describe("バリデーションエラー", () => {
    it("itemIdが0の場合にエラーを返す", () => {
      const result = updateCarePlanItemStatusSchema.safeParse({
        itemId: 0,
        status: "COMPLETED",
      });
      expect(result.success).toBe(false);
    });

    it("itemIdが負の場合にエラーを返す", () => {
      const result = updateCarePlanItemStatusSchema.safeParse({
        itemId: -1,
        status: "COMPLETED",
      });
      expect(result.success).toBe(false);
    });

    it("statusが無効な値の場合にエラーを返す", () => {
      const result = updateCarePlanItemStatusSchema.safeParse({
        itemId: 1,
        status: "INVALID",
      });
      expect(result.success).toBe(false);
    });

    it("statusが未指定の場合にエラーを返す", () => {
      const result = updateCarePlanItemStatusSchema.safeParse({
        itemId: 1,
      });
      expect(result.success).toBe(false);
    });

    it("itemIdが未指定の場合にエラーを返す", () => {
      const result = updateCarePlanItemStatusSchema.safeParse({
        status: "COMPLETED",
      });
      expect(result.success).toBe(false);
    });
  });
});
