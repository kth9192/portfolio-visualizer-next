import { createApiResponse } from "@/app/interface/dto/api";
import { createETFService } from "@/lib/server/database";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const etfService = createETFService();
    const etfInfos = await etfService.getETFList();

    const res = createApiResponse(etfInfos, true, "success", 200);
    return NextResponse.json(res, { status: 200 });
  } catch (error) {
    console.log("get etf list error", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
