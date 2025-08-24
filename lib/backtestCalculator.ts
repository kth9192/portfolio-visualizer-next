import {
  BacktestingRes,
  MonthlyBacktestAsset,
  MonthlyPriceData,
} from "@/app/interface/dto/backtesting";
import { ETFPriceMonthlyDTO } from "@/app/interface/dto/etf";
import {
  PortfolioAssetPackage,
  PortfolioAssetReqDTO,
} from "@/app/interface/dto/portfolio";
import { RebalanceFrequency } from "@/app/interface/enum/rebanalceFrequency";
import { format } from "date-fns";

export const createInitialPortfolio = (
  assets: PortfolioAssetReqDTO[],
  initialAmount: number,
  priceMap: Map<string, number[]>
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
  firstMonth: string
) => {
  const initialShares = new Map<string, number>();
  const firstMonthPrices = priceMap[firstMonth];

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
  commonDatesSet: Set<string>
) => {
  const priceMap = new Map<string, number[]>();
  priceInfos.forEach((priceInfo) => {
    priceMap.set(
      priceInfo.ticker,
      priceInfo.prices
        .filter((price) => commonDatesSet.has(format(price.date, "yyyy-MM-dd")))
        .map((item) => item.adj_close)
    );
  });
  return priceMap;
};

export const calculateRebalancing = (
  assets: PortfolioAssetReqDTO[],
  priceMap: Map<string, number[]>,
  currentShares: Map<string, number>,
  remainingCash: number,
  dayIdx: number
) => {
  const totalPortfolioValue = calculatePortfolioValue(
    assets,
    priceMap,
    currentShares,
    remainingCash,
    dayIdx
  );

  const newShares = calculateNewShares(
    assets,
    priceMap,
    totalPortfolioValue,
    dayIdx
  );

  const totalUsedForRebalancing = calculateTotalUsedAmount(
    assets,
    newShares,
    priceMap,
    dayIdx
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
  dayIdx: number
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
  dayIdx: number
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
  dayIdx: number
) => {
  return assets.reduce((total, asset) => {
    const assetShares = shares.get(asset.symbol) ?? 0;
    const currentPrice = priceMap.get(asset.symbol)?.[dayIdx] ?? 0;

    return total + assetShares * currentPrice;
  }, 0);
};

export const createMonthPriceMap = (
  etfPriceInfo: ETFPriceMonthlyDTO[]
): MonthlyPriceData => {
  const monthlyPriceMap: MonthlyPriceData = {};

  etfPriceInfo.forEach((data) => {
    //날짜가 존재하지 않는다면
    if (!data.year_month || !data.symbol || data.adj_close <= 0) {
      console.warn(
        `데이터 에러: ${data.symbol} ${data.year_month} = ${data.close}`
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
  assets: { symbol: string }[]
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
  monthPrices: Record<string, number>
) => {
  let currentShares = new Map<string, number>();
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
  monthPrices: Record<string, number>
) => {
  let currentShares = new Map<string, number>();
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
  remainingCash: number = 0
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
