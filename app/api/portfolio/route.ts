import { createApiResponse } from "@/app/interface/dto/api";
import { portfolioCreateSchema } from "@/app/interface/schema/portfolio";
import { createPortfolioService } from "@/lib/server/database";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const portfolioService = await createPortfolioService();
    const portfolios = await portfolioService.getPortfolios();

    const res = createApiResponse(portfolios, true, "success", 200);
    return NextResponse.json(res, { status: 200 });
  } catch (error) {
    console.error("get portfolios error", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const validatedData = portfolioCreateSchema.parse(body);

    const portfolioService = await createPortfolioService();

    const res = await portfolioService.savePortfolio(validatedData);


    return NextResponse.json(createApiResponse(res, true, "success", 201), { status: 201 });
  } catch (error) {
    console.error("post save error", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
