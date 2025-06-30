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
  sector?: string;
  industry?: string;
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
    sector: data.sector,
    industry: data.industry,
  };
};

// 일일 가격 데이터 타입 정의
export interface ETFPriceDTO {
  id: number;
  symbol: string; // 티커
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adj_close: number;
  dividend?: number;
}

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

export interface ETFTrendDTO{  
  symbol:string;
  prices:ETFPriceDTO[]
}