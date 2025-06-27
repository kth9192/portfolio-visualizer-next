import { portfolioCreateSchema } from "@/app/interface/schema/portfolio";
import { createPortfolioService } from "@/app/lib/server/database";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const validatedData = portfolioCreateSchema.parse(body);

    const portfolioService = await createPortfolioService();

    const res = await portfolioService.savePortfolio(validatedData);

    console.log("post save", res);

    return NextResponse.json(res, { status: 200 });
  } catch (error) {
    console.error("post save error", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
