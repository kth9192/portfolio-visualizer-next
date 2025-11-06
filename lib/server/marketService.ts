import { createETFHolding, ETFHolding } from "@/app/interface/dto/etf";
import {
  createMarketRanking,
  createMarketAnalyzeData,
  MarketRanking,
  createMarketTradingValueTrend,
  MarketTradingValueTrend,
} from "@/app/interface/dto/market";
import { PrismaClient } from "@prisma/client";
import { format, subDays, subYears } from "date-fns";
import { tr } from "date-fns/locale";

export class MarketService {
  private prisma: PrismaClient;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient || new PrismaClient();
  }

  async getUsStockRanking(date = new Date()): Promise<MarketRanking[]> {
    const result = await this.prisma.analyze_ranking.findMany({
      where: { snapshot_date: subDays(date, 1) },
    });

    const prevResult = await this.prisma.analyze_ranking.findMany({
      where: { snapshot_date: subDays(date, 2) },
    });

    return result.map((item) =>
      createMarketRanking({
        id: Number(item.id),
        symbol: item.symbol,
        shortName: item.short_name,
        marketCap: Number(item.market_cap),
        regularMarketPrice: Number(item.regular_market_price),
        regularMarketVolume: Number(item.regular_market_volume),
        regularTradingValue: Number(item.regular_trading_value),
        rank: Number(item.rank),
        snapshotDate: item.snapshot_date,
        createdAt: item.created_at,
        logoUrl: item.logo_url,
        change: prevResult.find((prev) => prev.symbol === item.symbol)
          ? Number(item.rank) -
            Number(prevResult.find((prev) => prev.symbol === item.symbol).rank)
          : 0,
        isNew: !prevResult.find((prev) => prev.symbol === item.symbol),
      })
    );
  }

  async getTradingVolumeTrending(
    symbols: string[]
  ): Promise<MarketTradingValueTrend[]> {
    const startDate = format(subYears(new Date(), 2), "yyyy-MM-dd");
    const endDate = format(subDays(new Date(), 1), "yyyy-MM-dd");

    const names = await this.prisma.analyze_ranking.findMany({
      where: {
        snapshot_date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      select: {
        short_name: true,
        symbol: true,
      },
    });

    const rawData = await this.prisma.analyze_data.findMany({
      where: {
        symbol: { in: symbols },
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      select: {
        symbol: true,
        date: true,
        close: true,
        trading_value: true,
      },
      orderBy: [{ symbol: "asc" }, { date: "asc" }],
    });

    const metricsMap = new Map<string, any[]>();

    rawData.forEach((item) => {
      if (!metricsMap.has(item.symbol)) {
        metricsMap.set(item.symbol, []);
      }
      metricsMap.get(item.symbol)!.push(item);
    });

    const results = Array.from(metricsMap.entries()).map(([symbol, data]) => {
      const sortedData = data.sort(
        (pre, post) =>
          new Date(pre.date).getTime() - new Date(post.date).getTime()
      );

      const baseData = sortedData.slice(0, 30);
      const recentData = sortedData.slice(-30);

      //수익률
      const startPrice = Number(sortedData[0].close);
      const endPrice = Number(sortedData[sortedData.length - 1].close);
      const totalReturn2Y = ((endPrice - startPrice) / startPrice) * 100;

      //거래대금 증가율
      const recentAvg =
        recentData.reduce((acc, item) => acc + Number(item.trading_value), 0) /
        recentData.length;
      const baseAvg =
        baseData.reduce((acc, item) => acc + Number(item.trading_value), 0) /
        baseData.length;
      const tradingValueGrowth2Y = ((recentAvg - baseAvg) / baseAvg) * 100;

      // 수익률/거래대금 증가율
      // > 1.0: 관심대비 가격 상승
      // < 1.0: 관심대비 덜 오른 가격
      const returnValueRatio =
        tradingValueGrowth2Y !== 0 ? totalReturn2Y / tradingValueGrowth2Y : 0;

      return createMarketTradingValueTrend({
        symbol,
        shortName: names.find((rawItem) => rawItem.symbol === symbol)
          ?.short_name,
        totalReturn2Y: Number(totalReturn2Y.toFixed(2)),
        tradingValueGrowth2Y: Number(tradingValueGrowth2Y.toFixed(2)),
        returnValueRatio: Number(returnValueRatio.toFixed(2)),
      });
    });

    return results;
  }
}
