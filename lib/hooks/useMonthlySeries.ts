import { ETFPriceMonthlyDTO } from "@/app/interface/dto/etf";
import { PortfolioAssetPackage } from "@/app/interface/dto/portfolio";
import { RebalanceFrequency } from "@/app/interface/enum/rebanalceFrequency";
import { format, startOfDay, subYears } from "date-fns";
import useGetBacktestingMonthlyData from "./query/useGetBacktestingMonthlyData";

interface useMonthlySeriesProps {
  portfolio: PortfolioAssetPackage[];
  startDate: Date;
  endDate: Date;
  rebalanceFrequency: RebalanceFrequency;
  initialAmount: number;
}

const makePriceMap = (etfPriceInfo: ETFPriceMonthlyDTO[]) => {
  const monthlyPriceMap = new Map<string, Map<string, number>>();

  etfPriceInfo.forEach((data) => {
    if (!monthlyPriceMap.has(data.year_month)) {
      monthlyPriceMap.set(data.year_month, new Map());
    }
    monthlyPriceMap.get(data.year_month)?.set(data.symbol, data.close);
  });

  return monthlyPriceMap;
};

const getCommonMonths = (
  priceMap: Map<string, Map<string, number>>,
  assets: { symbol: string }[]
): string[] => {
  const symbols = assets.map((asset) => asset.symbol);
  const commonMonths: string[] = [];

  // 날짜 순서로 정렬
  const sortedKeys = Array.from(priceMap.keys()).sort();

  for (const yearMonth of sortedKeys) {
    const monthPrices = priceMap.get(yearMonth);
    if (!monthPrices) continue;

    const hasAllSymbols = symbols.every((symbol) => 
      monthPrices.has(symbol) && monthPrices.get(symbol)! > 0
    );
    
    if (hasAllSymbols) {
      commonMonths.push(yearMonth);
    }
  }

  return commonMonths;
};

const calculateCumulative = (
  portfolio: PortfolioAssetPackage,
  priceMap: Map<string, Map<string, number>>,
  commonMonths: string[],
  initialAmount: number,
  rebalanceFrequency: RebalanceFrequency
) => {
  const result: {
    name: string;
    year_month: string;
    cumulativeReturn: number;
    cumulativeReturnsPercent: number;
    portfolio_value: number;
    monthlyReturn: number;
  }[] = [];

  if (commonMonths.length === 0) {
    console.warn('No common months found');
    return result;
  }

  const currentShares = new Map<string, number>();
  
  // 초기 주식 수량 계산
  const firstMonthPrices = priceMap.get(commonMonths[0]);
  if (!firstMonthPrices) {
    console.error('First month prices not found');
    return result;
  }

  // 초기 포트폴리오 구성
  portfolio.assets.forEach((asset) => {
    const price = firstMonthPrices.get(asset.symbol);
    if (!price || price <= 0) {
      console.error(`Invalid price for ${asset.symbol}: ${price}`);
      return;
    }
    
    const targetAmount = asset.weight * initialAmount;
    const shares = targetAmount / price;
    currentShares.set(asset.symbol, shares);
  });

  // 각 월별 계산
  commonMonths.forEach((yearMonth, idx) => {
    const monthPrices = priceMap.get(yearMonth);
    if (!monthPrices) return;

    // 리밸런싱 체크
    const isRebalanceMonth = checkRebalanceCondition(yearMonth, idx, rebalanceFrequency);

    if (isRebalanceMonth && idx > 0) {
      // 현재 포트폴리오 가치 계산
      let currentPortfolioValue = 0;
      portfolio.assets.forEach((asset) => {
        const shares = currentShares.get(asset.symbol) || 0;
        const price = monthPrices.get(asset.symbol) || 0;
        currentPortfolioValue += shares * price;
      });

      // 리밸런싱 실행
      rebalancePortfolio(portfolio, currentShares, currentPortfolioValue, monthPrices);
    }

    // 포트폴리오 가치 계산
    let portfolioValue = 0;
    portfolio.assets.forEach((asset) => {
      const shares = currentShares.get(asset.symbol) || 0;
      const price = monthPrices.get(asset.symbol) || 0;
      portfolioValue += shares * price;
    });

    // 수익률 계산
    const cumulativeReturn = (portfolioValue - initialAmount) / initialAmount;
    const cumulativeReturnsPercent = cumulativeReturn * 100;
    
    let monthlyReturn = 0;
    if (idx > 0 && result[idx - 1]) {
      const prevValue = result[idx - 1].portfolio_value;
      monthlyReturn = prevValue > 0 ? (portfolioValue - prevValue) / prevValue : 0;
    }

    result.push({
      name: portfolio.name,
      year_month: yearMonth,
      cumulativeReturn,
      portfolio_value: portfolioValue,
      cumulativeReturnsPercent,
      monthlyReturn,
    });
  });

  return result;
};

