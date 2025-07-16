import { RebalanceFrequency } from "../enum/rebanalceFrequency";
import { RiskType } from "../enum/riskType";
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
    sectors: data.sectors,
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
  initialAmount: number;
  created: Date;
  updated: Date;
  description?: string;
  user_id?: string;
  assets: PortfolioAssetDTO[];
  setting: PortfolioSettingDTO;
}

export const createPortfolioDTO = (portfolioData: PortfolioDTO) => {
  return {
    id: portfolioData.id,
    name: portfolioData.name,
    initialAmount: portfolioData.initialAmount,
    created: portfolioData.created,
    updated: portfolioData.updated,
    description: portfolioData.description,
    user_id: portfolioData.user_id,
    assets: portfolioData.assets,
    setting: portfolioData.setting,
  };
};

export interface PortfolioAssetDTO {
  id: string;
  portfolio_id: string;
  symbol: string;
  weight: number;
  created: Date;
  updated: Date;
  shares: number;
}

export const createPortfolioAssetDTO = (
  portfolioAssetData: PortfolioAssetDTO
) => {
  return {
    id: portfolioAssetData.id,
    portfolio_id: portfolioAssetData.portfolio_id,
    symbol: portfolioAssetData.symbol,
    weight: portfolioAssetData.weight,
    created: portfolioAssetData.created,
    updated: portfolioAssetData.updated,
    shares: portfolioAssetData.shares,
  };
};

export interface PortfolioSettingDTO {
  id: string;
  portfolio_id: string;
  startDate: Date;
  endDate: Date;
  rebalanceFrequency: RebalanceFrequency;
  created: Date;
  updated: Date;
}

export const createPortfolioSettingDTO = (
  portfolioSettingData: PortfolioSettingDTO
) => {
  return {
    id: portfolioSettingData.id,
    portfolio_id: portfolioSettingData.portfolio_id,
    startDate: portfolioSettingData.startDate,
    endDate: portfolioSettingData.endDate,
    rebalanceFrequency: portfolioSettingData.rebalanceFrequency,
    created: portfolioSettingData.created,
    updated: portfolioSettingData.updated,
  };
};

export interface PortfolioSettingCreateDTO {
  startDate: Date;
  endDate: Date;
  rebalanceFrequency: RebalanceFrequency;
}

export interface PortfolioCreateDTO {
  name: string;
  initialAmount: number;
  description?: string;
  user_id?: string;
  rebalanceFrequency: RebalanceFrequency;
  assets: PortfolioAssetReqDTO[];
  setting: PortfolioSettingCreateDTO;
}

export const createPortfolioCreateDTO = (portfolioData: PortfolioCreateDTO) => {
  return {
    name: portfolioData.name,
    initialAmount: portfolioData.initialAmount,
    description: portfolioData.description,
    user_id: portfolioData.user_id,
    rebalanceFrequency: portfolioData.rebalanceFrequency,
    assets: portfolioData.assets,
    setting: portfolioData.setting,
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

export interface PortfolioPreset {
  name: string;
  description: string;
  riskType: RiskType;
  rebalanceFrequency: RebalanceFrequency;
  assets: PortfolioAssetReqDTO[];
}

export interface PortfolioAssetPackage {
  name:string;
  assets: PortfolioAssetReqDTO[];
  rebalanceFrequency: RebalanceFrequency;
}

export const createPortfolioAssetPackage = (data: PortfolioAssetPackage) => {
  return {
    name: data.name,
    assets: data.assets,
    rebalanceFrequency: data.rebalanceFrequency,
  };
};