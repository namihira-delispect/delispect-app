import { describe, it, expect } from "vitest";
import { getVisiblePages } from "../Pagination";

describe("getVisiblePages", () => {
  describe("総ページ数が7以下の場合", () => {
    it("すべてのページ番号を返す", () => {
      expect(getVisiblePages(1, 5)).toEqual([1, 2, 3, 4, 5]);
    });

    it("1ページの場合は[1]を返す", () => {
      expect(getVisiblePages(1, 1)).toEqual([1]);
    });

    it("7ページの場合は全ページを返す", () => {
      expect(getVisiblePages(4, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    });
  });

  describe("総ページ数が8以上の場合", () => {
    it("先頭ページ付近では末尾に省略記号を表示する", () => {
      const result = getVisiblePages(1, 10);
      expect(result[0]).toBe(1);
      expect(result).toContain("...");
      expect(result[result.length - 1]).toBe(10);
    });

    it("中間ページでは先頭と末尾に省略記号を表示する", () => {
      const result = getVisiblePages(5, 10);
      expect(result[0]).toBe(1);
      expect(result[1]).toBe("...");
      expect(result).toContain(5);
      expect(result[result.length - 1]).toBe(10);
    });

    it("末尾ページ付近では先頭に省略記号を表示する", () => {
      const result = getVisiblePages(10, 10);
      expect(result[0]).toBe(1);
      expect(result).toContain("...");
      expect(result[result.length - 1]).toBe(10);
    });

    it("現在ページの前後のページを含む", () => {
      const result = getVisiblePages(5, 10);
      expect(result).toContain(4);
      expect(result).toContain(5);
      expect(result).toContain(6);
    });
  });
});
