import { BacktestingRes } from "@/app/interface/dto/backtesting";
import { PortfolioAssetReqDTO } from "@/app/interface/dto/portfolio";
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
