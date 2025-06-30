import {
  createETFInfoDTO,
  ETFTrendDTO,
  type ETFInfoDTO,
  type ETFPriceDTO,
  type ETFTimeSeriesDTO,
} from "@/app/interface/dto/etf";
import { differenceInYears } from "date-fns";
import { PrismaClient, type etf_infos } from "@prisma/client";

export class ETFService {
  private static DEFAULT_TICKERS = ["VOO", "QQQ", "VTI", "BND", "VXUS"];

  private prisma: PrismaClient;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient || new PrismaClient();
  }

  async getETFList(): Promise<ETFInfoDTO[]> {
    try {
      const etfs: etf_infos[] = await this.prisma.etf_infos.findMany({
        orderBy: {
          symbol: "asc",
        },
      });

      console.log("etfs", etfs);

      return etfs.map((item) =>
        createETFInfoDTO({
          ...item,
          shortName: item.short_name || "",
          longName: item.long_name || "",
          quoteType: item.quote_type || "",
          exchange: item.exchange || "",
          currency: item.currency || "",
        })
      );
    } catch (error) {
      console.error("getETFList error", error);

      return [];
    }
  }

  async getETFHistory(
    symbols: string[],
    startDate: Date,
    endDate: Date
  ): Promise<ETFTimeSeriesDTO[]> {
    try {
      const pricesData = await this.prisma.etf_prices.findMany({
        where: {
          symbol: {
            in: symbols,
          },
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: [{ symbol: "asc" }, { date: "asc" }],
      });

      const groupedData = pricesData.reduce((acc, price) => {
        if (!acc[price.symbol]) {
          acc[price.symbol] = [];
        }
        acc[price.symbol].push({
          id: Number(price.id),
          symbol: price.symbol,
          date: price.date,
          open: Number(price.open || 0),
          high: Number(price.high || 0),
          low: Number(price.low || 0),
          close: Number(price.close),
          adj_close: Number(price.adj_close || price.close),
          volume: Number(price.volume || 0),
          dividend: Number(price.dividend || 0),
        });
        return acc;
      }, {} as Record<string, ETFPriceDTO[]>);

      // ETFTimeSeriesDTO 형태로 변환
      return Object.entries(groupedData).map(([symbol, prices]) => ({
        ticker: symbol,
        prices,
        startDate,
        endDate,
      }));
    } catch (error) {
      console.error("ETF 히스토리 조회 실패:", error);
      throw new Error("ETF 가격 데이터를 가져올 수 없습니다.");
    }
  }

  async getTrends(): Promise<ETFPriceDTO[]> {
    try {
      const result = await Promise.all(
        ETFService.DEFAULT_TICKERS.map(async (ticker) => {
          const prices = await this.prisma.etf_prices.findMany({
            where: {
              symbol: ticker,
            },
            orderBy: [{ date: "desc" }],
            take: 2,
          });

          return prices;
        })
      );

      const test = result.flat();

     return test.map((item) => ({
       
        id: Number(item.id),
        symbol: item.symbol,
        date: item.date,
        open: Number(item.open || 0),
        high: Number(item.high || 0),
        low: Number(item.low || 0),
        close: Number(item.close),
        adj_close: Number(item.adj_close || item.close),
        volume: Number(item.volume || 0),
        dividend: Number(item.dividend || 0),
     }));
    } catch (error) {
      console.error("getTrends error", error);

      return [];
    }
  }
}
