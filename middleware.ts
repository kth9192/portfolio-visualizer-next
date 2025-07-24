import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log("🔥🔥🔥 MIDDLEWARE START 🔥🔥🔥");

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  console.log(`Auth middleware: ${request.nextUrl.pathname}`);

  const sessionCookie = request.cookies.get("better-auth.session_token");
  const isLoggedIn = !!sessionCookie?.value;

  const isAuthPage =
    pathname.startsWith("/auth") || pathname.startsWith("/login");

  console.log("🍪 Session cookie exists:", isLoggedIn);
  console.log("📍 Is auth page:", isAuthPage);

  // 로그인된 사용자가 인증 페이지에 접근
  if (isLoggedIn && isAuthPage) {
    console.log("🚀 Redirecting logged user to dashboard");
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 로그인하지 않은 사용자가 보호된 페이지에 접근
  if (!isLoggedIn && !isAuthPage) {
    console.log("🔒 Redirecting to login");
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    //해당 경로를 제외하고 미들웨어 실횅
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
