import { describe, it, expect } from "vitest";
import { filterNavItemsByRole } from "../navigation";
import { NAV_ITEMS } from "../constants";

describe("filterNavItemsByRole", () => {
  describe("一般ユーザーの場合", () => {
    it("管理メニューが非表示になる", () => {
      const result = filterNavItemsByRole(NAV_ITEMS, ["GENERAL_USER"]);

      const labels = result.map((item) => item.label);
      expect(labels).toContain("患者入院一覧");
      expect(labels).not.toContain("管理");
      expect(labels).toContain("個人設定");
    });
  });

  describe("システム管理者の場合", () => {
    it("管理メニューが表示される", () => {
      const result = filterNavItemsByRole(NAV_ITEMS, ["SYSTEM_ADMIN"]);

      const labels = result.map((item) => item.label);
      expect(labels).toContain("患者入院一覧");
      expect(labels).toContain("管理");
      expect(labels).toContain("個人設定");
    });
  });

  describe("全権管理者の場合", () => {
    it("すべてのメニューが表示される", () => {
      const result = filterNavItemsByRole(NAV_ITEMS, ["SUPER_ADMIN"]);

      const labels = result.map((item) => item.label);
      expect(labels).toContain("患者入院一覧");
      expect(labels).toContain("管理");
      expect(labels).toContain("個人設定");
    });
  });

  describe("ロールが空の場合", () => {
    it("allowedRolesが未設定の項目のみ表示される", () => {
      const result = filterNavItemsByRole(NAV_ITEMS, []);

      const labels = result.map((item) => item.label);
      expect(labels).toContain("患者入院一覧");
      expect(labels).not.toContain("管理");
      expect(labels).toContain("個人設定");
    });
  });

  describe("カスタムナビゲーション項目の場合", () => {
    it("allowedRolesが未設定の項目は常に表示される", () => {
      const items = [
        { label: "公開メニュー", href: "/public" },
        { label: "限定メニュー", href: "/limited", allowedRoles: ["SUPER_ADMIN" as const] },
      ];

      const result = filterNavItemsByRole(items, ["GENERAL_USER"]);
      expect(result).toHaveLength(1);
      expect(result[0].label).toBe("公開メニュー");
    });
  });
});
