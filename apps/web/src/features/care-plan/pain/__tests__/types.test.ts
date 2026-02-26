import { describe, it, expect } from "vitest";
import {
  PAIN_QUESTION_STEPS,
  PAIN_SITES,
  PAIN_SITE_MAP,
  PAIN_SITE_GROUP_LABELS,
  SITE_DETAIL_CHECKS,
  LIFE_IMPACT_ITEMS,
  createInitialPainDetails,
  groupPainSitesByGroup,
  generatePainInstructions,
} from "../types";
import type { PainCarePlanDetails } from "../types";

describe("疼痛ケアプラン型定義", () => {
  describe("PAIN_QUESTION_STEPS", () => {
    it("7つの質問ステップが定義されている", () => {
      expect(PAIN_QUESTION_STEPS).toHaveLength(7);
    });

    it("最初のステップはPAIN_MEDICATIONである", () => {
      expect(PAIN_QUESTION_STEPS[0].id).toBe("PAIN_MEDICATION");
    });

    it("最後のステップはCONFIRMATIONである", () => {
      expect(PAIN_QUESTION_STEPS[6].id).toBe("CONFIRMATION");
    });

    it("全ステップにラベルと説明が設定されている", () => {
      for (const step of PAIN_QUESTION_STEPS) {
        expect(step.label).toBeDefined();
        expect(step.label.length).toBeGreaterThan(0);
        expect(step.description).toBeDefined();
        expect(step.description.length).toBeGreaterThan(0);
      }
    });
  });

  describe("PAIN_SITES", () => {
    it("23箇所の部位が定義されている", () => {
      expect(PAIN_SITES).toHaveLength(23);
    });

    it("全部位にID、ラベル、グループが設定されている", () => {
      for (const site of PAIN_SITES) {
        expect(site.id).toBeDefined();
        expect(site.label).toBeDefined();
        expect(site.group).toBeDefined();
      }
    });

    it("4つのグループに分類されている", () => {
      const groups = new Set(PAIN_SITES.map((s) => s.group));
      expect(groups.size).toBe(4);
      expect(groups.has("HEAD_NECK")).toBe(true);
      expect(groups.has("TRUNK")).toBe(true);
      expect(groups.has("UPPER_LIMB")).toBe(true);
      expect(groups.has("LOWER_LIMB")).toBe(true);
    });
  });

  describe("PAIN_SITE_MAP", () => {
    it("部位IDからPainSiteDefinitionが取得できる", () => {
      const head = PAIN_SITE_MAP.HEAD;
      expect(head).toBeDefined();
      expect(head.label).toBe("頭部");
      expect(head.group).toBe("HEAD_NECK");
    });

    it("全部位がマップに含まれている", () => {
      for (const site of PAIN_SITES) {
        expect(PAIN_SITE_MAP[site.id]).toBeDefined();
        expect(PAIN_SITE_MAP[site.id].label).toBe(site.label);
      }
    });
  });

  describe("PAIN_SITE_GROUP_LABELS", () => {
    it("4つのグループラベルが定義されている", () => {
      expect(Object.keys(PAIN_SITE_GROUP_LABELS)).toHaveLength(4);
    });

    it("日本語のラベルが設定されている", () => {
      expect(PAIN_SITE_GROUP_LABELS.HEAD_NECK).toBe("頭・首");
      expect(PAIN_SITE_GROUP_LABELS.TRUNK).toBe("体幹");
      expect(PAIN_SITE_GROUP_LABELS.UPPER_LIMB).toBe("上肢");
      expect(PAIN_SITE_GROUP_LABELS.LOWER_LIMB).toBe("下肢");
    });
  });

  describe("SITE_DETAIL_CHECKS", () => {
    it("3つの確認項目が定義されている", () => {
      expect(SITE_DETAIL_CHECKS).toHaveLength(3);
    });

    it("触った時の痛み・動かした時の痛み・違和感の3項目がある", () => {
      const ids = SITE_DETAIL_CHECKS.map((c) => c.id);
      expect(ids).toContain("TOUCH_PAIN");
      expect(ids).toContain("MOVEMENT_PAIN");
      expect(ids).toContain("NUMBNESS");
    });

    it("全項目にラベルと説明が設定されている", () => {
      for (const check of SITE_DETAIL_CHECKS) {
        expect(check.label.length).toBeGreaterThan(0);
        expect(check.description.length).toBeGreaterThan(0);
      }
    });
  });

  describe("LIFE_IMPACT_ITEMS", () => {
    it("3つの生活影響項目が定義されている", () => {
      expect(LIFE_IMPACT_ITEMS).toHaveLength(3);
    });

    it("睡眠・動き・排泄の3項目がある", () => {
      const ids = LIFE_IMPACT_ITEMS.map((i) => i.id);
      expect(ids).toContain("SLEEP_IMPACT");
      expect(ids).toContain("MOBILITY_IMPACT");
      expect(ids).toContain("TOILET_IMPACT");
    });

    it("全項目にラベルと説明が設定されている", () => {
      for (const item of LIFE_IMPACT_ITEMS) {
        expect(item.label.length).toBeGreaterThan(0);
        expect(item.description.length).toBeGreaterThan(0);
      }
    });
  });
});

