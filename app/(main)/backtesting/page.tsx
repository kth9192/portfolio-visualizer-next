"use client";

import { Button } from "@/components/ui/button";
import { format, isSameDay } from "date-fns";
import { useCallback, useMemo } from "react";


import { postSavePortfolio } from "@/api/portfolio";
import { createPortfolioCreateDTO, PortfolioSimulationData } from "@/app/interface/dto/portfolio";
import { showToast } from "@/components/toast/customToast";
import { getCommonDates, getRebalanceDates } from "@/lib/calculator";
import useGetBacktestingData from "@/lib/hooks/query/useGetBacktestingData";
import { usePortfolioValidation } from "@/lib/hooks/usePortfolioValidation";
import { usePortfolioStore } from "@/lib/store/portfolioStore";
import PortfolioBuilder from "./widget/portfolioBuilder";
import PortfolioMetrics from "./widget/portfolioMetrics";
import PortfolioSetting from "./widget/portfolioSetting";

function BacktestingPage() {
  const {
    assets,
    setting,
    initialAmount,
    name,
    description,
    rebalanceFrequency,
  } = usePortfolioStore();

  const {
    data: backtestingData,
    refetch: executeBacktesting,
    isLoading: backtestingLoading,
    isError: backtestingError,
  } = useGetBacktestingData({
    req: {
      ticker: assets.map((asset) => asset.symbol),
      startDate: setting.startDate,
      endDate: setting.endDate,
      rebalanceFrequency: setting.rebalanceFrequency!,
    },
    options: {
      enabled: false,
      retry: false,
    },
  });

  const { isPortfolioValid, errors, totalWeight } = usePortfolioValidation({
    portfolio: createPortfolioCreateDTO({
      name: name,
      initialAmount: initialAmount,
      rebalanceFrequency: setting.rebalanceFrequency!,
      assets,
      setting,
    }),
    setting,
  });

  const portfolioSimulationData = useMemo(() => {
    if (!backtestingData?.priceInfos?.length || !assets.length) {
      return [];
    }

    const priceInfos = backtestingData.priceInfos;

    const result: PortfolioSimulationData[] = [];

    //전체 티커에 모두 들어가 있는 날짜목록
    const commonDates = getCommonDates(priceInfos);

    const commonDatesSet = new Set(commonDates);

    const timeSeries = commonDates.map((item) => new Date(item));

    //adjClose 기반 가격 맵 - 배당금 효과 이미 반영됨
    const priceMap = new Map<string, number[]>();

    priceInfos.forEach((priceInfo) => {
      priceMap.set(
        priceInfo.ticker,
        priceInfo.prices
          .filter((price) =>
            commonDatesSet.has(format(price.date, "yyyy-MM-dd"))
          )
          .map((item) => item.adj_close)
      );
    });

    if (!timeSeries?.length) return [];

    //초기 포트폴리오 구성 - 완전 분할매수
    const currentShares = new Map<string, number>();
    let remainingCash = 0;

    // 초기 매수: 모든 자산에 대해 정확한 비중으로 분할매수
    assets.forEach((asset) => {
      const initialPrice = priceMap.get(asset.symbol)?.[0] ?? 0;
      if (initialPrice === 0) {
        console.error(`${asset.symbol}의 초기 가격 데이터가 없습니다.`);
        return;
      }

      const targetAmount = asset.weight * initialAmount;
      const shares = Math.floor(targetAmount / initialPrice); //완전 분할매수

      currentShares.set(asset.symbol, shares);
    });

    //초기 현금 계산 - 분할매수로 인한 잔액 최소화
    const initialUsedAmount = assets.reduce((sum, asset) => {
      const shares = currentShares.get(asset.symbol) ?? 0;
      const price = priceMap.get(asset.symbol)?.[0] ?? 0;
      return sum + shares * price;
    }, 0);

    remainingCash = initialAmount - initialUsedAmount;

    //리밸런싱 날짜 계산
    const rebalanceDates = getRebalanceDates(
      timeSeries,
      setting.startDate!,
      setting.endDate!,
      setting.rebalanceFrequency!
    );

    //일별 시뮬레이션
    timeSeries.forEach((date, dayIdx) => {
      const isRebalanceDay = rebalanceDates.some((rebalanceDate) =>
        isSameDay(date, rebalanceDate)
      );

      //리밸런싱
      if (isRebalanceDay && dayIdx > 0 && assets.length > 1) {
        // 현재 총 포트폴리오 가치 계산 (현금 + 주식)
        let totalPortfolioValue = remainingCash;

        assets.forEach((asset) => {
          const shares = currentShares.get(asset.symbol) ?? 0;
          const currentPrice = priceMap.get(asset.symbol)?.[dayIdx] ?? 0;
          totalPortfolioValue += shares * currentPrice;
        });

        // 목표 비중에 따라 새로운 주식 수량 계산
        let totalUsedForRebalancing = 0;

        assets.forEach((asset) => {
          const currentPrice = priceMap.get(asset.symbol)?.[dayIdx] ?? 0;
          const targetValue = totalPortfolioValue * asset.weight;
          const newShares = Math.floor(targetValue / currentPrice); // 분할매수

          currentShares.set(asset.symbol, newShares);
          totalUsedForRebalancing += newShares * currentPrice;
        });

        // 리밸런싱 후 현금 재계산
        remainingCash = totalPortfolioValue - totalUsedForRebalancing;

        if (dayIdx <= 5 || isRebalanceDay) {
          // 초기 몇 일과 리밸런싱 날짜 로깅
          console.log(
            `${format(
              date,
              "yyyy-MM-dd"
            )} [리밸런싱]: 총 가치 $${totalPortfolioValue.toFixed(
              2
            )}, 현금 $${remainingCash.toFixed(2)}`
          );
        }
      }

      // 현재 포트폴리오 가치 계산
      let currentPortfolioValue = remainingCash;

      assets.forEach((asset) => {
        const shares = currentShares.get(asset.symbol) ?? 0;
        const currentPrice = priceMap.get(asset.symbol)?.[dayIdx] ?? 0;
        currentPortfolioValue += shares * currentPrice;
      });

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

      // setAssets(
      //   assets.map((asset) => ({
      //     ...asset,
      //     shares: currentShares.get(asset.symbol) ?? 0,
      //   }))
      // );

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
  }, [backtestingData]);

  const chartSeries = useMemo(() => {
    if (portfolioSimulationData.length > 0 && !backtestingData)
      return [
        {
          name: "Portfolio",
          data: [
            {
              x: 0,
              y: 0,
            },
          ],
        },
      ];

    const result = [
      {
        name: "Portfolio",
        data: portfolioSimulationData.map((item) => ({
          x: item.date.getTime(),
          y: item.cumulativeReturnsPercent,
        })),
      },
    ];
    return result;
  }, [portfolioSimulationData, backtestingData]);

  const handleBacktesting = useCallback(() => {
    if (!isPortfolioValid) {
      showToast.error("포트폴리오가 유효하지 않습니다");
      return;
    }

    executeBacktesting();
  }, [executeBacktesting, isPortfolioValid]);

  const handleSave = async () => {
    if (!name || !setting.startDate || !setting.endDate) {
      showToast.error("포트폴리오 이름, 시작일, 종료일을 입력해주세요");
      return;
    }

    const res = await postSavePortfolio({
      name,
      initialAmount,
      description,
      rebalanceFrequency,
      assets,
      setting,
    });

    showToast.success("포트폴리오가 저장되었습니다");
  };

  return (
    <section className="flex flex-col w-full 2xl:w-4/5 gap-10 p-6 ">
      <div className="flex flex-col">
        <h1 className="text-3xl font-bold text-gray-900 ">
          ETF 포트폴리오 백테스팅
        </h1>
        <p className="text-gray-600">
          포트폴리오를 구성하고 과거 성과를 분석해보세요
        </p>
      </div>
      <div className="flex flex-col gap-6">
        <PortfolioBuilder />
        <div className="grid grid-cols-[1fr_2fr] gap-6">
          <PortfolioSetting />
          <div className="flex flex-col w-full gap-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h4 className="text-lg font-semibold ">검증 상태</h4>
            <ul className="flex flex-col gap-2">
              {assets.length > 0 &&
                errors.map((error, index) => (
                  <li key={index} className="text-destructive text-sm">
                    {error}
                  </li>
                ))}
            </ul>
            <Button
              onClick={handleBacktesting}
              className="w-full"
              disabled={!isPortfolioValid}
            >
              백테스트 실행
            </Button>
          </div>
        </div>

        <PortfolioMetrics
          portfolioSimulationData={portfolioSimulationData}
          chartSeries={chartSeries}
          backtestingLoading={backtestingLoading}
          backtestingError={backtestingError}
        />
        <div className="flex justify-center items-center">
          <Button
            onClick={handleSave}
            className="w-full"
            disabled={portfolioSimulationData.length === 0}
          >
            저장하기
          </Button>
        </div>
      </div>
    </section>
  );
}

export default BacktestingPage;