const checkRebalanceCondition = (
  yearMonth: string,
  index: number,
  rebalanceFrequency: RebalanceFrequency
): boolean => {
  if (index === 0) return false; // 첫 번째 월은 리밸런싱 하지 않음

  const [year, month] = yearMonth.split("-").map(Number);
  
  if (isNaN(year) || isNaN(month)) {
    console.error(`Invalid year_month format: ${yearMonth}`);
    return false;
  }

  switch (rebalanceFrequency) {
    case RebalanceFrequency.MONTHLY:
      return true;
    case RebalanceFrequency.QUARTERLY:
      return month % 3 === 0; // 3, 6, 9, 12월
    case RebalanceFrequency.SEMIANNUALLY:
      return month % 6 === 0; // 6, 12월
    case RebalanceFrequency.ANNUALLY:
      return month === 1; // 1월 (연 초)
    default:
      return false;
  }
};

const rebalancePortfolio = (
  portfolio: PortfolioAssetPackage,
  currentShares: Map<string, number>,
  currentPortfolioValue: number,
  monthPrices: Map<string, number>
) => {
  portfolio.assets.forEach((asset) => {
    const targetAmount = asset.weight * currentPortfolioValue;
    const price = monthPrices.get(asset.symbol);
    
    if (!price || price <= 0) {
      console.error(`Invalid price for rebalancing ${asset.symbol}: ${price}`);
      return;
    }
    
    const newShares = targetAmount / price;
    currentShares.set(asset.symbol, newShares);
  });
};

export const useMonthlySeries = ({
  portfolio,
  startDate,
  endDate,
  rebalanceFrequency,
  initialAmount,
}: useMonthlySeriesProps) => {
  const { data: backtestingMonthlyData } = useGetBacktestingMonthlyData({
    req: {
      ticker: portfolio
        .flatMap((portfolioInfo) =>
          portfolioInfo.assets.map((asset) => asset.symbol)
        ),
      startDate: startOfDay(subYears(new Date(), 3)),
      endDate: startOfDay(new Date()),
      rebalanceFrequency,
    },
  });

  if (!backtestingMonthlyData || backtestingMonthlyData.length === 0) {
    console.warn('No backtesting monthly data available');
    return [];
  }

  // 날짜 필터링 개선
  const filteredData = backtestingMonthlyData.filter((data) => {
    const [year, month] = data.year_month.split('-').map(Number);
    const dataDate = new Date(year, month - 1, 1); // month는 0-based
    return dataDate >= startDate && dataDate <= endDate;
  });

  if (filteredData.length === 0) {
    console.warn('No data after filtering by date range');
    return [];
  }

  const priceMap = makePriceMap(filteredData);
  
  const result = portfolio.map((portfolioInfo) => {
    const commonMonths = getCommonMonths(priceMap, portfolioInfo.assets);
    
    if (commonMonths.length === 0) {
      console.warn('No common months found for portfolio');
      return [];
    }

    return calculateCumulative(
      portfolioInfo,
      priceMap,
      commonMonths,
      initialAmount,
      rebalanceFrequency
    );
  });

  return result;
};