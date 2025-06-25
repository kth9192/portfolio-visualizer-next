import type { ETFPriceDTO } from "@/app/interface/dto/etf";
import {
  createPortfolioCreateDTO,
  type PortfolioCreateDTO,
  type PortfolioDTO,
} from '@/app/interface/dto/portfolio';
import { PrismaClient } from "@prisma/client";

export class PortfolioService {
  private prisma: PrismaClient;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient || new PrismaClient();
  }

  async getPortfolios(): Promise<PortfolioDTO[]> {
    try {
      const portfolios = await this.prisma.portfolios.findMany();

      return portfolios.map((portfolio) => ({
        id: portfolio.id,
        name: portfolio.name,
        initAmount: portfolio.initial_amount.toNumber(),
        created: portfolio.created,
        updated: portfolio.updated,
        description: portfolio.description,
        user_id: portfolio.user_id,
      })) as PortfolioDTO[];
    } catch (error) {
      console.error(error);

      return [];
    }
  }

  async savePortfolio(
    portfolioData: PortfolioCreateDTO
  ): Promise<PortfolioCreateDTO | null> {
    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const portfolio = await tx.portfolios.create({
          data: {
            name: portfolioData.name,
            initial_amount: portfolioData.initAmount,
            description: portfolioData.description,
            user_id: portfolioData.user_id,
          },
        });

        console.log("portfolio", portfolio);

        const setting = await tx.portfolio_settings.create({
          data: {
            portfolio_id: portfolio.id,
            rebalance_frequency: portfolioData.rebalanceFrequency,
            start_date: portfolioData.startDate,
            end_date: portfolioData.endDate,
          },
        });

        console.log("setting", setting);

        const assets = await tx.portfolio_assets.createMany({
          data: portfolioData.assets.map((asset) => ({
            portfolio_id: portfolio.id,
            symbol: asset.symbol,
            weight: asset.weight,
            shares: asset.shares,
          })),
        });

        console.log("assets", assets);

        return {
          portfolio,
          setting,
          assets,
        };
      });

      console.log("database save", result);

      return createPortfolioCreateDTO({
        name: portfolioData.name,
        initAmount: portfolioData.initAmount,
        description: portfolioData.description,
        rebalanceFrequency: portfolioData.rebalanceFrequency,
        startDate: portfolioData.startDate,
        endDate: portfolioData.endDate,
        assets: portfolioData.assets,
      });
    } catch (error) {
      console.error("portfolio service save error", error);

      return null;
    }
  }
}
