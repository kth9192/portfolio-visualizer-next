import { createApiResponse } from "@/app/interface/dto/api";
import { createPortfolioService } from "@/lib/server/database";
import { NextRequest, NextResponse } from "next/server";

export async function GET(params: NextRequest) {
  try {
    const pathname = params.nextUrl.pathname;
    const portfolioId = pathname.split("/").pop();

    const portfolioService = await createPortfolioService();
    const res = await portfolioService.getPortfolioById(portfolioId!);

    console.log("portfolio is deleted", res);
    return NextResponse.json(createApiResponse(res, true, "success", 200), {
      status: 200,
    });
    return;
  } catch (error) {
    console.error("get portfolio error", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const pathname = req.nextUrl.pathname;
    const portfolioId = pathname.split("/").pop();

    const portfolioService = await createPortfolioService();
    const res = await portfolioService.deletePortfolio(portfolioId!);

    console.log("portfolio is deleted", res);
    return NextResponse.json(createApiResponse(res, true, "success", 200), {
      status: 200,
    });
  } catch (error) {
    console.error("delete portfolio error", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
