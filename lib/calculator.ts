import {
  closestIndexTo,
  closestTo,
  differenceInYears,
  format,
  parseISO,
  startOfDay,
} from "date-fns";
import { ko } from "date-fns/locale";
import { RebalanceFrequency } from "../app/interface/enum/rebanalceFrequency";
import { Portfolio, PortfolioSimulationData } from "../app/interface/dto/portfolio";
import { BacktestingRes } from "../app/interface/dto/backtesting";
import { ETFTimeSeriesDTO } from "../app/interface/dto/etf";

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
  dailyReturns: number[]
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
  years: number
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
  frequency: RebalanceFrequency
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
              date.getMonth() === targetDate.getMonth()
          )
        ) {
          dates.push(date);
        }
      }
    });
  }

  return [...new Set(dates.map((date) => date.getTime()))].map(
    (date) => new Date(date)
  );
};

export const calculateRebalancing = (
  portfolio: Portfolio,
  data: BacktestingRes,
  portfolioSimulationData: PortfolioSimulationData[],
  rebanalceDate: Date
) => {
  const getCurrentPrice = (ticker: string) => {
    return (
      data.priceInfos
        .find((price) => price.ticker === ticker)
        ?.prices?.find(
          (data) => data.date.getTime() === rebanalceDate.getTime()
        )?.close ?? 0
    );
  };

  const tmpPosition = portfolio.assets.map((asset) => {
    const currentValue = asset.shares * getCurrentPrice(asset.symbol);

    return {
      symbol: asset.symbol,
      shares: asset.shares,
      currenValue: currentValue,
      currentWeight: 0,
      targetWeight: asset.weight,
      targetValue: 0,
    };
  });

  const totalCurrentValue = tmpPosition.reduce(
    (total, asset) => total + asset.currenValue,
    0
  );

  const assetPosition = tmpPosition.map((asset) => {
    return {
      ...asset,
      currentWeight: asset.currenValue / totalCurrentValue,
      targetValue: asset.targetWeight * totalCurrentValue,
    };
  });

  return;
};

export const getCommonDates = (pricesInfo: ETFTimeSeriesDTO[]): string[] => {
  const tmpMap = new Map<string, number>();
  const count = pricesInfo.length;

  pricesInfo.forEach((priceInfo) => {
    priceInfo.prices.forEach((price) => {
      const indexDate = new Date(price.date).toISOString().split("T")[0];
      // const indexDate = format(price.date, "yyyy-MM-dd");
      tmpMap.set(indexDate, (tmpMap.get(indexDate) ?? 0) + 1);
    });
  });

  const dateResult = Array.from(tmpMap.entries())
    .filter(([key, val]) => {
      return val === count;
    })
    .map(([key]) => key)
    .sort((pre, post) => new Date(pre).getTime() - new Date(post).getTime());


  return dateResult;
};

