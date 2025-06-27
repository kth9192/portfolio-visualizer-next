import { createETFService } from "@/app/lib/server/database";
import { NextRequest, NextResponse } from "next/server";
import { createApiResponse } from "@/app/interface/dto/api";

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl;
    const searchParams = url.searchParams;
    const etfService = createETFService();
    const etfInfos = await etfService.getETFList();

    const res = createApiResponse(etfInfos, true, "success", 200);
    return NextResponse.json(res, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
