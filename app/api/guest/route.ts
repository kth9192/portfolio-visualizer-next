import { createApiResponse } from "@/app/interface/dto/api";
import { createAuthGuestService } from "@/lib/server/database";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (request: NextRequest) => {
  try {
    const authGuestService = createAuthGuestService();
    const result = await authGuestService.createGuestAccount();


    if (result.loginResponse?.headers) {
      const setCookieHeader = result.loginResponse.headers.get("set-cookie");

      if (setCookieHeader) {
        const cookieMatches = setCookieHeader.match(/([^=]+)=([^;]+)/g);
        if (cookieMatches) {
          cookieMatches.forEach((cookie) => {
            const [name, value] = cookie.split("=");

            request.cookies.set(name.trim(), value.trim());
          });
        }
      }
    }

    const res = createApiResponse(result, true, "success", 200);

    return NextResponse.json(res, { status: 200 });
  } catch (error) {
    console.error("createGuestAccount error", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