describe("createInitialPainDetails", () => {
  it("初期値がnullおよび空配列で構成されている", () => {
    const initial = createInitialPainDetails();
    expect(initial.hasDaytimePain).toBeNull();
    expect(initial.hasNighttimeAwakening).toBeNull();
    expect(initial.selectedSiteIds).toEqual([]);
    expect(initial.siteDetails).toEqual([]);
    expect(initial.sleepImpact).toBeNull();
    expect(initial.mobilityImpact).toBeNull();
    expect(initial.toiletImpact).toBeNull();
  });
});

describe("groupPainSitesByGroup", () => {
  it("全4グループにサイトが分類される", () => {
    const grouped = groupPainSitesByGroup();
    expect(Object.keys(grouped)).toHaveLength(4);
    expect(grouped.HEAD_NECK.length).toBeGreaterThan(0);
    expect(grouped.TRUNK.length).toBeGreaterThan(0);
    expect(grouped.UPPER_LIMB.length).toBeGreaterThan(0);
    expect(grouped.LOWER_LIMB.length).toBeGreaterThan(0);
  });

  it("全サイトがいずれかのグループに含まれる", () => {
    const grouped = groupPainSitesByGroup();
    const totalCount =
      grouped.HEAD_NECK.length +
      grouped.TRUNK.length +
      grouped.UPPER_LIMB.length +
      grouped.LOWER_LIMB.length;
    expect(totalCount).toBe(PAIN_SITES.length);
  });
});

describe("generatePainInstructions", () => {
  it("痛みの訴えがない場合は該当メッセージを返す", () => {
    const details: PainCarePlanDetails = {
      hasDaytimePain: null,
      hasNighttimeAwakening: null,
      selectedSiteIds: [],
      siteDetails: [],
      sleepImpact: null,
      mobilityImpact: null,
      toiletImpact: null,
    };
    expect(generatePainInstructions(details)).toBe("痛みの訴えなし");
  });

  it("全てがfalseの場合も痛みの訴えなしを返す", () => {
    const details: PainCarePlanDetails = {
      hasDaytimePain: false,
      hasNighttimeAwakening: false,
      selectedSiteIds: [],
      siteDetails: [],
      sleepImpact: false,
      mobilityImpact: false,
      toiletImpact: false,
    };
    expect(generatePainInstructions(details)).toBe("痛みの訴えなし");
  });

  it("日中の痛みがある場合に該当行が含まれる", () => {
    const details: PainCarePlanDetails = {
      hasDaytimePain: true,
      hasNighttimeAwakening: false,
      selectedSiteIds: [],
      siteDetails: [],
      sleepImpact: null,
      mobilityImpact: null,
      toiletImpact: null,
    };
    const result = generatePainInstructions(details);
    expect(result).toContain("日中活動時に痛みあり");
  });

  it("夜間覚醒がある場合に該当行が含まれる", () => {
    const details: PainCarePlanDetails = {
      hasDaytimePain: false,
      hasNighttimeAwakening: true,
      selectedSiteIds: [],
      siteDetails: [],
      sleepImpact: null,
      mobilityImpact: null,
      toiletImpact: null,
    };
    const result = generatePainInstructions(details);
    expect(result).toContain("痛みによる夜間覚醒あり");
  });

  it("部位が選択されている場合に部位名が含まれる", () => {
    const details: PainCarePlanDetails = {
      hasDaytimePain: true,
      hasNighttimeAwakening: false,
      selectedSiteIds: ["HEAD", "LOWER_BACK"],
      siteDetails: [
        { siteId: "HEAD", touchPain: true, movementPain: false, numbness: false },
        { siteId: "LOWER_BACK", touchPain: false, movementPain: true, numbness: true },
      ],
      sleepImpact: null,
      mobilityImpact: null,
      toiletImpact: null,
    };
    const result = generatePainInstructions(details);
    expect(result).toContain("頭部");
    expect(result).toContain("腰部");
    expect(result).toContain("触痛あり");
    expect(result).toContain("運動時痛あり");
    expect(result).toContain("しびれ・違和感あり");
  });

  it("生活影響がある場合に該当行が含まれる", () => {
    const details: PainCarePlanDetails = {
      hasDaytimePain: true,
      hasNighttimeAwakening: false,
      selectedSiteIds: [],
      siteDetails: [],
      sleepImpact: true,
      mobilityImpact: true,
      toiletImpact: false,
    };
    const result = generatePainInstructions(details);
    expect(result).toContain("睡眠への影響あり");
    expect(result).toContain("動きへの影響あり");
    expect(result).not.toContain("排泄への影響あり");
  });
});
