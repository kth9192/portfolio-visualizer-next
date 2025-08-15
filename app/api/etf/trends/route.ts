import { createApiResponse } from "@/app/interface/dto/api";
import { createETFService } from "@/lib/server/database";
import { NextResponse } from "next/server";

export async function GET() {
  const etfService = createETFService();
  const etfTrends = await etfService.getTrends();

  return NextResponse.json(createApiResponse(etfTrends, true, "success", 200), { status: 200 });
}
