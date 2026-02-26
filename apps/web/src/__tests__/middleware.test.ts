import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { middleware } from "../middleware";

function createRequest(path: string, cookies: Record<string, string> = {}) {
  const url = new URL(path, "http://localhost:3000");
  const request = new NextRequest(url);
  for (const [key, value] of Object.entries(cookies)) {
    request.cookies.set(key, value);
  }
  return request;
}

describe("認証ミドルウェア", () => {
  it("未認証ユーザーが保護ページにアクセスするとログインにリダイレクト", () => {
    const request = createRequest("/patients");
    const response = middleware(request);

    expect(response.status).toBe(307);
    const location = response.headers.get("location");
    expect(location).toContain("/login");
    expect(location).toContain("callbackUrl=%2Fpatients");
  });

  it("未認証ユーザーがログインページにアクセスできる", () => {
    const request = createRequest("/login");
    const response = middleware(request);

    expect(response.status).toBe(200);
  });

  it("認証済みユーザーがログインページにアクセスするとホームにリダイレクト", () => {
    const request = createRequest("/login", {
      delispect_session: "valid-session-id",
    });
    const response = middleware(request);

    expect(response.status).toBe(307);
    const location = response.headers.get("location");
    expect(location).toContain("/");
  });

  it("認証済みユーザーは保護ページにアクセスできる", () => {
    const request = createRequest("/patients", {
      delispect_session: "valid-session-id",
    });
    const response = middleware(request);

    expect(response.status).toBe(200);
  });

  it("静的ファイルはミドルウェアをスキップ", () => {
    const request = createRequest("/_next/static/chunk.js");
    const response = middleware(request);

    expect(response.status).toBe(200);
  });

  it("API認証パスは認証不要", () => {
    const request = createRequest("/api/auth/login");
    const response = middleware(request);

    expect(response.status).toBe(200);
  });
});
