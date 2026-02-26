import { describe, it, expect, vi } from "vitest";

// Next.js のモジュールをモック
vi.mock("next/server", () => {
  const NextResponse = {
    next: vi.fn(() => ({ type: "next" })),
    redirect: vi.fn((url: URL) => ({ type: "redirect", url: url.toString() })),
  };
  return { NextResponse };
});

import { middleware } from "../middleware";
import { NextResponse } from "next/server";

function createMockRequest(
  pathname: string,
  sessionCookie?: string,
) {
  return {
    nextUrl: { pathname },
    url: `http://localhost:3000${pathname}`,
    cookies: {
      get: vi.fn((name: string) => {
        if (name === "delispect_session" && sessionCookie) {
          return { value: sessionCookie };
        }
        return undefined;
      }),
    },
    headers: new Headers(),
  } as never;
}

describe("認証ミドルウェア", () => {
  it("ログインページへのアクセスは許可する", () => {
    const request = createMockRequest("/login");
    middleware(request);
    expect(NextResponse.next).toHaveBeenCalled();
  });

  it("認証APIへのアクセスは許可する", () => {
    const request = createMockRequest("/api/auth/login");
    middleware(request);
    expect(NextResponse.next).toHaveBeenCalled();
  });

  it("セッションCookieがない場合はログインページにリダイレクトする", () => {
    const request = createMockRequest("/dashboard");
    middleware(request);
    expect(NextResponse.redirect).toHaveBeenCalled();
  });

  it("セッションCookieがある場合はアクセスを許可する", () => {
    const request = createMockRequest("/dashboard", "valid-session-id");
    middleware(request);
    expect(NextResponse.next).toHaveBeenCalled();
  });

  it("静的アセットはスキップする", () => {
    const request = createMockRequest("/_next/static/chunk.js");
    middleware(request);
    expect(NextResponse.next).toHaveBeenCalled();
  });
});
