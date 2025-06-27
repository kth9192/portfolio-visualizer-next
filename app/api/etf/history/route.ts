import { createETFService } from "@/app/lib/server/database";
import { parse } from "date-fns";
import { NextRequest, NextResponse } from "next/server";
import { createApiResponse } from "@/app/interface/dto/api";

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl;
    const searchParams = url.searchParams;

    const ticker = searchParams.get("ticker");
    const startDateParam = searchParams.get("start_date");
    const endDateParam = searchParams.get("end_date");

    const startDate = startDateParam
      ? parse(startDateParam, "yyyy-MM-dd", new Date())
      : null;

    const endDate = endDateParam
      ? parse(endDateParam, "yyyy-MM-dd", new Date())
      : null;

    if (!ticker) {
      return NextResponse.json(
        { error: "Missing ticker parameter" },
        { status: 400 }
      );
    }

    if (startDate === null || endDate === null) {
      return NextResponse.json(
        { error: "Missing start date or end date parameter" },
        { status: 400 }
      );
    }

    const etfService = createETFService();
    const etfInfos = await etfService.getETFHistory(
      ticker.split(","),
      startDate,
      endDate
    );

    const res = createApiResponse(etfInfos, true, "success", 200);
    return NextResponse.json(res, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
