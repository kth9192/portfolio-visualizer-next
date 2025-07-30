import { createApiResponse } from "@/app/interface/dto/api";
import { createPortfolioCreateDTO } from "@/app/interface/dto/portfolio";
import { portfolioCreateSchema } from "@/app/interface/schema/portfolio";
import { createPortfolioService } from "@/lib/server/database";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { auth } from '@/lib/auth'

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
  
    const session = await auth.api.getSession({
      headers: await headers() // you need to pass the headers object.
  })

    const validatedData = portfolioCreateSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }

    const portfolioService = await createPortfolioService();

    const res = await portfolioService.savePortfolio(createPortfolioCreateDTO({
      name: validatedData.data.name,
      initialAmount: validatedData.data.initialAmount,
      description: validatedData.data.description,
      rebalanceFrequency: validatedData.data.rebalanceFrequency,
      assets: validatedData.data.assets.map((asset) => ({
        symbol: asset.symbol,
        weight: asset.weight,
        shares: asset.shares,
      })),
      setting:  {
        rebalanceFrequency: validatedData.data.rebalanceFrequency,
        startDate: validatedData.data.setting.startDate,
        endDate: validatedData.data.setting.endDate,
      },
      user_id: session.user.id,
    }));


    return NextResponse.json(createApiResponse(res, true, "success", 201), { status: 201 });
  } catch (error) {
    console.error("post save error", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
