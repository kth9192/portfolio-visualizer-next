import { RebalanceFrequency } from "../enum/rebanalceFrequency";
import { BacktestingSetting } from "./backtesting";
import { ETFInfoDTO } from "./etf";



export interface Portfolio {
  name: string;
  description?: string;
  amount: number;
  remainCash: number;
  assets: ETFAssetDTO[];
  setting: BacktestingSetting;
}

export const emptyPortfolio: Portfolio = {
  name: "",
  description: "",
  assets: [],
  amount: 10000,
  remainCash: 0,
  setting: {} as BacktestingSetting,
};

// 포트폴리오에서 사용할 ETF 자산 타입 정의
export interface ETFAssetDTO extends ETFInfoDTO {
  weight: number; // 0.0 ~ 1.0 사이의 값
  shares: number;
}

export const createETFAssetDTO = (
  data: ETFInfoDTO,
  weight: number,
  shares: number
): ETFAssetDTO => {
  return {
    symbol: data.symbol,
    shortName: data.shortName,
    longName: data.longName,
    quoteType: data.quoteType,
    exchange: data.exchange,
    currency: data.currency,
    market: data.market,
    sector: data.sector,
    industry: data.industry,
    weight: weight,
    shares: shares,
  };
};

export interface PortfolioSimulationData {
  date: Date;
  cumulativeReturn: number;
  cumulativeReturnsPercent: number;
  shares: Record<string, number>;
  dailyReturn: number;
  portfolioValue: number;
  cumulativeMultiplier: number;
}


export interface PortfolioDTO {
  id: string;
  name: string;
  initAmount: number;
  created: Date;
  updated: Date;
  description?: string;
  user_id?: string;
  assets: PortfolioAssetDTO[];
  setting: PortfolioSettingDTO;
}

export interface PortfolioAssetDTO {
  id: string;
  portfolioId: string;
  symbol: string;
  weight: number;
  created: Date;
  updated: Date;
  shares: number;
}

export interface PortfolioSettingDTO {
  id: string;
  portfolioId: string;
  startDate: Date;
  endDate: Date;
  rebalanceFrequency: RebalanceFrequency;
  created: Date;
  updated: Date;
}

export interface PortfolioSettingCreateDTO {
    startDate?: Date;
    endDate?: Date;
    rebalanceFrequency?: RebalanceFrequency;
}

export interface PortfolioCreateDTO {
  name: string;
  initAmount: number;
  description?: string;
  user_id?: string;
  rebalanceFrequency: RebalanceFrequency;
  assets: PortfolioAssetReqDTO[];
  setting:PortfolioSettingCreateDTO;
}

export const createPortfolioCreateDTO = (portfolioData: PortfolioCreateDTO) => {
  return {
    name: portfolioData.name,
    initAmount: portfolioData.initAmount,
    description: portfolioData.description,
    user_id: portfolioData.user_id,
    rebalanceFrequency: portfolioData.rebalanceFrequency,
    assets: portfolioData.assets,
    setting:portfolioData.setting,
  };
};

export interface PortfolioAssetReqDTO {
  symbol: string;
  weight: number;
  shares: number;
}

export const createPortfolioAssetReqDTO = (data: PortfolioAssetReqDTO) => {
  return {
    symbol: data.symbol,
    weight: data.weight,
    shares: data.shares,
  };
};
