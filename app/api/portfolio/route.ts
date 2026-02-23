import { createApiResponse } from "@/app/interface/dto/api";
import {
  createPortfolioAssetReqDTO,
  createPortfolioMetricsReqDTO,
  createPortfolioReqDTO,
  createPortfolioSettingReqDTO,
} from "@/app/interface/dto/portfolio";
import { portfolioSaveSchema } from "@/app/interface/schema/portfolio";
import { auth } from "@/lib/auth";
import { createPortfolioService } from "@/lib/server/database";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const portfolioService = await createPortfolioService();
    const portfolios = await portfolioService.getPortfolios();

    const res = createApiResponse(portfolios, true, "success", 200);
    return NextResponse.json(res, { status: 200 });
  } catch (error) {
    console.error("get portfolios error", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const session = await auth.api.getSession({
      headers: await headers(), // you need to pass the headers object.
    });

    const validatedData = portfolioSaveSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 },
      );
    }

    const portfolioService = await createPortfolioService();

    const res = await portfolioService.savePortfolio(
      createPortfolioReqDTO({
        name: validatedData.data.name,
        initialAmount: validatedData.data.initialAmount,
        description: validatedData.data.description,
        assets: validatedData.data.assets.map((asset) =>
          createPortfolioAssetReqDTO({
            symbol: asset.symbol,
            weight: asset.weight,
            shares: asset.shares,
          }),
        ),
        setting: createPortfolioSettingReqDTO({
          rebalanceFrequency: validatedData.data.setting.rebalanceFrequency,
          startDate: validatedData.data.setting.startDate,
          endDate: validatedData.data.setting.endDate,
        }),
        metrics: createPortfolioMetricsReqDTO({
          totalReturn: validatedData.data.metrics.totalReturn,
          cagr: validatedData.data.metrics.cagr,
          mdd: validatedData.data.metrics.mdd,
          volatility: validatedData.data.metrics.volatility,
          sharpRatio: validatedData.data.metrics.sharpRatio,
          finalAmount: validatedData.data.metrics.finalAmount,
        }),
        user_id: session.user.id,
        portfolio_id: validatedData.data.portfolio_id,
      }),
    );

    return NextResponse.json(createApiResponse(res, true, "success", 201), {
      status: 201,
    });
  } catch (error) {
    console.error("post save error", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
