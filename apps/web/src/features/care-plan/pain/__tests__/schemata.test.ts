import { describe, it, expect } from "vitest";
import {
  painSiteDetailSchema,
  painCarePlanDetailsSchema,
  savePainCarePlanSchema,
  getPainCarePlanParamsSchema,
} from "../schemata";

describe("painSiteDetailSchema", () => {
  describe("正常系", () => {
    it("全フィールドが指定された場合に受け付ける", () => {
      const result = painSiteDetailSchema.safeParse({
        siteId: "HEAD",
        touchPain: true,
        movementPain: false,
        numbness: null,
      });
      expect(result.success).toBe(true);
    });

    it("全てnullの場合も受け付ける", () => {
      const result = painSiteDetailSchema.safeParse({
        siteId: "LOWER_BACK",
        touchPain: null,
        movementPain: null,
        numbness: null,
      });
      expect(result.success).toBe(true);
    });
  });

  describe("バリデーションエラー", () => {
    it("無効なsiteIdの場合にエラーを返す", () => {
      const result = painSiteDetailSchema.safeParse({
        siteId: "INVALID_SITE",
        touchPain: true,
        movementPain: false,
        numbness: null,
      });
      expect(result.success).toBe(false);
    });

    it("siteIdが未指定の場合にエラーを返す", () => {
      const result = painSiteDetailSchema.safeParse({
        touchPain: true,
        movementPain: false,
        numbness: null,
      });
      expect(result.success).toBe(false);
    });
  });
});

describe("painCarePlanDetailsSchema", () => {
  describe("正常系", () => {
    it("全フィールドが指定された場合に受け付ける", () => {
      const result = painCarePlanDetailsSchema.safeParse({
        hasDaytimePain: true,
        hasNighttimeAwakening: false,
        selectedSiteIds: ["HEAD", "NECK"],
        siteDetails: [{ siteId: "HEAD", touchPain: true, movementPain: false, numbness: null }],
        sleepImpact: true,
        mobilityImpact: false,
        toiletImpact: null,
      });
      expect(result.success).toBe(true);
    });

    it("空の配列でも受け付ける", () => {
      const result = painCarePlanDetailsSchema.safeParse({
        hasDaytimePain: null,
        hasNighttimeAwakening: null,
        selectedSiteIds: [],
        siteDetails: [],
        sleepImpact: null,
        mobilityImpact: null,
        toiletImpact: null,
      });
      expect(result.success).toBe(true);
    });

    it("複数部位の選択と詳細を受け付ける", () => {
      const result = painCarePlanDetailsSchema.safeParse({
        hasDaytimePain: true,
        hasNighttimeAwakening: true,
        selectedSiteIds: ["HEAD", "LOWER_BACK", "RIGHT_KNEE"],
        siteDetails: [
          { siteId: "HEAD", touchPain: true, movementPain: false, numbness: false },
          { siteId: "LOWER_BACK", touchPain: false, movementPain: true, numbness: true },
          { siteId: "RIGHT_KNEE", touchPain: null, movementPain: null, numbness: null },
        ],
        sleepImpact: true,
        mobilityImpact: true,
        toiletImpact: false,
      });
      expect(result.success).toBe(true);
    });
  });

  describe("バリデーションエラー", () => {
    it("selectedSiteIdsに無効なIDが含まれる場合にエラーを返す", () => {
      const result = painCarePlanDetailsSchema.safeParse({
        hasDaytimePain: null,
        hasNighttimeAwakening: null,
        selectedSiteIds: ["INVALID_ID"],
        siteDetails: [],
        sleepImpact: null,
        mobilityImpact: null,
        toiletImpact: null,
      });
      expect(result.success).toBe(false);
    });

    it("必須フィールドが欠けている場合にエラーを返す", () => {
      const result = painCarePlanDetailsSchema.safeParse({
        hasDaytimePain: null,
      });
      expect(result.success).toBe(false);
    });
  });
});

describe("savePainCarePlanSchema", () => {
  const validDetails = {
    hasDaytimePain: true,
    hasNighttimeAwakening: false,
    selectedSiteIds: [],
    siteDetails: [],
    sleepImpact: null,
    mobilityImpact: null,
    toiletImpact: null,
  };

  describe("正常系", () => {
    it("必須フィールドが全て指定された場合に受け付ける", () => {
      const result = savePainCarePlanSchema.safeParse({
        admissionId: 1,
        details: validDetails,
      });
      expect(result.success).toBe(true);
    });

    it("文字列のadmissionIdを数値に変換する", () => {
      const result = savePainCarePlanSchema.safeParse({
        admissionId: "42",
        details: validDetails,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.admissionId).toBe(42);
      }
    });

    it("currentQuestionIdが指定された場合に受け付ける", () => {
      const result = savePainCarePlanSchema.safeParse({
        admissionId: 1,
        currentQuestionId: "DAYTIME_PAIN",
        details: validDetails,
      });
      expect(result.success).toBe(true);
    });

    it("isCompletedが指定された場合に受け付ける", () => {
      const result = savePainCarePlanSchema.safeParse({
        admissionId: 1,
        details: validDetails,
        isCompleted: true,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isCompleted).toBe(true);
      }
    });

    it("isCompletedのデフォルト値はfalseである", () => {
      const result = savePainCarePlanSchema.safeParse({
        admissionId: 1,
        details: validDetails,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isCompleted).toBe(false);
      }
    });
  });

  describe("バリデーションエラー", () => {
    it("admissionIdが0の場合にエラーを返す", () => {
      const result = savePainCarePlanSchema.safeParse({
        admissionId: 0,
        details: validDetails,
      });
      expect(result.success).toBe(false);
    });

    it("admissionIdが負の場合にエラーを返す", () => {
      const result = savePainCarePlanSchema.safeParse({
        admissionId: -1,
        details: validDetails,
      });
      expect(result.success).toBe(false);
    });

    it("detailsが未指定の場合にエラーを返す", () => {
      const result = savePainCarePlanSchema.safeParse({
        admissionId: 1,
      });
      expect(result.success).toBe(false);
    });

    it("admissionIdが未指定の場合にエラーを返す", () => {
      const result = savePainCarePlanSchema.safeParse({
        details: validDetails,
      });
      expect(result.success).toBe(false);
    });
  });
});

describe("getPainCarePlanParamsSchema", () => {
  describe("正常系", () => {
    it("正の整数admissionIdを受け付ける", () => {
      const result = getPainCarePlanParamsSchema.safeParse({ admissionId: 1 });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.admissionId).toBe(1);
      }
    });

    it("文字列のadmissionIdを数値に変換する", () => {
      const result = getPainCarePlanParamsSchema.safeParse({ admissionId: "42" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.admissionId).toBe(42);
      }
    });
  });

  describe("バリデーションエラー", () => {
    it("admissionIdが0の場合にエラーを返す", () => {
      const result = getPainCarePlanParamsSchema.safeParse({ admissionId: 0 });
      expect(result.success).toBe(false);
    });

    it("admissionIdが負の場合にエラーを返す", () => {
      const result = getPainCarePlanParamsSchema.safeParse({ admissionId: -1 });
      expect(result.success).toBe(false);
    });

    it("admissionIdが未指定の場合にエラーを返す", () => {
      const result = getPainCarePlanParamsSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });
});
