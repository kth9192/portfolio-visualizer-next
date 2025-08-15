import { BacktestingRes } from "@/app/interface/dto/backtesting";
import {
  PortfolioAssetReqDTO,
  PortfolioSettingReqDTO,
  PortfolioSimulationData,
} from "@/app/interface/dto/portfolio";
import { isSameDay } from "date-fns";
import { useMemo } from "react";
import { calculatePortfolioValue, calculateRebalancing, createInitialPortfolio, createPriceMap } from "../backtestCalculator";
import { getCommonDates, getRebalanceDates } from "../calculator";

interface usePortfolioSimulationProps {
  data: BacktestingRes;
  initialAmount: number;
  setting: PortfolioSettingReqDTO;
  assets: PortfolioAssetReqDTO[];
}



export function usePortfolioSimulation({
  data,
  initialAmount,
  setting,
  assets,
}: usePortfolioSimulationProps) {
  return useMemo(() => {

    if (
      !data?.priceInfos?.length ||
      !assets?.length ||
      assets.every((asset) => asset.weight === 0)
    ) {
      return [];
    }

    const priceInfos = data.priceInfos;
    const result: PortfolioSimulationData[] = [];

    // 공통 날짜 계산
    const commonDates = getCommonDates(priceInfos);
    const commonDatesSet = new Set(commonDates);
    const timeSeries = commonDates.map((item) => new Date(item));

    // 가격 맵 구성
    const priceMap = createPriceMap(priceInfos, commonDatesSet);

    if (!timeSeries?.length) return [];

    // 초기 포트폴리오 구성
    let {initialShares:currentShares, remainingCash} = createInitialPortfolio(assets, initialAmount, priceMap);

    // 리밸런싱 날짜 계산
    const rebalanceDates = getRebalanceDates(
      timeSeries,
      new Date(setting.startDate),
      new Date(setting.endDate),
      setting.rebalanceFrequency
    );

    // 일별 시뮬레이션
    timeSeries.forEach((date, dayIdx) => {
      const isRebalanceDay = rebalanceDates.some((rebalanceDate) =>
        isSameDay(date, rebalanceDate)
      );

      // 리밸런싱 로직
      if (isRebalanceDay && dayIdx > 0 && assets.length > 1) {
        const { shares, cash } = calculateRebalancing(
          assets,
          priceMap,
          currentShares,
          remainingCash,
          dayIdx
        );

        currentShares = shares;
        remainingCash = cash;
      }

      const currentPortfolioValue = calculatePortfolioValue(
        assets,
        priceMap,
        currentShares,
        remainingCash,
        dayIdx
      );
      
      // 수익률 계산
      let dailyReturn = 0;
      let cumulativeReturn = 0;
      let cumulativeMultiplier = 1;

      if (dayIdx === 0) {
        cumulativeReturn = 0;
        cumulativeMultiplier = 1;
      } else {
        const previousValue =
          result[dayIdx - 1].portfolioValue ?? initialAmount;
        dailyReturn = (currentPortfolioValue - previousValue) / previousValue;
        cumulativeReturn =
          (currentPortfolioValue - initialAmount) / initialAmount;
        cumulativeMultiplier = currentPortfolioValue / initialAmount;
      }

      result.push({
        date,
        portfolioValue: currentPortfolioValue,
        cumulativeReturn,
        cumulativeReturnsPercent: cumulativeReturn * 100,
        cumulativeMultiplier,
        dailyReturn,
        shares: Object.fromEntries(currentShares),
      });
    });

    return result;
  }, [data, initialAmount, setting, assets]);
}
