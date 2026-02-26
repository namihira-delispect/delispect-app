import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE_NAME = "delispect_session";

/** 認証不要のパス */
const PUBLIC_PATHS = ["/login", "/api/auth"];

/**
 * ミドルウェア: 認証チェック
 *
 * - 公開パスは認証不要
 * - セッションCookieが存在しない場合はログインページにリダイレクト
 * - ログイン済みユーザーがログインページにアクセスした場合はホームにリダイレクト
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionId = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  // 静的ファイルはスキップ
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 公開パスかどうかをチェック
  const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

  // 未認証ユーザーが保護されたパスにアクセスした場合
  if (!sessionId && !isPublicPath) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 認証済みユーザーがログインページにアクセスした場合
  if (sessionId && pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
