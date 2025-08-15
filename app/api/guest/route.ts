import { createApiResponse } from "@/app/interface/dto/api";
import { createAuthGuestService } from "@/lib/server/database";
import { NextRequest, NextResponse } from "next/server";

export const POST = async () => {
  try {
    const authGuestService = createAuthGuestService();
    const result = await authGuestService.createGuestAccount();

    const res = createApiResponse(result, true, "success", 200);
    const response = NextResponse.json(res, { status: 200 });

    // Better Auth 세션 쿠키 설정
    if (result.loginResponse?.headers) {
      const setCookieHeader = result.loginResponse.headers.get("set-cookie");
      
      if (setCookieHeader) {
        console.log("Original cookie header:", setCookieHeader);
        
        // Better Auth 쿠키를 그대로 클라이언트에 전달
        response.headers.set("Set-Cookie", setCookieHeader);
      }
    }

    return response;
  } catch (error) {
    console.error("createGuestAccount error", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};