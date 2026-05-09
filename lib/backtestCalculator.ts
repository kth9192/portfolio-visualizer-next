import {
  BacktestingRes,
  MonthlyBacktestAsset,
  MonthlyPriceData,
} from "@/app/interface/dto/backtesting";
import { ETFPriceMonthlyDTO, ETFTimeSeriesDTO } from "@/app/interface/dto/etf";
import {
  PortfolioAssetPackage,
  PortfolioAssetReqDTO,
} from "@/app/interface/dto/portfolio";
import { RebalanceFrequency } from "@/app/interface/enum/rebanalceFrequency";
import { format } from "date-fns";

export const createInitialPortfolio = (
  assets: PortfolioAssetReqDTO[],
  initialAmount: number,
  priceMap: Map<string, number[]>,
) => {
  const initialShares = new Map<string, number>();

  assets.forEach((asset) => {
    const initialPrice = priceMap.get(asset.symbol)?.[0] ?? 0;
    if (initialPrice === 0) {
      console.error(`${asset.symbol}의 초기 가격 데이터가 없습니다.`);
      return;
    }

    const targetAmount = asset.weight * initialAmount;
    const shares = Math.floor(targetAmount / initialPrice);
    initialShares.set(asset.symbol, shares);
  });

  const initialUsedAmount = assets.reduce((sum, asset) => {
    const shares = initialShares.get(asset.symbol) ?? 0;
    const price = priceMap.get(asset.symbol)?.[0] ?? 0;
    return sum + shares * price;
  }, 0);

  return {
    initialShares,
    remainingCash: initialAmount - initialUsedAmount,
  };
};

export const createInitialMonthlyPortfolio = (
  assets: PortfolioAssetReqDTO[],
  initialAmount: number,
  priceMap: MonthlyPriceData,
  firstMonth: string,
) => {
  const initialShares = new Map<string, number>();
  const firstMonthPrices = priceMap[firstMonth];

  console.log("test", firstMonthPrices);

  if (!firstMonthPrices) {
    throw new Error(`${firstMonth}의 가격 데이터가 없습니다.`);
  }

  assets.forEach((asset) => {
    const initialPrice = firstMonthPrices[asset.symbol] ?? 0;

    if (initialPrice === 0) {
      console.error(`${asset.symbol}의 초기 가격 데이터가 없습니다.`);
      return;
    }

    const targetAmount = asset.weight * initialAmount;
    const shares = Math.floor(targetAmount / initialPrice);
    initialShares.set(asset.symbol, shares);
  });

  const initialUsedAmount = assets.reduce((sum, asset) => {
    const shares = initialShares.get(asset.symbol) ?? 0;
    const price = firstMonthPrices[asset.symbol] ?? 0;
    return sum + shares * price;
  }, 0);

  return {
    initialShares,
    remainingCash: initialAmount - initialUsedAmount,
  };
};

export const createPriceMap = (
  priceInfos: BacktestingRes["priceInfos"],
  commonDatesSet: Set<string>,
) => {
  const priceMap = new Map<string, number[]>();
  priceInfos.forEach((priceInfo) => {
    priceMap.set(
      priceInfo.ticker,
      priceInfo.prices
        .filter((price) => commonDatesSet.has(format(price.date, "yyyy-MM-dd")))
        .map((item) => item.adj_close),
    );
  });
  return priceMap;
};

export const calculateRebalancing = (
  assets: PortfolioAssetReqDTO[],
  priceMap: Map<string, number[]>,
  currentShares: Map<string, number>,
  remainingCash: number,
  dayIdx: number,
) => {
  const totalPortfolioValue = calculatePortfolioValue(
    assets,
    priceMap,
    currentShares,
    remainingCash,
    dayIdx,
  );

  const newShares = calculateNewShares(
    assets,
    priceMap,
    totalPortfolioValue,
    dayIdx,
  );

  const totalUsedForRebalancing = calculateTotalUsedAmount(
    assets,
    newShares,
    priceMap,
    dayIdx,
  );

  const newRemainingCash = totalPortfolioValue - totalUsedForRebalancing;

  return {
    shares: newShares,
    cash: newRemainingCash,
  };
};

export const calculatePortfolioValue = (
  assets: PortfolioAssetReqDTO[],
  priceMap: Map<string, number[]>,
  currentShares: Map<string, number>,
  remainingCash: number,
  dayIdx: number,
) => {
  return (
    remainingCash +
    assets.reduce((total, asset) => {
      const assetShares = currentShares.get(asset.symbol) ?? 0;
      const currentPrice = priceMap.get(asset.symbol)?.[dayIdx] ?? 0;
      return total + assetShares * currentPrice;
    }, 0)
  );
};

export const calculateNewShares = (
  assets: PortfolioAssetReqDTO[],
  priceMap: Map<string, number[]>,
  totalPortfolioValue: number,
  dayIdx: number,
) => {
  const newShares = new Map<string, number>();

  assets.forEach((asset) => {
    const currentPrice = priceMap.get(asset.symbol)?.[dayIdx] ?? 0;
    const targetValue = totalPortfolioValue * asset.weight;
    const shares = Math.floor(targetValue / currentPrice);

    newShares.set(asset.symbol, shares);
  });

  return newShares;
};

