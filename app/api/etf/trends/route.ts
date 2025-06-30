import { createETFService } from "@/app/lib/server/database";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = request.nextUrl;

  const etfService = createETFService();
  const etfTrends = await etfService.getTrends();

  return NextResponse.json(etfTrends, { status: 200 });
}
