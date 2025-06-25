import { createETFService } from "@/app/lib/server/database";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl;
    const searchParams = url.searchParams;
    const etfService = createETFService();
    const etfInfos = await etfService.getETFList();

    return NextResponse.json(etfInfos , { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
