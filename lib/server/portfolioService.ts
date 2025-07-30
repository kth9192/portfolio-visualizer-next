import type { ETFPriceDTO } from "@/app/interface/dto/etf";
import {
  createPortfolioAssetDTO,
  createPortfolioCreateDTO,
  createPortfolioDTO,
  createPortfolioSettingDTO,
  PortfolioAssetDTO,
  type PortfolioCreateDTO,
  type PortfolioDTO,
} from "@/app/interface/dto/portfolio";
import { PrismaClient } from "@prisma/client";
import { format } from "date-fns";
import { RebalanceFrequency } from "@/app/interface/enum/rebanalceFrequency";
import { auth } from "../auth";
import { headers } from "next/headers";

export class PortfolioService {
  private prisma: PrismaClient;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient || new PrismaClient();
  }

  async getPortfolios(): Promise<PortfolioDTO[]> {
    try {

      const session = await auth.api.getSession({
        headers: await headers() 
    })
    
      const portfolios = await this.prisma.portfolios.findMany({
        where: {
          user_id: session.user.id,
        },
        include: {
          portfolio_assets: true,
          portfolio_settings: true,
        },
      });

      return portfolios.map((portfolio) => {
        const setting = portfolio.portfolio_settings[0];

        return createPortfolioDTO({
          id: portfolio.id,
          name: portfolio.name,
          initialAmount: portfolio.initial_amount.toNumber(),
          created: portfolio.created,
          updated: portfolio.updated,
          description: portfolio.description || "",
          user_id: portfolio.user_id || "",
          assets: portfolio.portfolio_assets.map((asset) =>
            createPortfolioAssetDTO({
              id: asset.id,
              portfolio_id: asset.portfolio_id,
              symbol: asset.symbol,
              weight: asset.weight.toNumber(),
              shares: asset.shares?.toNumber() || 0,
              created: asset.created,
              updated: asset.updated,
            })
          ),
          setting: createPortfolioSettingDTO({
            id: setting.id,
            portfolio_id: setting.portfolio_id,
            startDate: setting.start_date,
            endDate: setting.end_date,
            rebalanceFrequency:
              setting.rebalance_frequency as RebalanceFrequency,
            created: setting.created,
            updated: setting.updated,
          }),
        });
      });
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
            initial_amount: portfolioData.initialAmount,
            description: portfolioData.description,
            user_id: portfolioData.user_id,
          },
        });


        const setting = await tx.portfolio_settings.create({
          data: {
            portfolio_id: portfolio.id,
            rebalance_frequency: portfolioData.rebalanceFrequency,
            start_date: portfolioData.setting.startDate!,
            end_date: portfolioData.setting.endDate!,
          },
        });


        const assets = await tx.portfolio_assets.createMany({
          data: portfolioData.assets.map((asset) => ({
            portfolio_id: portfolio.id,
            symbol: asset.symbol,
            weight: asset.weight,
            shares: asset.shares,
          })),
        });


        return {
          portfolio,
          setting,
          assets,
        };
      });


      return createPortfolioCreateDTO({
        name: portfolioData.name,
        initialAmount: portfolioData.initialAmount,
        description: portfolioData.description,
        rebalanceFrequency: portfolioData.rebalanceFrequency,
        setting: portfolioData.setting,
        assets: portfolioData.assets,
      });
    } catch (error) {
      console.error("portfolio service save error", error);

      return null;
    }
  }
}
