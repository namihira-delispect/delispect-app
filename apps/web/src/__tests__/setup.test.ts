import { describe, it, expect } from "vitest";

describe("Project Setup", () => {
  it("テスト環境が正しく動作する", () => {
    expect(true).toBe(true);
  });

  it("TypeScriptの型チェックが機能する", () => {
    const message: string = "DELISPECT";
    expect(message).toBe("DELISPECT");
  });
});