export const calculateTotalUsedAmount = (
  assets: PortfolioAssetReqDTO[],
  shares: Map<string, number>,
  priceMap: Map<string, number[]>,
  dayIdx: number,
) => {
  return assets.reduce((total, asset) => {
    const assetShares = shares.get(asset.symbol) ?? 0;
    const currentPrice = priceMap.get(asset.symbol)?.[dayIdx] ?? 0;

    return total + assetShares * currentPrice;
  }, 0);
};

export const createMonthPriceMap = (
  etfPriceInfo: ETFPriceMonthlyDTO[],
): MonthlyPriceData => {
  const monthlyPriceMap: MonthlyPriceData = {};

  etfPriceInfo?.forEach((data) => {
    //날짜가 존재하지 않는다면
    if (!data.year_month || !data.symbol || data.adj_close <= 0) {
      console.warn(
        `데이터 에러: ${data.symbol} ${data.year_month} = ${data.close}`,
      );
      return;
    }

    if (!monthlyPriceMap[data.year_month]) {
      monthlyPriceMap[data.year_month] = {};
    }

    monthlyPriceMap[data.year_month][data.symbol] = data.adj_close;
  });

  return monthlyPriceMap;
};

export const getCommonMonths = (
  priceMap: MonthlyPriceData,
  assets: { symbol: string }[],
): string[] => {
  const symbols = assets.map((asset) => asset.symbol);

  return Object.keys(priceMap)
    .sort()
    .filter((month) => {
      const monthPrices = priceMap[month];
      if (!monthPrices) return false;

      //모든 티커가 해당 월에 존재하며 유효한 가격을 가지는가
      return symbols.every((symbol) => {
        const price = monthPrices[symbol];
        return price !== undefined && price > 0;
      });
    });
};

export const rebalancePortfolio = (
  assets: MonthlyBacktestAsset[],
  currentPortfolioValue: number,
  monthPrices: Record<string, number>,
) => {
  const currentShares = new Map<string, number>();
  //구성 자산에 대해
  assets.forEach((asset) => {
    //현재 포트폴리오 가치에 대해 비중만큼의 총액
    const targetAmount = asset.weight * currentPortfolioValue;
    //해당 월의 자산 가격
    const price = monthPrices[asset.symbol];

    //포트폴리오 가치로 다시 계산된 주식수량
    const newShares = targetAmount / price;
    currentShares.set(asset.symbol, newShares);
  });

  return currentShares;
};

export const rebalancePortfolioForChart = (
  portfolio: PortfolioAssetPackage,
  currentPortfolioValue: number,
  monthPrices: Record<string, number>,
) => {
  const currentShares = new Map<string, number>();
  //구성 자산에 대해
  portfolio.assets.forEach((asset) => {
    //현재 포트폴리오 가치에 대해 비중만큼의 총액
    const targetAmount = asset.weight * currentPortfolioValue;
    //해당 월의 자산 가격
    const price = monthPrices[asset.symbol];

    //포트폴리오 가치로 다시 계산된 주식수량
    const newShares = targetAmount / price;
    currentShares.set(asset.symbol, newShares);
  });

  return currentShares;
};

export const calculatePortfolioValueMonth = (
  assets: MonthlyBacktestAsset[],
  shares: Map<string, number>,
  monthPrices: Record<string, number>,
  remainingCash: number = 0,
): number => {
  const assetValue = assets.reduce((total, asset) => {
    const shareCount = shares.get(asset.symbol) ?? 0;
    const price = monthPrices[asset.symbol] ?? 0;
    return total + shareCount * price;
  }, 0);

  return assetValue + remainingCash;
};

export const checkRebalanceCondition = (
  yearMonth: string,
  index: number,
  rebalanceFrequency: RebalanceFrequency,
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

/**
 * 주가의 일간 수익률을 계산
 *
 * 어제와 오늘 사이에 얼마만큼의 변화가 있었는지
 * @param prices 주가 데이터
 * @returns 일간 수익률 배열
 *
 */
export const calculateDailyReturns = (prices: number[]): number[] => {
  return prices.map((price, idx) => {
    if (idx === 0) return 0;
    return (price - prices[idx - 1]) / prices[idx - 1];
  });
};

/**
 * 일간 수익률을 퍼센트로 변환
 *
 * @param dailyReturns 일간 수익률 배열
 * @returns 퍼센트로 변환된 일간 수익률 배열
 */
export const calculateDailyReturnsPercent = (
  dailyReturns: number[],
): string[] => {
  return dailyReturns.map((price) => `${(price * 100).toFixed(2)}%`);
};

/**
 * 기간 동안의 일간 수익률의 평균 계산
 *
 * @param dailyReturns 일간 수익률 배열
 * @returns 일간 수익률의 평균
 */
export const calculateDailyAverageReturn = (dailyReturns: number[]): number => {
  return dailyReturns.reduce((acc, val) => acc + val, 0) / dailyReturns.length;
};

export const calculateVariance = (dailyReturns: number[]) => {
  const avg = calculateDailyAverageReturn(dailyReturns);
  return (
    dailyReturns.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) /
    dailyReturns.length
  );
};

