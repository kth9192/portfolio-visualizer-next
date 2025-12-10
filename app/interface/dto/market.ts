import { AnalyzeRanking } from "./analyze";

export interface MarketRankingResponse {
  current: MarketRanking[];
  yesterday: MarketRanking[];
}

export interface MarketRanking extends AnalyzeRanking {
  change: number;
  isNew?: boolean;
}

export const createMarketRanking = (data: MarketRanking): MarketRanking => ({
  ...data,
  change: data.change,
  isNew: data.isNew,
});

export interface MarketAnalyzeData {
  id: number;
  close: number;
  date: Date;
  high: number;
  low: number;
  open: number;
  symbol: string;
  tradingValue: number;
  createdAt: Date;
  updatedAt: Date;
  volume: number;
}

export const createMarketAnalyzeData = (
  data: MarketAnalyzeData
): MarketAnalyzeData => ({ ...data });

export interface MarketTradingValueTrend {
  symbol: string;
  shortName: string;
  totalReturn2Y: number;
  tradingValueGrowth2Y: number;
  returnValueRatio: number;
}

export const createMarketTradingValueTrend = (
  data: MarketTradingValueTrend
): MarketTradingValueTrend => ({ ...data });

export interface MarketTrending extends MarketTradingValueTrend {
  logoUrl: string;
  shortName: string;
}

export const createMarketTrending = (data: MarketTrending): MarketTrending => ({
  ...data,
});
