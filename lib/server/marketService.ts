import { createETFHolding, ETFHolding } from "@/app/interface/dto/etf";
import {
  createMarketRanking,
  createMarketAnalyzeData,
  MarketRanking,
  createMarketTradingValueTrend,
  MarketTradingValueTrend,
  MarketRankingResponse,
} from "@/app/interface/dto/market";
import { PrismaClient } from "@/app/generated/prisma";
import { prisma } from "@/lib/prisma";
import { format, isWeekend, subDays, subYears } from "date-fns";
import { tr } from "date-fns/locale";
import { Decimal } from "@prisma/client-runtime-utils";

export class MarketService {
  private prisma: PrismaClient;

  private readonly US_MARKET_HOLIDAYS = [
    "2025-01-01",
    "2025-01-20",
    "2025-02-17",
    "2025-05-26",
    "2025-07-04",
    "2025-09-01",
    "2025-11-27",
    "2025-12-25",
  ];

  constructor() {
    this.prisma = prisma;
  }

  private isMarketClosed(date: Date): boolean {
    return (
      isWeekend(date) ||
      this.US_MARKET_HOLIDAYS.includes(format(date, "yyyy-MM-dd"))
    );
  }

  async getAvailableDate(targetDate: Date): Promise<Date> {
    const MAX_ATTEMPTS = 30;
    let currentDate = targetDate; // ✅ 바깥으로 이동
    let attempts = 0;

    while (attempts < MAX_ATTEMPTS) {
      // Step 1: 주말/공휴일 스킵
      while (this.isMarketClosed(currentDate)) {
        currentDate = subDays(currentDate, 1);
      }

      // Step 2: DB 데이터 확인
      const dataCount = await this.prisma.analyze_ranking.count({
        where: { snapshot_date: currentDate },
      });

      if (dataCount > 0) {
        console.log(`✅ Data found: ${format(currentDate, "yyyy-MM-dd")}`);
        return currentDate;
      }

      // Step 3: 데이터 없으면 하루 전으로
      console.log(`⚠️ No data: ${format(currentDate, "yyyy-MM-dd")}`);
      currentDate = subDays(currentDate, 1);
      attempts++;
    }

    // ✅ 반환값 없을 때 에러 (명시적 처리)
    throw new Error(
      `No market data found within ${MAX_ATTEMPTS} days from ${format(
        targetDate,
        "yyyy-MM-dd",
      )}`,
    );
  }

  async getUsStockRanking(date = new Date()): Promise<MarketRankingResponse> {
    const result = await this.prisma.analyze_ranking.findMany({
      where: { snapshot_date: await this.getAvailableDate(date) },
    });

    const prevResult = await this.prisma.analyze_ranking.findMany({
      where: {
        snapshot_date: await this.getAvailableDate(
          subDays(await this.getAvailableDate(date), 1),
        ),
      },
    });

    console.log("date", await this.getAvailableDate(date));

    return {
      current: result.map((item) =>
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
              Number(
                prevResult.find((prev) => prev.symbol === item.symbol).rank,
              )
            : 0,
          isNew: !prevResult.find((prev) => prev.symbol === item.symbol),
        }),
      ),
      yesterday: prevResult.map((item) =>
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
              Number(
                prevResult.find((prev) => prev.symbol === item.symbol).rank,
              )
            : 0,
          isNew: !prevResult.find((prev) => prev.symbol === item.symbol),
        }),
      ),
    };
  }

  async getTradingVolumeTrending(
    symbols: string[],
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
        adjclose: true,
        trading_value: true,
      },
      orderBy: [{ symbol: "asc" }, { date: "asc" }],
    });

    type MarketDataPoint = {
      symbol: string;
      date: Date;
      close: Decimal;
      adjclose: Decimal;
      trading_value: Decimal;
    };

    const metricsMap = new Map<string, MarketDataPoint[]>();

    rawData.forEach((item) => {
      if (!metricsMap.has(item.symbol)) {
        metricsMap.set(item.symbol, []);
      }
      metricsMap.get(item.symbol)!.push(item);
    });

    const results = Array.from(metricsMap.entries()).map(([symbol, data]) => {
      const sortedData = data.sort(
        (pre, post) =>
          new Date(pre.date).getTime() - new Date(post.date).getTime(),
      );
      const baseData = sortedData.slice(0, 30);
      const recentData = sortedData.slice(-30);

      //수익률
      const startPrice = Number(sortedData[0].adjclose);
      const endPrice = Number(sortedData[sortedData.length - 1].adjclose);
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
