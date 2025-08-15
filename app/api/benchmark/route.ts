import { createApiResponse } from "@/app/interface/dto/api";
import { createBenchmarkService } from "@/lib/server/database";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {

    const params = request.nextUrl.searchParams;

    const startDate = params.get("start_date") ;
    const endDate = params.get("end_date") ;

    if(!startDate || !endDate){
      return NextResponse.json(
        { error: "Missing start date or end date parameter" },
        { status: 400 }
      );
    }

    const symbols = params.get("symbols")?.split(",") ?? ["VTI", "QQQ"];

    const benchmarkService = createBenchmarkService();
    const benchmarkInfos = await benchmarkService.getBenchmarkForPeriod(
      symbols,
      new Date(startDate),
      new Date(endDate)
    );


    const res = createApiResponse(benchmarkInfos, true, "success", 200);
    return NextResponse.json(res, { status: 200 });
  } catch (error) {

    console.log("get benchmark error", error);
    
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
