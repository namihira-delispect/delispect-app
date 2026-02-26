import { describe, it, expect } from "vitest";
import {
  carePlanDetailParamsSchema,
  createTranscriptionSchema,
  transcriptionHistoryParamsSchema,
} from "../schemata";

describe("carePlanDetailParamsSchema", () => {
  it("正の整数の入院IDを受け付ける", () => {
    const result = carePlanDetailParamsSchema.safeParse({ admissionId: 1 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.admissionId).toBe(1);
    }
  });

  it("文字列の数値も受け付ける（coerce）", () => {
    const result = carePlanDetailParamsSchema.safeParse({ admissionId: "123" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.admissionId).toBe(123);
    }
  });

  it("0以下の値を拒否する", () => {
    const result = carePlanDetailParamsSchema.safeParse({ admissionId: 0 });
    expect(result.success).toBe(false);
  });

  it("負の値を拒否する", () => {
    const result = carePlanDetailParamsSchema.safeParse({ admissionId: -1 });
    expect(result.success).toBe(false);
  });

  it("小数を拒否する", () => {
    const result = carePlanDetailParamsSchema.safeParse({ admissionId: 1.5 });
    expect(result.success).toBe(false);
  });

  it("文字列を拒否する", () => {
    const result = carePlanDetailParamsSchema.safeParse({ admissionId: "abc" });
    expect(result.success).toBe(false);
  });
});

describe("createTranscriptionSchema", () => {
  it("正常なリクエストを受け付ける", () => {
    const result = createTranscriptionSchema.safeParse({
      carePlanId: 1,
      content: "テスト転記内容",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.carePlanId).toBe(1);
      expect(result.data.content).toBe("テスト転記内容");
    }
  });

  it("空のcontentを拒否する", () => {
    const result = createTranscriptionSchema.safeParse({
      carePlanId: 1,
      content: "",
    });
    expect(result.success).toBe(false);
  });

  it("10000文字を超えるcontentを拒否する", () => {
    const result = createTranscriptionSchema.safeParse({
      carePlanId: 1,
      content: "a".repeat(10001),
    });
    expect(result.success).toBe(false);
  });

  it("10000文字ちょうどのcontentを受け付ける", () => {
    const result = createTranscriptionSchema.safeParse({
      carePlanId: 1,
      content: "a".repeat(10000),
    });
    expect(result.success).toBe(true);
  });

  it("carePlanIdが0以下の場合を拒否する", () => {
    const result = createTranscriptionSchema.safeParse({
      carePlanId: 0,
      content: "テスト",
    });
    expect(result.success).toBe(false);
  });
});

describe("transcriptionHistoryParamsSchema", () => {
  it("正の整数のケアプランIDを受け付ける", () => {
    const result = transcriptionHistoryParamsSchema.safeParse({ carePlanId: 1 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.carePlanId).toBe(1);
    }
  });

  it("文字列の数値も受け付ける（coerce）", () => {
    const result = transcriptionHistoryParamsSchema.safeParse({ carePlanId: "42" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.carePlanId).toBe(42);
    }
  });

  it("0以下の値を拒否する", () => {
    const result = transcriptionHistoryParamsSchema.safeParse({ carePlanId: 0 });
    expect(result.success).toBe(false);
  });

  it("負の値を拒否する", () => {
    const result = transcriptionHistoryParamsSchema.safeParse({ carePlanId: -5 });
    expect(result.success).toBe(false);
  });
});
