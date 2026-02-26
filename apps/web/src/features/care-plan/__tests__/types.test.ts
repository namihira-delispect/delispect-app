import { describe, it, expect } from "vitest";
import {
  deriveOverallStatus,
  CARE_PLAN_CATEGORIES,
  CARE_PLAN_CATEGORY_LABELS,
  CARE_PLAN_ITEM_STATUS_LABELS,
  CARE_PLAN_OVERALL_STATUS_LABELS,
} from "../types";
import type { CarePlanItemStatusType } from "../types";

describe("deriveOverallStatus", () => {
  describe("未実施の判定", () => {
    it("全項目がNOT_STARTEDの場合は未実施を返す", () => {
      const statuses: CarePlanItemStatusType[] = ["NOT_STARTED", "NOT_STARTED", "NOT_STARTED"];
      expect(deriveOverallStatus(statuses)).toBe("NOT_STARTED");
    });

    it("全項目がNOT_STARTEDまたはNOT_APPLICABLEのみで、COMPLETEDがない場合", () => {
      // NOT_APPLICABLE + NOT_STARTED のみの場合 → allCompletedOrNA = false (NOT_STARTEDがある)
      // hasInProgress = false, hasCompleted = false → NOT_STARTED
      const statuses: CarePlanItemStatusType[] = ["NOT_STARTED", "NOT_APPLICABLE", "NOT_STARTED"];
      expect(deriveOverallStatus(statuses)).toBe("NOT_STARTED");
    });

    it("空配列の場合は未実施を返す", () => {
      expect(deriveOverallStatus([])).toBe("NOT_STARTED");
    });
  });

  describe("実施中の判定", () => {
    it("一部がIN_PROGRESSの場合は実施中を返す", () => {
      const statuses: CarePlanItemStatusType[] = ["NOT_STARTED", "IN_PROGRESS", "NOT_STARTED"];
      expect(deriveOverallStatus(statuses)).toBe("IN_PROGRESS");
    });

    it("一部がCOMPLETEDで他がNOT_STARTEDの場合は実施中を返す", () => {
      const statuses: CarePlanItemStatusType[] = ["COMPLETED", "NOT_STARTED", "NOT_STARTED"];
      expect(deriveOverallStatus(statuses)).toBe("IN_PROGRESS");
    });

    it("IN_PROGRESSとCOMPLETEDが混在する場合は実施中を返す", () => {
      const statuses: CarePlanItemStatusType[] = ["COMPLETED", "IN_PROGRESS", "NOT_STARTED"];
      expect(deriveOverallStatus(statuses)).toBe("IN_PROGRESS");
    });

    it("COMPLETEDとNOT_APPLICABLEとNOT_STARTEDが混在する場合は実施中を返す", () => {
      const statuses: CarePlanItemStatusType[] = ["COMPLETED", "NOT_APPLICABLE", "NOT_STARTED"];
      expect(deriveOverallStatus(statuses)).toBe("IN_PROGRESS");
    });
  });

  describe("完了の判定", () => {
    it("全項目がCOMPLETEDの場合は完了を返す", () => {
      const statuses: CarePlanItemStatusType[] = ["COMPLETED", "COMPLETED", "COMPLETED"];
      expect(deriveOverallStatus(statuses)).toBe("COMPLETED");
    });

    it("全項目がCOMPLETEDまたはNOT_APPLICABLEの場合は完了を返す", () => {
      const statuses: CarePlanItemStatusType[] = ["COMPLETED", "NOT_APPLICABLE", "COMPLETED"];
      expect(deriveOverallStatus(statuses)).toBe("COMPLETED");
    });

    it("全項目がNOT_APPLICABLEの場合は完了を返す", () => {
      const statuses: CarePlanItemStatusType[] = [
        "NOT_APPLICABLE",
        "NOT_APPLICABLE",
        "NOT_APPLICABLE",
      ];
      expect(deriveOverallStatus(statuses)).toBe("COMPLETED");
    });
  });
});

describe("定数定義", () => {
  it("ケアプランカテゴリーが10項目ある", () => {
    expect(CARE_PLAN_CATEGORIES).toHaveLength(10);
  });

  it("全カテゴリーの表示ラベルが定義されている", () => {
    for (const category of CARE_PLAN_CATEGORIES) {
      expect(CARE_PLAN_CATEGORY_LABELS[category]).toBeDefined();
      expect(typeof CARE_PLAN_CATEGORY_LABELS[category]).toBe("string");
    }
  });

  it("ケアプランカテゴリーラベルに期待される値が含まれる", () => {
    expect(CARE_PLAN_CATEGORY_LABELS.MEDICATION).toBe("薬剤管理");
    expect(CARE_PLAN_CATEGORY_LABELS.PAIN).toBe("疼痛管理");
    expect(CARE_PLAN_CATEGORY_LABELS.DEHYDRATION).toBe("脱水管理");
    expect(CARE_PLAN_CATEGORY_LABELS.CONSTIPATION).toBe("便秘管理");
    expect(CARE_PLAN_CATEGORY_LABELS.INFLAMMATION).toBe("炎症管理");
    expect(CARE_PLAN_CATEGORY_LABELS.MOBILITY).toBe("離床促進");
    expect(CARE_PLAN_CATEGORY_LABELS.DEMENTIA).toBe("認知症ケア");
    expect(CARE_PLAN_CATEGORY_LABELS.SAFETY).toBe("安全管理");
    expect(CARE_PLAN_CATEGORY_LABELS.SLEEP).toBe("睡眠管理");
    expect(CARE_PLAN_CATEGORY_LABELS.INFORMATION).toBe("情報提供");
  });

  it("アイテムステータスラベルが4種定義されている", () => {
    expect(Object.keys(CARE_PLAN_ITEM_STATUS_LABELS)).toHaveLength(4);
    expect(CARE_PLAN_ITEM_STATUS_LABELS.NOT_STARTED).toBe("未実施");
    expect(CARE_PLAN_ITEM_STATUS_LABELS.IN_PROGRESS).toBe("実施中");
    expect(CARE_PLAN_ITEM_STATUS_LABELS.COMPLETED).toBe("完了");
    expect(CARE_PLAN_ITEM_STATUS_LABELS.NOT_APPLICABLE).toBe("該当なし");
  });

  it("全体ステータスラベルが3種定義されている", () => {
    expect(Object.keys(CARE_PLAN_OVERALL_STATUS_LABELS)).toHaveLength(3);
    expect(CARE_PLAN_OVERALL_STATUS_LABELS.NOT_STARTED).toBe("未実施");
    expect(CARE_PLAN_OVERALL_STATUS_LABELS.IN_PROGRESS).toBe("実施中");
    expect(CARE_PLAN_OVERALL_STATUS_LABELS.COMPLETED).toBe("完了");
  });
});
