import { describe, it, expect } from "vitest";
import {
  medicineMasterSchema,
  medicineMasterSearchSchema,
  csvRowSchema,
  CSV_EXPECTED_HEADERS,
} from "../schemata";

describe("medicineMasterSchema", () => {
  const validInput = {
    medicinesCode: "YJ12345",
    categoryId: 1,
    riskFactorFlg: true,
    displayName: "アセタゾラミド錠",
    hospitalCode: "H001",
  };

  describe("正常系", () => {
    it("有効な入力を受け付ける", () => {
      const result = medicineMasterSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("リスク要因フラグがfalseの場合も受け付ける", () => {
      const result = medicineMasterSchema.safeParse({
        ...validInput,
        riskFactorFlg: false,
      });
      expect(result.success).toBe(true);
    });

    it("薬剤コードにハイフンを含む場合も受け付ける", () => {
      const result = medicineMasterSchema.safeParse({
        ...validInput,
        medicinesCode: "YJ-123-45",
      });
      expect(result.success).toBe(true);
    });

    it("薬剤コードが20文字の場合に受け付ける", () => {
      const result = medicineMasterSchema.safeParse({
        ...validInput,
        medicinesCode: "A".repeat(20),
      });
      expect(result.success).toBe(true);
    });

    it("表示名が200文字の場合に受け付ける", () => {
      const result = medicineMasterSchema.safeParse({
        ...validInput,
        displayName: "あ".repeat(200),
      });
      expect(result.success).toBe(true);
    });
  });

  describe("バリデーションエラー", () => {
    it("薬剤コードが空の場合にエラーを返す", () => {
      const result = medicineMasterSchema.safeParse({
        ...validInput,
        medicinesCode: "",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.medicinesCode).toContain(
          "薬剤コードを入力してください",
        );
      }
    });

    it("薬剤コードが21文字以上の場合にエラーを返す", () => {
      const result = medicineMasterSchema.safeParse({
        ...validInput,
        medicinesCode: "A".repeat(21),
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.medicinesCode).toContain(
          "薬剤コードは20文字以内で入力してください",
        );
      }
    });

    it("薬剤コードに不正な文字が含まれる場合にエラーを返す", () => {
      const result = medicineMasterSchema.safeParse({
        ...validInput,
        medicinesCode: "YJ 123",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.medicinesCode).toContain(
          "薬剤コードは半角英数字とハイフンのみ使用できます",
        );
      }
    });

    it("カテゴリIDが0以下の場合にエラーを返す", () => {
      const result = medicineMasterSchema.safeParse({
        ...validInput,
        categoryId: 0,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.categoryId).toBeDefined();
      }
    });

    it("カテゴリIDが小数の場合にエラーを返す", () => {
      const result = medicineMasterSchema.safeParse({
        ...validInput,
        categoryId: 1.5,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.categoryId).toContain(
          "カテゴリIDは整数で入力してください",
        );
      }
    });

    it("表示名が空の場合にエラーを返す", () => {
      const result = medicineMasterSchema.safeParse({
        ...validInput,
        displayName: "",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.displayName).toContain(
          "表示名を入力してください",
        );
      }
    });

    it("表示名が201文字以上の場合にエラーを返す", () => {
      const result = medicineMasterSchema.safeParse({
        ...validInput,
        displayName: "あ".repeat(201),
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.displayName).toContain(
          "表示名は200文字以内で入力してください",
        );
      }
    });

    it("病院コードが空の場合にエラーを返す", () => {
      const result = medicineMasterSchema.safeParse({
        ...validInput,
        hospitalCode: "",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.hospitalCode).toContain(
          "病院コードを入力してください",
        );
      }
    });

    it("病院コードが21文字以上の場合にエラーを返す", () => {
      const result = medicineMasterSchema.safeParse({
        ...validInput,
        hospitalCode: "A".repeat(21),
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.hospitalCode).toContain(
          "病院コードは20文字以内で入力してください",
        );
      }
    });
  });
});

describe("medicineMasterSearchSchema", () => {
  describe("正常系", () => {
    it("空のオブジェクトでデフォルト値が設定される", () => {
      const result = medicineMasterSearchSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.query).toBe("");
        expect(result.data.page).toBe(1);
        expect(result.data.pageSize).toBe(20);
      }
    });

    it("検索クエリとページ指定を受け付ける", () => {
      const result = medicineMasterSearchSchema.safeParse({
        query: "テスト",
        page: 2,
        pageSize: 50,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.query).toBe("テスト");
        expect(result.data.page).toBe(2);
        expect(result.data.pageSize).toBe(50);
      }
    });

    it("文字列のページ番号を数値に変換する", () => {
      const result = medicineMasterSearchSchema.safeParse({
        page: "3",
        pageSize: "10",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(3);
        expect(result.data.pageSize).toBe(10);
      }
    });
  });

  describe("バリデーションエラー", () => {
    it("ページ番号が0以下の場合にエラーを返す", () => {
      const result = medicineMasterSearchSchema.safeParse({ page: 0 });
      expect(result.success).toBe(false);
    });

    it("ページサイズが101以上の場合にエラーを返す", () => {
      const result = medicineMasterSearchSchema.safeParse({ pageSize: 101 });
      expect(result.success).toBe(false);
    });
  });
});

describe("csvRowSchema", () => {
  const validRow = {
    medicines_code: "YJ12345",
    category_id: "1",
    risk_factor_flg: "1",
    display_name: "アセタゾラミド錠",
    hospital_code: "H001",
  };

  describe("正常系", () => {
    it("有効な行データを受け付ける", () => {
      const result = csvRowSchema.safeParse(validRow);
      expect(result.success).toBe(true);
    });

    it("リスク要因フラグが0の場合も受け付ける", () => {
      const result = csvRowSchema.safeParse({ ...validRow, risk_factor_flg: "0" });
      expect(result.success).toBe(true);
    });

    it("リスク要因フラグがtrueの場合も受け付ける", () => {
      const result = csvRowSchema.safeParse({ ...validRow, risk_factor_flg: "true" });
      expect(result.success).toBe(true);
    });

    it("リスク要因フラグがfalseの場合も受け付ける", () => {
      const result = csvRowSchema.safeParse({ ...validRow, risk_factor_flg: "false" });
      expect(result.success).toBe(true);
    });
  });

  describe("バリデーションエラー", () => {
    it("薬剤コードが空の場合にエラーを返す", () => {
      const result = csvRowSchema.safeParse({ ...validRow, medicines_code: "" });
      expect(result.success).toBe(false);
    });

    it("カテゴリIDが空の場合にエラーを返す", () => {
      const result = csvRowSchema.safeParse({ ...validRow, category_id: "" });
      expect(result.success).toBe(false);
    });

    it("カテゴリIDが数値でない場合にエラーを返す", () => {
      const result = csvRowSchema.safeParse({ ...validRow, category_id: "abc" });
      expect(result.success).toBe(false);
    });

    it("カテゴリIDが0の場合にエラーを返す", () => {
      const result = csvRowSchema.safeParse({ ...validRow, category_id: "0" });
      expect(result.success).toBe(false);
    });

    it("リスク要因フラグが不正な値の場合にエラーを返す", () => {
      const result = csvRowSchema.safeParse({ ...validRow, risk_factor_flg: "yes" });
      expect(result.success).toBe(false);
    });

    it("表示名が空の場合にエラーを返す", () => {
      const result = csvRowSchema.safeParse({ ...validRow, display_name: "" });
      expect(result.success).toBe(false);
    });

    it("表示名が201文字以上の場合にエラーを返す", () => {
      const result = csvRowSchema.safeParse({
        ...validRow,
        display_name: "あ".repeat(201),
      });
      expect(result.success).toBe(false);
    });

    it("病院コードが空の場合にエラーを返す", () => {
      const result = csvRowSchema.safeParse({ ...validRow, hospital_code: "" });
      expect(result.success).toBe(false);
    });
  });
});

describe("CSV_EXPECTED_HEADERS", () => {
  it("必要なヘッダーがすべて定義されている", () => {
    expect(CSV_EXPECTED_HEADERS).toContain("medicines_code");
    expect(CSV_EXPECTED_HEADERS).toContain("category_id");
    expect(CSV_EXPECTED_HEADERS).toContain("risk_factor_flg");
    expect(CSV_EXPECTED_HEADERS).toContain("display_name");
    expect(CSV_EXPECTED_HEADERS).toContain("hospital_code");
    expect(CSV_EXPECTED_HEADERS).toHaveLength(5);
  });
});
