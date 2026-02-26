import { describe, it, expect } from "vitest";
import {
  dataMappingSchema,
  dataMappingSearchSchema,
} from "../schemata";

describe("dataMappingSchema", () => {
  const validInput = {
    mappingType: "LAB_ITEM" as const,
    sourceCode: "LAB001",
    targetCode: "WBC",
    priority: 0,
  };

  describe("正常系", () => {
    it("有効な入力を受け付ける", () => {
      const result = dataMappingSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("全てのマッピング種別を受け付ける", () => {
      const types = ["LAB_ITEM", "PRESCRIPTION_TYPE", "VITAL_SIGN", "WARD", "ROOM"] as const;
      for (const mappingType of types) {
        const result = dataMappingSchema.safeParse({ ...validInput, mappingType });
        expect(result.success).toBe(true);
      }
    });

    it("優先順位が0の場合に受け付ける", () => {
      const result = dataMappingSchema.safeParse({ ...validInput, priority: 0 });
      expect(result.success).toBe(true);
    });

    it("優先順位が999の場合に受け付ける", () => {
      const result = dataMappingSchema.safeParse({ ...validInput, priority: 999 });
      expect(result.success).toBe(true);
    });

    it("病院側コードが50文字の場合に受け付ける", () => {
      const result = dataMappingSchema.safeParse({
        ...validInput,
        sourceCode: "A".repeat(50),
      });
      expect(result.success).toBe(true);
    });

    it("システム項目コードが50文字の場合に受け付ける", () => {
      const result = dataMappingSchema.safeParse({
        ...validInput,
        targetCode: "A".repeat(50),
      });
      expect(result.success).toBe(true);
    });
  });

  describe("バリデーションエラー", () => {
    it("マッピング種別が不正な値の場合にエラーを返す", () => {
      const result = dataMappingSchema.safeParse({
        ...validInput,
        mappingType: "INVALID_TYPE",
      });
      expect(result.success).toBe(false);
    });

    it("病院側コードが空の場合にエラーを返す", () => {
      const result = dataMappingSchema.safeParse({
        ...validInput,
        sourceCode: "",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.sourceCode).toContain(
          "病院側コードを入力してください",
        );
      }
    });

    it("病院側コードが51文字以上の場合にエラーを返す", () => {
      const result = dataMappingSchema.safeParse({
        ...validInput,
        sourceCode: "A".repeat(51),
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.sourceCode).toContain(
          "病院側コードは50文字以内で入力してください",
        );
      }
    });

    it("システム項目コードが空の場合にエラーを返す", () => {
      const result = dataMappingSchema.safeParse({
        ...validInput,
        targetCode: "",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.targetCode).toContain(
          "システム項目コードを入力してください",
        );
      }
    });

    it("システム項目コードが51文字以上の場合にエラーを返す", () => {
      const result = dataMappingSchema.safeParse({
        ...validInput,
        targetCode: "A".repeat(51),
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.targetCode).toContain(
          "システム項目コードは50文字以内で入力してください",
        );
      }
    });

    it("優先順位が負数の場合にエラーを返す", () => {
      const result = dataMappingSchema.safeParse({
        ...validInput,
        priority: -1,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.priority).toContain(
          "優先順位は0以上で入力してください",
        );
      }
    });

    it("優先順位が1000以上の場合にエラーを返す", () => {
      const result = dataMappingSchema.safeParse({
        ...validInput,
        priority: 1000,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.priority).toContain(
          "優先順位は999以下で入力してください",
        );
      }
    });

    it("優先順位が小数の場合にエラーを返す", () => {
      const result = dataMappingSchema.safeParse({
        ...validInput,
        priority: 1.5,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.priority).toContain(
          "優先順位は整数で入力してください",
        );
      }
    });

    it("マッピング種別が未指定の場合にエラーを返す", () => {
      const { mappingType: _, ...withoutType } = validInput;
      const result = dataMappingSchema.safeParse(withoutType);
      expect(result.success).toBe(false);
    });
  });
});

describe("dataMappingSearchSchema", () => {
  describe("正常系", () => {
    it("空のオブジェクトを受け付ける", () => {
      const result = dataMappingSearchSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.mappingType).toBeUndefined();
      }
    });

    it("マッピング種別を指定できる", () => {
      const result = dataMappingSearchSchema.safeParse({
        mappingType: "LAB_ITEM",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.mappingType).toBe("LAB_ITEM");
      }
    });

    it("全てのマッピング種別で検索できる", () => {
      const types = ["LAB_ITEM", "PRESCRIPTION_TYPE", "VITAL_SIGN", "WARD", "ROOM"] as const;
      for (const mappingType of types) {
        const result = dataMappingSearchSchema.safeParse({ mappingType });
        expect(result.success).toBe(true);
      }
    });
  });

  describe("バリデーションエラー", () => {
    it("不正なマッピング種別の場合にエラーを返す", () => {
      const result = dataMappingSearchSchema.safeParse({
        mappingType: "INVALID",
      });
      expect(result.success).toBe(false);
    });
  });
});
