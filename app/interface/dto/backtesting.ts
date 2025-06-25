import { RebalanceFrequency } from "../enum/rebanalceFrequency";
import type { ETFTimeSeriesDTO } from "./etf";

export interface BacktestingReq {
  ticker: string[];
  startDate: Date | undefined;
  endDate: Date | undefined;
}

export interface BacktestingRes {
  priceInfos: ETFTimeSeriesDTO[];
  metrics: any;
}

export const createBacktestingRes = ({
  priceInfos,
  metrics,
}: {
  priceInfos: ETFTimeSeriesDTO[];
  metrics: any;
}): BacktestingRes => ({ priceInfos, metrics });

export interface BacktestingSetting {
  startDate: Date;
  endDate: Date;
  rebalanceFrequency: RebalanceFrequency;
  tradingCost: number;
}
