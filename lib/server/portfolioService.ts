import {
  createPortfolioAssetDTO,
  createPortfolioDTO,
  createPortfolioMetricsDTO,
  createPortfolioReqDTO,
  createPortfolioSettingDTO,
  type PortfolioCreateDTO,
  type PortfolioDTO,
} from "@/app/interface/dto/portfolio";
import { RebalanceFrequency } from "@/app/interface/enum/rebanalceFrequency";
import { PrismaClient } from "@/app/generated/prisma";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { auth } from "../auth";

export class PortfolioService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  async getPortfolios(): Promise<PortfolioDTO[]> {
    try {
      const session = await auth.api.getSession({
        headers: await headers(),
      });

      const portfolios = await this.prisma.portfolios.findMany({
        where: {
          user_id: session.user.id,
        },
        include: {
          portfolio_assets: true,
          portfolio_settings: true,
          portfolio_metrics: true,
        },
      });

      return portfolios.map((portfolio) => {
        const setting = portfolio.portfolio_settings;

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
            }),
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
          metrics: createPortfolioMetricsDTO({
            id: portfolio.portfolio_metrics.id,
            portfolio_id: portfolio.portfolio_metrics.portfolio_id,
            totalReturn: portfolio.portfolio_metrics.total_return.toNumber(),
            cagr: portfolio.portfolio_metrics.cagr.toNumber(),
            mdd: portfolio.portfolio_metrics.mdd.toNumber(),
            volatility: portfolio.portfolio_metrics.volatility.toNumber(),
            sharpRatio: portfolio.portfolio_metrics.sharp_ratio.toNumber(),
            finalAmount: portfolio.portfolio_metrics.final_amount.toNumber(),
            created: portfolio.portfolio_metrics.created_at,
            updated: portfolio.portfolio_metrics.updated_at,
          }),
        });
      });
    } catch (error) {
      console.error(error);

      return [];
    }
  }

  async savePortfolio(
    portfolioData: PortfolioCreateDTO & { portfolio_id?: string },
  ): Promise<PortfolioCreateDTO | null> {
    console.log("portfolio modify test", portfolioData);

    try {
      await this.prisma.$transaction(async (tx) => {
        let portfolio;
        if (portfolioData.portfolio_id) {
          console.log("portfolio update");

          portfolio = await tx.portfolios.update({
            where: {
              id: portfolioData.portfolio_id,
            },
            data: {
              name: portfolioData.name,
              initial_amount: portfolioData.initialAmount,
              description: portfolioData.description,
              user_id: portfolioData.user_id,
            },
          });
        } else {
          portfolio = await tx.portfolios.create({
            data: {
              name: portfolioData.name,
              initial_amount: portfolioData.initialAmount,
              description: portfolioData.description,
              user_id: portfolioData.user_id,
            },
          });
        }

        const setting = await tx.portfolio_settings.upsert({
          where: { portfolio_id: portfolio.id },
          update: {
            start_date: portfolioData.setting.startDate!,
            end_date: portfolioData.setting.endDate!,
            rebalance_frequency: portfolioData.setting.rebalanceFrequency,
          },
          create: {
            portfolio_id: portfolio.id,
            start_date: portfolioData.setting.startDate!,
            end_date: portfolioData.setting.endDate!,
            rebalance_frequency: portfolioData.setting.rebalanceFrequency,
          },
        });

        await tx.portfolio_assets.deleteMany({
          where: { portfolio_id: portfolio.id },
        });

        const assets = await tx.portfolio_assets.createMany({
          data: portfolioData.assets.map((asset) => ({
            portfolio_id: portfolio.id,
            symbol: asset.symbol,
            weight: asset.weight,
            shares: asset.shares,
          })),
        });

        const metrics = await tx.portfolio_metrics.upsert({
          where: { portfolio_id: portfolio.id },

          update: {
            total_return: portfolioData.metrics.totalReturn,
            cagr: portfolioData.metrics.cagr,
            mdd: portfolioData.metrics.mdd,
            volatility: portfolioData.metrics.volatility,
            sharp_ratio: portfolioData.metrics.sharpRatio,
            final_amount: portfolioData.metrics.finalAmount,
          },
          create: {
            portfolio_id: portfolio.id,
            total_return: portfolioData.metrics.totalReturn,
            cagr: portfolioData.metrics.cagr,
            mdd: portfolioData.metrics.mdd,
            volatility: portfolioData.metrics.volatility,
            sharp_ratio: portfolioData.metrics.sharpRatio,
            final_amount: portfolioData.metrics.finalAmount,
          },
        });

        return {
          portfolio,
          setting,
          assets,
          metrics,
        };
      });

      return createPortfolioReqDTO({ ...portfolioData });
    } catch (error) {
      console.error("portfolio service save error", error);

      return null;
    }
  }

  async getPortfolioById(id: string) {
    try {
      const portfolio = await this.prisma.portfolios.findUnique({
        where: { id },
        include: {
          portfolio_assets: true,
          portfolio_settings: true,
          portfolio_metrics: true,
        },
      });

      console.log("portfolio is deleted", portfolio);

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
          }),
        ),
        setting: createPortfolioSettingDTO({
          id: portfolio.portfolio_settings.id,
          portfolio_id: portfolio.portfolio_settings.portfolio_id,
          startDate: portfolio.portfolio_settings.start_date,
          endDate: portfolio.portfolio_settings.end_date,
          rebalanceFrequency: portfolio.portfolio_settings
            .rebalance_frequency as RebalanceFrequency,
          created: portfolio.portfolio_settings.created,
          updated: portfolio.portfolio_settings.updated,
        }),
        metrics: createPortfolioMetricsDTO({
          id: portfolio.portfolio_metrics.id,
          portfolio_id: portfolio.portfolio_metrics.portfolio_id,
          totalReturn: portfolio.portfolio_metrics.total_return.toNumber(),
          cagr: portfolio.portfolio_metrics.cagr.toNumber(),
          mdd: portfolio.portfolio_metrics.mdd.toNumber(),
          volatility: portfolio.portfolio_metrics.volatility.toNumber(),
          sharpRatio: portfolio.portfolio_metrics.sharp_ratio.toNumber(),
          finalAmount: portfolio.portfolio_metrics.final_amount.toNumber(),
          created: portfolio.portfolio_metrics.created_at,
          updated: portfolio.portfolio_metrics.updated_at,
        }),
      });
    } catch (error) {
      console.error("portfolio service get error", error);

      return null;
    }
  }

  async deletePortfolio(portfolioId: string): Promise<PortfolioDTO | null> {
    console.log("portfolioId", portfolioId);

    try {
      const portfolioWithRelations = await this.prisma.portfolios.findUnique({
        where: { id: portfolioId },
        include: {
          portfolio_assets: true,
          portfolio_settings: true,
          portfolio_metrics: true,
        },
      });

      const portfolio = await this.prisma.portfolios.delete({
        where: {
          id: portfolioId,
        },
      });

      console.log("portfolio is deleted", portfolio);

      return createPortfolioDTO({
        id: portfolioWithRelations.id,
        name: portfolioWithRelations.name,
        initialAmount: portfolioWithRelations.initial_amount.toNumber(),
        created: portfolioWithRelations.created,
        updated: portfolioWithRelations.updated,
        description: portfolioWithRelations.description || "",
        user_id: portfolioWithRelations.user_id || "",
        assets: portfolioWithRelations.portfolio_assets.map((asset) =>
          createPortfolioAssetDTO({
            id: asset.id,
            portfolio_id: asset.portfolio_id,
            symbol: asset.symbol,
            weight: asset.weight.toNumber(),
            shares: asset.shares?.toNumber() || 0,
            created: asset.created,
            updated: asset.updated,
          }),
        ),
        setting: createPortfolioSettingDTO({
          id: portfolioWithRelations.portfolio_settings.id,
          portfolio_id: portfolioWithRelations.portfolio_settings.portfolio_id,
          startDate: portfolioWithRelations.portfolio_settings.start_date,
          endDate: portfolioWithRelations.portfolio_settings.end_date,
          rebalanceFrequency: portfolioWithRelations.portfolio_settings
            .rebalance_frequency as RebalanceFrequency,
          created: portfolioWithRelations.portfolio_settings.created,
          updated: portfolioWithRelations.portfolio_settings.updated,
        }),
        metrics: createPortfolioMetricsDTO({
          id: portfolioWithRelations.portfolio_metrics.id,
          portfolio_id: portfolioWithRelations.portfolio_metrics.portfolio_id,
          totalReturn:
            portfolioWithRelations.portfolio_metrics.total_return.toNumber(),
          cagr: portfolioWithRelations.portfolio_metrics.cagr.toNumber(),
          mdd: portfolioWithRelations.portfolio_metrics.mdd.toNumber(),
          volatility:
            portfolioWithRelations.portfolio_metrics.volatility.toNumber(),
          sharpRatio:
            portfolioWithRelations.portfolio_metrics.sharp_ratio.toNumber(),
          finalAmount:
            portfolioWithRelations.portfolio_metrics.final_amount.toNumber(),
          created: portfolioWithRelations.portfolio_metrics.created_at,
          updated: portfolioWithRelations.portfolio_metrics.updated_at,
        }),
      });
    } catch (error) {
      console.error("portfolio service delete error", error);

      return null;
    }
  }
}
