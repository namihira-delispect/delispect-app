import { describe, it, expect } from "vitest";
import { fetchEmrData } from "../mockEmrApi";

describe("fetchEmrData（Mock電子カルテAPI）", () => {
  describe("正常系", () => {
    it("指定日付範囲のデータを返す", async () => {
      const result = await fetchEmrData("2026-01-01", "2026-01-01");
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });

    it("複数日の範囲を指定した場合にデータを返す", async () => {
      const result = await fetchEmrData("2026-01-01", "2026-01-03");
      expect(result.length).toBeGreaterThan(0);
    });

    it("各入院データに必須フィールドが含まれる", async () => {
      const result = await fetchEmrData("2026-01-15", "2026-01-15");
      const first = result[0];

      // 入院データの検証
      expect(first.admission).toBeDefined();
      expect(first.admission.externalAdmissionId).toBeTruthy();
      expect(first.admission.patientId).toBeTruthy();
      expect(first.admission.lastName).toBeTruthy();
      expect(first.admission.firstName).toBeTruthy();
      expect(first.admission.birthday).toBeTruthy();
      expect(first.admission.sex).toBeTruthy();
      expect(first.admission.admissionDate).toBeTruthy();
    });

    it("バイタルサインデータが含まれる", async () => {
      const result = await fetchEmrData("2026-01-15", "2026-01-15");
      const first = result[0];
      expect(first.vitalSigns).toBeDefined();
      expect(first.vitalSigns.length).toBeGreaterThan(0);

      const vs = first.vitalSigns[0];
      expect(vs.admissionId).toBeTruthy();
      expect(vs.measuredAt).toBeTruthy();
    });

    it("検査値データが含まれる", async () => {
      const result = await fetchEmrData("2026-01-15", "2026-01-15");
      const first = result[0];
      expect(first.labResults).toBeDefined();
      expect(first.labResults.length).toBeGreaterThan(0);

      const lr = first.labResults[0];
      expect(lr.admissionId).toBeTruthy();
      expect(lr.itemCode).toBeTruthy();
      expect(typeof lr.value).toBe("number");
      expect(lr.measuredAt).toBeTruthy();
    });

    it("処方データが含まれる", async () => {
      const result = await fetchEmrData("2026-01-15", "2026-01-15");
      const first = result[0];
      expect(first.prescriptions).toBeDefined();
      expect(first.prescriptions.length).toBeGreaterThan(0);

      const rx = first.prescriptions[0];
      expect(rx.admissionId).toBeTruthy();
      expect(rx.drugName).toBeTruthy();
      expect(rx.prescriptionType).toBeTruthy();
      expect(rx.prescribedAt).toBeTruthy();
    });

    it("入院日の外部IDがユニークである", async () => {
      const result = await fetchEmrData("2026-01-01", "2026-01-03");
      const ids = result.map((r) => r.admission.externalAdmissionId);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe("データの妥当性", () => {
    it("バイタルサインの体温が妥当な範囲である", async () => {
      const result = await fetchEmrData("2026-01-15", "2026-01-15");
      for (const data of result) {
        for (const vs of data.vitalSigns) {
          if (vs.bodyTemperature !== undefined) {
            expect(vs.bodyTemperature).toBeGreaterThanOrEqual(36.0);
            expect(vs.bodyTemperature).toBeLessThanOrEqual(37.5);
          }
        }
      }
    });

    it("バイタルサインの脈拍が妥当な範囲である", async () => {
      const result = await fetchEmrData("2026-01-15", "2026-01-15");
      for (const data of result) {
        for (const vs of data.vitalSigns) {
          if (vs.pulse !== undefined) {
            expect(vs.pulse).toBeGreaterThanOrEqual(60);
            expect(vs.pulse).toBeLessThanOrEqual(100);
          }
        }
      }
    });

    it("入院データの性別が有効な値である", async () => {
      const result = await fetchEmrData("2026-01-15", "2026-01-15");
      const validSex = ["MALE", "FEMALE", "OTHER", "UNKNOWN"];
      for (const data of result) {
        expect(validSex).toContain(data.admission.sex);
      }
    });

    it("処方種別が有効な値である", async () => {
      const result = await fetchEmrData("2026-01-15", "2026-01-15");
      const validTypes = ["ORAL", "INJECTION", "EXTERNAL"];
      for (const data of result) {
        for (const rx of data.prescriptions) {
          expect(validTypes).toContain(rx.prescriptionType);
        }
      }
    });
  });
});
