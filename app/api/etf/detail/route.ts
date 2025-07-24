import { createApiResponse } from "@/app/interface/dto/api";
import { createETFService } from "@/lib/server/database";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl;
    const searchParams = url.searchParams;

    const etfService = createETFService();
    const etfDetail = await etfService.getETFDetail(
      searchParams.get("ticker")!
    );

    const res = createApiResponse(etfDetail, true, "success", 200);

    return NextResponse.json(res, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
