import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 정적 파일과 Next.js 내부 경로는 미들웨어를 건너뜀
  if (pathname.startsWith("/_next") || pathname.includes(".")) {
    return NextResponse.next();
  }

  // 세션 확인
  const sessionCookie = getSessionCookie(request);
  const isLoggedIn = !!sessionCookie;

  // API 경로 처리
  if (pathname.startsWith("/api")) {
    return handleApiRoutes(pathname, isLoggedIn, request);
  }

  // 페이지 경로 처리
  return handlePageRoutes(pathname, isLoggedIn, request);
}

function handleApiRoutes(
  pathname: string,
  isLoggedIn: boolean,
  request: NextRequest
) {
  // 인증이 필요하지 않은 API 경로
  const publicApiRoutes = ["/api/guest", "/api/auth"];
  const isPublicApi = publicApiRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isPublicApi || isLoggedIn) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/login", request.url));
}

function handlePageRoutes(
  pathname: string,
  isLoggedIn: boolean,
  request: NextRequest
) {
  const isAuthPage =
    pathname.startsWith("/auth") || pathname.includes("/login");

  // 로그인된 사용자가 인증 페이지 접근 시 대시보드로 리다이렉트
  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 미인증 사용자가 보호된 페이지 접근 시 로그인으로 리다이렉트
  if (!isLoggedIn && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
