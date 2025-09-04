import { ETFPriceMonthlyDTO } from "@/app/interface/dto/etf";
import {
  PortfolioAssetReqDTO,
  PortfolioSettingReqDTO,
  PortfolioSimulationMonthData,
} from "@/app/interface/dto/portfolio";
import { useMemo } from "react";
import {
  calculatePortfolioValueMonth,
  checkRebalanceCondition,
  createInitialMonthlyPortfolio,
  createMonthPriceMap,
  getCommonMonths,
  rebalancePortfolio,
} from "../backtestCalculator";

interface usePortfolioSimulationMonthlyProps {
  data: ETFPriceMonthlyDTO[];
  initialAmount: number;
  setting: PortfolioSettingReqDTO;
  assets: PortfolioAssetReqDTO[];
}

export function usePortfolioSimulationMonthly({
  data,
  initialAmount,
  setting,
  assets,
}: usePortfolioSimulationMonthlyProps) {
  return useMemo(() => {
    if (
      !data?.length ||
      !assets?.length ||
      assets.every((asset) => asset.weight === 0)
    ) {
      return [];
    }

    const result: PortfolioSimulationMonthData[] = [];

    const filteredData = data.filter((data) => {
      const [year, month] = data.year_month.split("-").map(Number);
      const dataDate = new Date(year, month - 1, 1); // month는 0-based
      //시작과 끝안에 들어간다면
      return dataDate >= setting.startDate && dataDate <= setting.endDate;
    });

    const priceMap = createMonthPriceMap(filteredData);

    const commonMonths = getCommonMonths(priceMap, assets);

    const initialPortfolio = createInitialMonthlyPortfolio(
      assets,
      initialAmount,
      priceMap,
      commonMonths[0]
    );

    let currentShares = initialPortfolio.initialShares;
    const remainingCash = initialPortfolio.remainingCash;

    commonMonths.forEach((yearMonth, idx) => {
      const monthPrices = priceMap[yearMonth];

      const shouldRebalance = checkRebalanceCondition(
        yearMonth,
        idx,
        setting.rebalanceFrequency
      );

      if (shouldRebalance && idx > 0) {
        const currentVal = calculatePortfolioValueMonth(
          assets,
          currentShares,
          monthPrices,
          remainingCash
        );

        currentShares = rebalancePortfolio(assets, currentVal, monthPrices);
      }

      const portfolioVal = calculatePortfolioValueMonth(
        assets,
        currentShares,
        monthPrices,
        remainingCash
      );

      const cumulativeReturn = (portfolioVal - initialAmount) / initialAmount;
      const cumulativeReturnsPercent = cumulativeReturn * 100;

      let monthlyReturn = 0;
      if (idx > 0 && result[idx - 1]) {
        const prevValue = result[idx - 1].portfolioValue;
        monthlyReturn =
          prevValue === 0 ? (portfolioVal - prevValue) / prevValue : 0;
      }

      result.push({
        yearMonth,
        cumulativeReturn,
        cumulativeReturnsPercent,
        portfolioValue: portfolioVal,
        monthlyReturn,
      });
    });

    return result;
  }, [data, initialAmount, setting, assets]);
}
