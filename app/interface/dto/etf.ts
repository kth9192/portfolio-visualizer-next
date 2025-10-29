// ETF 기본 정보 타입 정의
export interface ETFInfoDTO {
  //기본 정보
  symbol: string; //티커
  shortName: string;
  longName: string;
  quoteType: string;
  exchange: string;
  currency: string;
  market?: string;
  industry?: string;
  holdings?: ETFHolding[];
  sectors?: ETFSector[];
}

export const createETFInfoDTO = (data: ETFInfoDTO): ETFInfoDTO => {
  return {
    symbol: data.symbol,
    shortName: data.shortName,
    longName: data.longName,
    quoteType: data.quoteType,
    exchange: data.exchange,
    currency: data.currency,
    market: data.market,
    industry: data.industry,
    holdings: data.holdings,
    sectors: data.sectors,
  };
};

export interface ETFPriceDTOBase {
  symbol: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adj_close: number;
  dividend?: number;
}

// 일일 가격 데이터 타입 정의
export interface ETFPriceDTO extends ETFPriceDTOBase {
  date: Date;
}

export interface ETFPriceMonthlyDTO extends ETFPriceDTOBase {
  year_month: string;
}

export const createETFPriceMonthlyDTO = (
  data: ETFPriceMonthlyDTO
): ETFPriceMonthlyDTO => {
  return {
    symbol: data.symbol,
    year_month: data.year_month,
    open: data.open,
    high: data.high,
    low: data.low,
    close: data.close,
    volume: data.volume,
    adj_close: data.adj_close,
    dividend: data.dividend,
  };
};

// 시계열 가격 데이터 타입 정의
export interface ETFTimeSeriesDTO {
  ticker: string;
  prices: ETFPriceDTO[];
  startDate: Date;
  endDate: Date;
}

// ETF 검색 결과 타입 정의
export interface ETFSearchResultDTO {
  items: ETFInfoDTO[];
  total: number;
}

export interface ETFTrendDTO {
  symbol: string;
  prices: ETFPriceDTO[];
}

export interface ETFDetail {
  symbol: string; // 티커
  holdings: ETFHolding[];
  sector: ETFSector[];
}

export const createETFDetail = (data: ETFDetail): ETFDetail => {
  return {
    symbol: data.symbol,
    holdings: data.holdings,
    sector: data.sector,
  };
};

export interface ETFHolding {
  name: string;
  symbol: string;
  weight: number;
}

export const createETFHolding = (data: ETFHolding): ETFHolding => {
  return {
    name: data.name,
    symbol: data.symbol,
    weight: data.weight,
  };
};

export interface ETFSector {
  sectorName: string;
  sectorWeight: number;
}

export const createETFSector = (data: ETFSector): ETFSector => {
  return {
    sectorName: data.sectorName,
    sectorWeight: data.sectorWeight,
  };
};

export interface ETFDetailDTO {
  symbol: string;
  holdings: ETFHolding[];
  sector: ETFSector[];
}
