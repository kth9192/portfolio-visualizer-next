"use client";

import { Button } from "@/components/ui/button";
import { format, isSameDay } from "date-fns";
import { useCallback, useEffect, useMemo } from "react";

import {
  createPortfolioReqDTO,
  PortfolioSimulationData,
} from "@/app/interface/dto/portfolio";
import { showToast } from "@/components/toast/customToast";
import { getCommonDates, getRebalanceDates } from "@/lib/calculator";
import useCreatePortfolio from "@/lib/hooks/mutation/useCreatePortfolio";
import useGetBacktestingData from "@/lib/hooks/query/useGetBacktestingData";
import useGetPortfolio from "@/lib/hooks/query/useGetPortfolio";
import { usePortfolioStore } from "@/lib/store/portfolioStore";
import { useRouter, useSearchParams } from "next/navigation";
import PortfolioBuilder from "./widget/portfolioBuilder";
import PortfolioMetrics from "./widget/portfolioMetrics";
import PortfolioSetting from "./widget/portfolioSetting";
import { FormProvider, useForm } from "react-hook-form";
import {
  portfolioCreateSchema,
  PortfolioCreateSchemaType,
} from "@/app/interface/schema/portfolio";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { RebalanceFrequency } from "@/app/interface/enum/rebanalceFrequency";

function BacktestingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const portfolioId = searchParams.get("id") || "";

  const createPortfolioMutation = useCreatePortfolio();

  const defaultValues = useMemo(
    () => ({
      name: "",
      initialAmount: 10000,
      assets: [],
      setting: {
        startDate: new Date(),
        endDate: new Date(),
        rebalanceFrequency: RebalanceFrequency.MONTHLY,
      },
      description: "",
    }),
    []
  );

  const methods = useForm<PortfolioCreateSchemaType>({
    mode: "onChange",
    resolver: zodResolver(portfolioCreateSchema),
    defaultValues,
  });

  const defaultReq = {
    ticker: [],
    startDate: new Date(),
    endDate: new Date(),
    rebalanceFrequency: RebalanceFrequency.MONTHLY,
  };

  const backtestingReq = useMemo(() => {
    return {
      ticker: methods.watch("assets").map((asset) => asset.symbol),
      startDate: methods.watch("setting.startDate"),
      endDate: methods.watch("setting.endDate"),
      rebalanceFrequency: methods.watch("setting.rebalanceFrequency"),
    };
  }, [
    methods.watch("assets"),
    methods.watch("setting.startDate"),
    methods.watch("setting.endDate"),
    methods.watch("setting.rebalanceFrequency"),
    defaultReq,
  ]);

  const {
    data: portfolioData,
    isLoading: portfolioLoading,
    isError: portfolioError,
  } = useGetPortfolio({ id: portfolioId });

  const {
    data: backtestingData,
    refetch: executeBacktesting,
    isLoading: backtestingLoading,
    isError: backtestingError,
  } = useGetBacktestingData({
    req: backtestingReq,
    options: {
      enabled: false,
      retry: false,
    },
  });

  const portfolioSimulationData = useMemo(() => {
    // 폼에서 현재 데이터 가져오기
    const currentAssets = methods.watch("assets");
    const currentInitialAmount = methods.watch("initialAmount");
    const currentSetting = methods.watch("setting");
  
    if (
      !backtestingData?.priceInfos?.length ||
      !currentAssets?.length ||
      currentAssets.every(asset => asset.weight === 0)
    ) {
      return [];
    }
  
    const priceInfos = backtestingData.priceInfos;
    const result: PortfolioSimulationData[] = [];
  
    // 공통 날짜 계산
    const commonDates = getCommonDates(priceInfos);
    const commonDatesSet = new Set(commonDates);
    const timeSeries = commonDates.map((item) => new Date(item));
  
    // 가격 맵 구성
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
  
    // 초기 포트폴리오 구성
    const currentShares = new Map<string, number>();
    let remainingCash = 0;
  
    // currentAssets 사용 (portfolioData 대신)
    currentAssets.forEach((asset) => {
      const initialPrice = priceMap.get(asset.symbol)?.[0] ?? 0;
      if (initialPrice === 0) {
        console.error(`${asset.symbol}의 초기 가격 데이터가 없습니다.`);
        return;
      }
  
      const targetAmount = asset.weight * currentInitialAmount;
      const shares = Math.floor(targetAmount / initialPrice);
      currentShares.set(asset.symbol, shares);
    });
  
    // 초기 현금 계산
    const initialUsedAmount = currentAssets.reduce((sum, asset) => {
      const shares = currentShares.get(asset.symbol) ?? 0;
      const price = priceMap.get(asset.symbol)?.[0] ?? 0;
      return sum + shares * price;
    }, 0);
  
    remainingCash = currentInitialAmount - initialUsedAmount;
  
    // 리밸런싱 날짜 계산
    const rebalanceDates = getRebalanceDates(
      timeSeries,
      new Date(currentSetting.startDate),
      new Date(currentSetting.endDate),
      currentSetting.rebalanceFrequency
    );
  
    // 일별 시뮬레이션
    timeSeries.forEach((date, dayIdx) => {
      const isRebalanceDay = rebalanceDates.some((rebalanceDate) =>
        isSameDay(date, rebalanceDate)
      );
  
      // 리밸런싱 로직
      if (isRebalanceDay && dayIdx > 0 && currentAssets.length > 1) {
        let totalPortfolioValue = remainingCash;
  
        currentAssets.forEach((asset) => {
          const shares = currentShares.get(asset.symbol) ?? 0;
          const currentPrice = priceMap.get(asset.symbol)?.[dayIdx] ?? 0;
          totalPortfolioValue += shares * currentPrice;
        });
  
        let totalUsedForRebalancing = 0;
  
        currentAssets.forEach((asset) => {
          const currentPrice = priceMap.get(asset.symbol)?.[dayIdx] ?? 0;
          const targetValue = totalPortfolioValue * asset.weight;
          const newShares = Math.floor(targetValue / currentPrice);
  
          currentShares.set(asset.symbol, newShares);
          totalUsedForRebalancing += newShares * currentPrice;
        });
  
        remainingCash = totalPortfolioValue - totalUsedForRebalancing;
      }
  
      // 현재 포트폴리오 가치 계산
      let currentPortfolioValue = remainingCash;
  
      currentAssets.forEach((asset) => {
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
        const previousValue = result[dayIdx - 1].portfolioValue ?? currentInitialAmount;
        dailyReturn = (currentPortfolioValue - previousValue) / previousValue;
        cumulativeReturn = (currentPortfolioValue - currentInitialAmount) / currentInitialAmount;
        cumulativeMultiplier = currentPortfolioValue / currentInitialAmount;
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
  }, [
    backtestingData,
    methods.watch("assets"),
    methods.watch("initialAmount"), 
    methods.watch("setting")
  ]);

  useEffect(() => {
    if (portfolioId && portfolioData) {
      methods.reset({
        name: portfolioData?.name,
        description: portfolioData?.description,
        assets: portfolioData?.assets,
        setting: portfolioData?.setting,
        initialAmount: portfolioData?.initialAmount,
      });
    }
  }, [portfolioId, portfolioData]);

  useEffect(() => {
    methods.trigger();
  }, [portfolioData]);

  useEffect(() => {
    console.warn(methods.formState.errors);
  }, [methods.formState.errors]);

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
    if (!methods.formState.isValid) {
      showToast.error("포트폴리오가 유효하지 않습니다");
      return;
    }

    executeBacktesting();
  }, [executeBacktesting, methods.formState.isValid]);

  const handleSave = async () => {
    if (!methods.formState.isValid) {
      showToast.error("포트폴리오가 유효하지 않습니다");
      return;
    }

    await createPortfolioMutation.mutateAsync({
      name: methods.watch("name"),
      initialAmount: methods.watch("initialAmount"),
      description: methods.watch("description"),
      assets: methods.watch("assets").map((asset) => ({
        symbol: asset.symbol,
        weight: asset.weight,
        shares: asset.shares,
      })),
      setting: {
        startDate: methods.watch("setting.startDate"),
        endDate: methods.watch("setting.endDate"),
        rebalanceFrequency: methods.watch("setting.rebalanceFrequency"),
      },
      metrics:{
        totalReturn: portfolioSimulationData[portfolioSimulationData.length - 1].cumulativeReturn,
        cagr: 0,
        mdd: 0,
        volatility: 0,
        sharpRatio: 0,
        finalAmount: portfolioSimulationData[portfolioSimulationData.length - 1].portfolioValue,
      }
    });

    showToast.success("포트폴리오가 저장되었습니다");

    router.push(`/portfolio`);
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
      <FormProvider {...methods}>
        <form
          onSubmit={methods.handleSubmit(handleSave)}
          className="flex flex-col gap-6"
        >
          <PortfolioBuilder />
          <div className="grid grid-cols-[1fr_2fr] gap-6">
            <PortfolioSetting />
            <div className="flex flex-col w-full gap-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h4 className="text-lg font-semibold ">검증 상태</h4>
              <ul className="flex flex-col gap-2">
                {methods.formState.errors.name && (
                  <li className="text-destructive text-sm">
                    {methods.formState.errors.name.message}
                  </li>
                )}
                {methods.formState.errors.initialAmount && (
                  <li className="text-destructive text-sm">
                    {methods.formState.errors.initialAmount.message}
                  </li>
                )}
                {methods.formState.errors.description && (
                  <li className="text-destructive text-sm">
                    {methods.formState.errors.description.message}
                  </li>
                )}

                {methods.formState.errors.assets && (
                  <li className="text-destructive text-sm">
                    {methods.formState.errors.assets.message}
                  </li>
                )}
                {methods.formState.errors.setting && (
                  <li className="text-destructive text-sm">
                    {methods.formState.errors.setting.message}
                  </li>
                )}
              </ul>
              <Button
                type="button"
                onClick={handleBacktesting}
                className="w-full"
                disabled={!methods.formState.isValid}
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
              type="submit"
              className="w-full"
              disabled={portfolioSimulationData.length === 0}
            >
              저장하기
            </Button>
          </div>
        </form>
      </FormProvider>
    </section>
  );
}

export default BacktestingPage;
