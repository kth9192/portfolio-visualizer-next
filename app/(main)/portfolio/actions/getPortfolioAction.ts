"use server";

import { ApiResponse, createApiResponse } from "@/app/interface/dto/api";
import { PortfolioDTO } from "@/app/interface/dto/portfolio";
import { createPortfolioService } from "@/lib/server/database";

export async function getPortfoliosAction(): Promise<
  ApiResponse<PortfolioDTO[]>
> {
  try {
    const portfolioService = createPortfolioService();
    const portfolios = await portfolioService.getPortfolios();

    return createApiResponse(portfolios, true, "success", 200) as ApiResponse<
      PortfolioDTO[]
    >;
    // return JSON.parse(JSON.stringify(portfolios));
  } catch (error) {
    throw new Error("portfolio get failed from server action");
  }
}
