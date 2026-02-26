import { describe, it, expect } from "vitest";
import {
  othersCategorySchema,
  checklistSaveDataSchema,
  saveOthersCarePlanSchema,
  getOthersCarePlanParamsSchema,
  getOthersByCategoryParamsSchema,
} from "../schemata";

describe("othersCategorySchema", () => {
  describe("正常系", () => {
    it("MOBILITYを受け付ける", () => {
      const result = othersCategorySchema.safeParse("MOBILITY");
      expect(result.success).toBe(true);
    });

    it("DEMENTIAを受け付ける", () => {
      const result = othersCategorySchema.safeParse("DEMENTIA");
      expect(result.success).toBe(true);
    });

    it("SAFETYを受け付ける", () => {
      const result = othersCategorySchema.safeParse("SAFETY");
      expect(result.success).toBe(true);
    });

    it("SLEEPを受け付ける", () => {
      const result = othersCategorySchema.safeParse("SLEEP");
      expect(result.success).toBe(true);
    });
  });

  describe("バリデーションエラー", () => {
    it("MEDICATIONは受け付けない", () => {
      const result = othersCategorySchema.safeParse("MEDICATION");
      expect(result.success).toBe(false);
    });

    it("PAINは受け付けない", () => {
      const result = othersCategorySchema.safeParse("PAIN");
      expect(result.success).toBe(false);
    });

    it("空文字列はエラーを返す", () => {
      const result = othersCategorySchema.safeParse("");
      expect(result.success).toBe(false);
    });

    it("無効な文字列はエラーを返す", () => {
      const result = othersCategorySchema.safeParse("INVALID");
      expect(result.success).toBe(false);
    });
  });
});

