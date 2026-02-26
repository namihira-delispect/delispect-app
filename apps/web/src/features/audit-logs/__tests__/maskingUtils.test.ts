import { describe, it, expect } from "vitest";
import {
  maskUsername,
  maskPatientName,
  extractAndMaskPatientName,
  maskDataFields,
} from "../maskingUtils";

describe("maskUsername", () => {
  describe("正常系", () => {
    it("通常のユーザー名をマスキングする", () => {
      const result = maskUsername("yamada_taro");
      expect(result).toBe("y*********o");
    });

    it("3文字のユーザー名をマスキングする", () => {
      const result = maskUsername("abc");
      expect(result).toBe("a*c");
    });

    it("先頭と末尾の文字を保持する", () => {
      const result = maskUsername("admin");
      expect(result).toBe("a***n");
    });
  });

  describe("境界値", () => {
    it("2文字のユーザー名は先頭1文字と伏字を返す", () => {
      const result = maskUsername("ab");
      expect(result).toBe("a*");
    });

    it("1文字のユーザー名はそのまま返す", () => {
      const result = maskUsername("a");
      expect(result).toBe("a");
    });

    it("空文字列の場合は伏字を返す", () => {
      const result = maskUsername("");
      expect(result).toBe("***");
    });
  });
});

describe("maskPatientName", () => {
  describe("正常系", () => {
    it("姓と名をマスキングする", () => {
      const result = maskPatientName("山田", "太郎");
      expect(result).toBe("山○太○");
    });

    it("長い姓名をマスキングする", () => {
      const result = maskPatientName("佐々木", "次郎三郎");
      expect(result).toBe("佐○○次○○○");
    });
  });

  describe("境界値", () => {
    it("姓のみの場合は姓をマスキングする", () => {
      const result = maskPatientName("山田", null);
      expect(result).toBe("山○");
    });

    it("名のみの場合は名をマスキングする", () => {
      const result = maskPatientName(null, "太郎");
      expect(result).toBe("***太○");
    });

    it("姓名がともにnullの場合は伏字を返す", () => {
      const result = maskPatientName(null, null);
      expect(result).toBe("***");
    });

    it("姓名がともにundefinedの場合は伏字を返す", () => {
      const result = maskPatientName(undefined, undefined);
      expect(result).toBe("***");
    });

    it("1文字の姓名をマスキングする", () => {
      const result = maskPatientName("山", "太");
      expect(result).toBe("山○太○");
    });
  });
});

describe("extractAndMaskPatientName", () => {
  describe("正常系", () => {
    it("データから患者名を抽出してマスキングする", () => {
      const data = {
        patientLastName: "山田",
        patientFirstName: "太郎",
        otherField: "value",
      };
      const result = extractAndMaskPatientName(data);
      expect(result).toBe("山○太○");
    });

    it("姓のみの場合にマスキングする", () => {
      const data = { patientLastName: "山田" };
      const result = extractAndMaskPatientName(data);
      expect(result).toBe("山○");
    });
  });

  describe("該当データなし", () => {
    it("nullの場合はnullを返す", () => {
      const result = extractAndMaskPatientName(null);
      expect(result).toBeNull();
    });

    it("患者名フィールドが無い場合はnullを返す", () => {
      const data = { someField: "value" };
      const result = extractAndMaskPatientName(data);
      expect(result).toBeNull();
    });

    it("患者名フィールドが文字列でない場合はnullを返す", () => {
      const data = { patientLastName: 123, patientFirstName: true };
      const result = extractAndMaskPatientName(data);
      expect(result).toBeNull();
    });
  });
});

describe("maskDataFields", () => {
  describe("正常系", () => {
    it("患者氏名フィールドをマスキングする", () => {
      const data = {
        patientLastName: "山田",
        patientFirstName: "太郎",
        patientId: "P001",
      };
      const result = maskDataFields(data);
      expect(result).not.toBeNull();
      expect(result!.patientLastName).not.toBe("山田");
      expect(result!.patientFirstName).not.toBe("太郎");
      expect(result!.patientId).toBe("P001");
    });

    it("usernameフィールドをマスキングする", () => {
      const data = { username: "admin_user", role: "ADMIN" };
      const result = maskDataFields(data);
      expect(result).not.toBeNull();
      expect(result!.username).toBe("a********r");
      expect(result!.role).toBe("ADMIN");
    });

    it("actorNameフィールドをマスキングする", () => {
      const data = { actorName: "test_user" };
      const result = maskDataFields(data);
      expect(result).not.toBeNull();
      expect(result!.actorName).toBe("t*******r");
    });
  });

  describe("境界値", () => {
    it("nullの場合はnullを返す", () => {
      const result = maskDataFields(null);
      expect(result).toBeNull();
    });

    it("個人情報フィールドが無い場合は元のデータを返す", () => {
      const data = { action: "LOGIN", targetId: "123" };
      const result = maskDataFields(data);
      expect(result).toEqual(data);
    });
  });
});
