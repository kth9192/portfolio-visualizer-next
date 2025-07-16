import { NextRequest, NextResponse } from "next/server";
import { createETFService } from "@/app/lib/server/database";
import { parse } from "date-fns";
import { createApiResponse } from "@/app/interface/dto/api";

export const GET = async (request: NextRequest) => {
  try {
    const url = request.nextUrl;
    const searchParams = url.searchParams;

    if (
      !searchParams.get("ticker") ||
      !searchParams.get("start_date") ||
      !searchParams.get("end_date")
    ) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const etfService = createETFService();
    const etfHistories = await etfService.getETFHistoryMonth(
      searchParams.get("ticker")!.split(","),
      parse(searchParams.get("start_date")!, "yyyy-MM-dd", new Date()),
      parse(searchParams.get("end_date")!, "yyyy-MM-dd", new Date())
    );

    const res = createApiResponse(
      etfHistories,
      true,
      "success",
      200
    );

    return NextResponse.json(res, { status: 200 });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