describe("checklistSaveDataSchema", () => {
  describe("正常系", () => {
    it("空の選択肢リストを受け付ける", () => {
      const result = checklistSaveDataSchema.safeParse({
        selectedOptionIds: [],
      });
      expect(result.success).toBe(true);
    });

    it("選択肢IDリストを受け付ける", () => {
      const result = checklistSaveDataSchema.safeParse({
        selectedOptionIds: ["mobility_01", "mobility_03"],
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.selectedOptionIds).toEqual(["mobility_01", "mobility_03"]);
      }
    });

    it("メモ付きのデータを受け付ける", () => {
      const result = checklistSaveDataSchema.safeParse({
        selectedOptionIds: ["safety_01"],
        notes: "追加メモ",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.notes).toBe("追加メモ");
      }
    });

    it("メモが省略された場合も受け付ける", () => {
      const result = checklistSaveDataSchema.safeParse({
        selectedOptionIds: ["dementia_01"],
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.notes).toBeUndefined();
      }
    });
  });

  describe("バリデーションエラー", () => {
    it("selectedOptionIdsが未指定の場合にエラーを返す", () => {
      const result = checklistSaveDataSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it("selectedOptionIdsに空文字列が含まれる場合にエラーを返す", () => {
      const result = checklistSaveDataSchema.safeParse({
        selectedOptionIds: ["mobility_01", ""],
      });
      expect(result.success).toBe(false);
    });

    it("メモが1000文字を超える場合にエラーを返す", () => {
      const result = checklistSaveDataSchema.safeParse({
        selectedOptionIds: [],
        notes: "a".repeat(1001),
      });
      expect(result.success).toBe(false);
    });

    it("メモがちょうど1000文字の場合は受け付ける", () => {
      const result = checklistSaveDataSchema.safeParse({
        selectedOptionIds: [],
        notes: "a".repeat(1000),
      });
      expect(result.success).toBe(true);
    });
  });
});

describe("saveOthersCarePlanSchema", () => {
  describe("正常系", () => {
    it("正の整数itemIdとチェックリストデータを受け付ける", () => {
      const result = saveOthersCarePlanSchema.safeParse({
        itemId: 1,
        checklist: {
          selectedOptionIds: ["mobility_01"],
        },
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.itemId).toBe(1);
        expect(result.data.checklist.selectedOptionIds).toEqual(["mobility_01"]);
      }
    });

    it("文字列のitemIdを数値に変換する", () => {
      const result = saveOthersCarePlanSchema.safeParse({
        itemId: "42",
        checklist: {
          selectedOptionIds: [],
        },
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.itemId).toBe(42);
      }
    });
  });

  describe("バリデーションエラー", () => {
    it("itemIdが0の場合にエラーを返す", () => {
      const result = saveOthersCarePlanSchema.safeParse({
        itemId: 0,
        checklist: { selectedOptionIds: [] },
      });
      expect(result.success).toBe(false);
    });

    it("itemIdが負の数値の場合にエラーを返す", () => {
      const result = saveOthersCarePlanSchema.safeParse({
        itemId: -1,
        checklist: { selectedOptionIds: [] },
      });
      expect(result.success).toBe(false);
    });

    it("checklistが未指定の場合にエラーを返す", () => {
      const result = saveOthersCarePlanSchema.safeParse({
        itemId: 1,
      });
      expect(result.success).toBe(false);
    });

    it("itemIdが未指定の場合にエラーを返す", () => {
      const result = saveOthersCarePlanSchema.safeParse({
        checklist: { selectedOptionIds: [] },
      });
      expect(result.success).toBe(false);
    });
  });
});

describe("getOthersCarePlanParamsSchema", () => {
  describe("正常系", () => {
    it("正の整数itemIdを受け付ける", () => {
      const result = getOthersCarePlanParamsSchema.safeParse({ itemId: 1 });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.itemId).toBe(1);
      }
    });

    it("文字列のitemIdを数値に変換する", () => {
      const result = getOthersCarePlanParamsSchema.safeParse({ itemId: "99" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.itemId).toBe(99);
      }
    });
  });

  describe("バリデーションエラー", () => {
    it("itemIdが0の場合にエラーを返す", () => {
      const result = getOthersCarePlanParamsSchema.safeParse({ itemId: 0 });
      expect(result.success).toBe(false);
    });

    it("itemIdが負の場合にエラーを返す", () => {
      const result = getOthersCarePlanParamsSchema.safeParse({ itemId: -5 });
      expect(result.success).toBe(false);
    });

    it("itemIdが未指定の場合にエラーを返す", () => {
      const result = getOthersCarePlanParamsSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });
});

describe("getOthersByCategoryParamsSchema", () => {
  describe("正常系", () => {
    it("admissionIdとcategoryを受け付ける", () => {
      const result = getOthersByCategoryParamsSchema.safeParse({
        admissionId: 1,
        category: "MOBILITY",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.admissionId).toBe(1);
        expect(result.data.category).toBe("MOBILITY");
      }
    });

    it("文字列のadmissionIdを数値に変換する", () => {
      const result = getOthersByCategoryParamsSchema.safeParse({
        admissionId: "10",
        category: "SLEEP",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.admissionId).toBe(10);
      }
    });
  });

  describe("バリデーションエラー", () => {
    it("admissionIdが0の場合にエラーを返す", () => {
      const result = getOthersByCategoryParamsSchema.safeParse({
        admissionId: 0,
        category: "MOBILITY",
      });
      expect(result.success).toBe(false);
    });

    it("categoryが無効な場合にエラーを返す", () => {
      const result = getOthersByCategoryParamsSchema.safeParse({
        admissionId: 1,
        category: "MEDICATION",
      });
      expect(result.success).toBe(false);
    });

    it("admissionIdが未指定の場合にエラーを返す", () => {
      const result = getOthersByCategoryParamsSchema.safeParse({
        category: "SAFETY",
      });
      expect(result.success).toBe(false);
    });

    it("categoryが未指定の場合にエラーを返す", () => {
      const result = getOthersByCategoryParamsSchema.safeParse({
        admissionId: 1,
      });
      expect(result.success).toBe(false);
    });
  });
});