/**
 * 연평균 성장률 계산
 *
 * cagr = (endVal / startVal)^(1/years) - 1
 * cagr = 성장배율을 연간에 걸쳐 평균하게 만든 값에 - 1을 해서 성장률만 표기하기 ex) 1.20 -1 = 20%의 성장률
 *
 * @param startVal 시작값
 * @param endVal 종료값
 * @param years 기간
 */

export const calculateCAGR = (
  startVal: number,
  endVal: number,
  years: number,
): number => {
  if (startVal <= 0 || endVal <= 0 || years <= 0) return 0;

  return Math.pow(endVal / startVal, 1 / years) - 1;
};

/**
 * 누적 수익률
 * 원금 *= (1 + 수익률) -> 원금에서의 총 수익률의 누적 변화
 *
 * @param returns 일별 수익률
 * @returns 누적 수익률
 */
export const calculateCumulativeReturn = (returns: number[]) => {
  const cumulative: number[] = [];
  let cumulativeVal = 1;

  for (let i = 0; i < returns.length; i++) {
    // 누적 배율 추척
    cumulativeVal *= 1 + returns[i];
    // 누적 수익률 = 누적배율 -1
    cumulative[i] = cumulativeVal - 1;

    return cumulative;
  }
};

/**
 * maximum drawdown 최고점에서 최저점까지 떨어진 최대 손실폭
 *
 * MDD = 현재값 - 고점 / 고점 * 100
 */

export const calculatMaximumDrawdown = (prices: number[]) => {
  let peak = prices[0];
  let mdd = 0;

  for (const price of prices) {
    peak = Math.max(peak, price);

    mdd = Math.min(mdd, (price - peak) / peak);
  }

  return mdd;
};

export const getRebalanceDates = (
  tradeDates: Date[],
  startDate: Date,
  endDate: Date,
  frequency: RebalanceFrequency,
) => {
  const dates: Date[] = [];
  const current = new Date(startDate);

  dates.push(new Date(current));

  const startYear = startDate.getFullYear();
  const endYear = endDate.getFullYear();

  for (let year = startYear; year <= endYear; year++) {
    let targetDates: Date[] = [];

    switch (frequency) {
      case "monthly":
        for (let month = 0; month < 12; month++) {
          targetDates.push(new Date(year, month, 1));
        }
        break;

      case "quarterly":
        targetDates = [
          new Date(year, 0, 1), //1월
          new Date(year, 3, 1), //4월
          new Date(year, 6, 1), //7월
          new Date(year, 9, 1), //10월
        ];
        break;

      case "semiannually":
        targetDates = [new Date(year, 0, 1), new Date(year, 6, 1)];
        break;

      case "annually":
        targetDates = [new Date(year, 0, 1)];
        break;
    }

    tradeDates.forEach((date) => {
      //연도 범위 내에 있어야만 추가가능
      if (date >= startDate && date < endDate) {
        //실제 데이터 존재일에 있다면 바로추가
        if (
          targetDates.find(
            (targetDate) =>
              date.getFullYear() === targetDate.getFullYear() &&
              date.getMonth() === targetDate.getMonth(),
          )
        ) {
          dates.push(date);
        }
      }
    });
  }

  return [...new Set(dates.map((date) => date.getTime()))].map(
    (date) => new Date(date),
  );
};

export const getCommonDates = (pricesInfo: ETFTimeSeriesDTO[]): string[] => {
  const tmpMap = new Map<string, number>();
  const count = pricesInfo.length;

  pricesInfo.forEach((priceInfo) => {
    priceInfo.prices.forEach((price) => {
      const indexDate = new Date(price.date).toISOString().split("T")[0];
      tmpMap.set(indexDate, (tmpMap.get(indexDate) ?? 0) + 1);
    });
  });

  // reduce로 한 번에 처리
  return Array.from(tmpMap.entries())
    .reduce<string[]>((acc, [date, val]) => {
      if (val === count) acc.push(date);
      return acc;
    }, [])
    .sort();
};

function getPerETFMonthlyReturns(
  priceMap: Record<string, Record<string, number>>,
  symbol: string,
): number[] {
  const sortedMonths = Object.keys(priceMap).sort();
  const returns: number[] = [];

  for (let i = 1; i < sortedMonths.length; i++) {
    const prevMonth = sortedMonths[i - 1][symbol];
    const currentMonth = sortedMonths[i][symbol];

    if (prevMonth && currentMonth && prevMonth > 0) {
      returns.push((currentMonth - prevMonth) / prevMonth);
    }
  }

  return returns;
}
