import { describe, it, expect } from "vitest";
import { updateReferenceValueSchema } from "../schemata";

describe("updateReferenceValueSchema", () => {
  describe("正常系", () => {
    it("有効な入力を受け付ける", () => {
      const result = updateReferenceValueSchema.safeParse({
        id: 1,
        lowerLimit: "3.5",
        upperLimit: "5.0",
      });
      expect(result.success).toBe(true);
    });

    it("下限値のみの指定を受け付ける", () => {
      const result = updateReferenceValueSchema.safeParse({
        id: 1,
        lowerLimit: "3.5",
        upperLimit: null,
      });
      expect(result.success).toBe(true);
    });

    it("上限値のみの指定を受け付ける", () => {
      const result = updateReferenceValueSchema.safeParse({
        id: 1,
        lowerLimit: null,
        upperLimit: "5.0",
      });
      expect(result.success).toBe(true);
    });

    it("両方nullの場合を受け付ける", () => {
      const result = updateReferenceValueSchema.safeParse({
        id: 1,
        lowerLimit: null,
        upperLimit: null,
      });
      expect(result.success).toBe(true);
    });

    it("空文字列をnullに変換する", () => {
      const result = updateReferenceValueSchema.safeParse({
        id: 1,
        lowerLimit: "",
        upperLimit: "",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.lowerLimit).toBeNull();
        expect(result.data.upperLimit).toBeNull();
      }
    });

    it("上限値と下限値が同じ場合を受け付ける", () => {
      const result = updateReferenceValueSchema.safeParse({
        id: 1,
        lowerLimit: "5.0",
        upperLimit: "5.0",
      });
      expect(result.success).toBe(true);
    });

    it("小数点3桁の値を受け付ける", () => {
      const result = updateReferenceValueSchema.safeParse({
        id: 1,
        lowerLimit: "0.001",
        upperLimit: "999.999",
      });
      expect(result.success).toBe(true);
    });

    it("0の値を受け付ける", () => {
      const result = updateReferenceValueSchema.safeParse({
        id: 1,
        lowerLimit: "0",
        upperLimit: "10",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("バリデーションエラー", () => {
    it("IDが0以下の場合にエラーを返す", () => {
      const result = updateReferenceValueSchema.safeParse({
        id: 0,
        lowerLimit: "3.5",
        upperLimit: "5.0",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.id).toBeDefined();
      }
    });

    it("IDが未指定の場合にエラーを返す", () => {
      const result = updateReferenceValueSchema.safeParse({
        lowerLimit: "3.5",
        upperLimit: "5.0",
      });
      expect(result.success).toBe(false);
    });

    it("下限値が数値でない場合にエラーを返す", () => {
      const result = updateReferenceValueSchema.safeParse({
        id: 1,
        lowerLimit: "abc",
        upperLimit: "5.0",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.lowerLimit).toContain(
          "下限値は数値で入力してください",
        );
      }
    });

    it("上限値が数値でない場合にエラーを返す", () => {
      const result = updateReferenceValueSchema.safeParse({
        id: 1,
        lowerLimit: "3.5",
        upperLimit: "xyz",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.upperLimit).toContain(
          "上限値は数値で入力してください",
        );
      }
    });

    it("下限値が負の数の場合にエラーを返す", () => {
      const result = updateReferenceValueSchema.safeParse({
        id: 1,
        lowerLimit: "-1",
        upperLimit: "5.0",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.lowerLimit).toContain(
          "下限値は0以上で入力してください",
        );
      }
    });

    it("上限値が負の数の場合にエラーを返す", () => {
      const result = updateReferenceValueSchema.safeParse({
        id: 1,
        lowerLimit: "0",
        upperLimit: "-5",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.upperLimit).toContain(
          "上限値は0以上で入力してください",
        );
      }
    });

    it("上限値が下限値より小さい場合にエラーを返す", () => {
      const result = updateReferenceValueSchema.safeParse({
        id: 1,
        lowerLimit: "10.0",
        upperLimit: "5.0",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.upperLimit).toContain(
          "上限値は下限値以上で入力してください",
        );
      }
    });
  });
});
