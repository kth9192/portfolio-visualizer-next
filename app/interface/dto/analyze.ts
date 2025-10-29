export interface AnalyzeRanking {
  id: number;
  symbol: string;
  shortName: string;
  marketCap: number;
  regualrMarketPrice: number;
  regularMarketVolume: number;
  regularTradingValue: number;
  rank: number;
  snapshotDate: Date;
  createdAt: Date;
  logoUrl?: string;
}

export const createAnalyzeRanking = (data: AnalyzeRanking) => {
  return {
    id: data.id,
    symbol: data.symbol,
    shortName: data.shortName,
    marketCap: data.marketCap,
    regualrMarketPrice: data.regualrMarketPrice,
    regularMarketVolume: data.regularMarketVolume,
    regularTradingValue: data.regularTradingValue,
    rank: data.rank,
    snapshotDate: data.snapshotDate,
    createdAt: data.createdAt,
    logoUrl: data.logoUrl,
  };
};

export interface AnalyzeData {
  id: number;
  symbol: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  createdAt: Date;
  updatedAt: Date;
}

export const createAnalyzeData = (data: AnalyzeData) => {
  return {
    id: data.id,
    symbol: data.symbol,
    open: data.open,
    high: data.high,
    low: data.low,
    close: data.close,
    volume: data.volume,
    tradingVolume: data.volume,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
};
