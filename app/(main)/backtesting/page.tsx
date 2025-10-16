"use client";

import { Button } from "@/components/ui/button";
import { Suspense, useCallback, useEffect, useMemo } from "react";

import {
  PortfolioAssetReqDTO,
  PortfolioSettingReqDTO,
} from "@/app/interface/dto/portfolio";
import { RebalanceFrequency } from "@/app/interface/enum/rebanalceFrequency";
import {
  portfolioCreateSchema,
  PortfolioCreateSchemaType,
} from "@/app/interface/schema/portfolio";
import { showToast } from "@/components/toast/customToast";
import { INITIAL_AMOUNT, PORTFOLIO_PRESETS } from "@/lib/data/portfolioPreset";
import useCreatePortfolio from "@/lib/hooks/mutation/useCreatePortfolio";
import useGetBacktestingData from "@/lib/hooks/query/useGetBacktestingData";
import useGetBacktestingMonthlyData from "@/lib/hooks/query/useGetBacktestingMonthlyData";
import useGetPortfolio from "@/lib/hooks/query/useGetPortfolio";
import { usePortfolioSimulationMonthly } from "@/lib/hooks/usePortfolioSimulationMonthly";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import PortfolioBuilder from "./widget/portfolioBuilder";
import PortfolioMetrics from "./widget/portfolioMetrics";
import PortfolioSetting from "./widget/portfolioSetting";
import { twMerge } from "tailwind-merge";

function BacktestingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const param = useParams<{ id?: string; presetId?: string }>();

  const portfolioId = searchParams.get("id") || "";

  const presetId = searchParams.get("presetId") || "";

  const createPortfolioMutation = useCreatePortfolio();

  const defaultValues = useMemo(
    () => ({
      name: "",
      initialAmount: INITIAL_AMOUNT,
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

  const method = useForm<PortfolioCreateSchemaType>({
    mode: "onChange",
    resolver: zodResolver(portfolioCreateSchema),
    defaultValues,
  });

  const { control, formState, watch, setValue, handleSubmit } = method;

  const assetsWatch = useWatch({
    control,
    name: "assets",
  });

  const startDateWatch = useWatch({
    control,
    name: "setting.startDate",
  });

  const endDateWatch = useWatch({
    control,
    name: "setting.endDate",
  });

  const rebalanceFrequencyWatch = useWatch({
    control,
    name: "setting.rebalanceFrequency",
  });

  const initialAmountWatch = useWatch({
    control,
    name: "initialAmount",
  });

  const settingWatch = useWatch({
    control,
    name: "setting",
  });

  const backtestingReq = useMemo(() => {
    return {
      ticker: assetsWatch.map((asset) => asset.symbol),
      startDate: startDateWatch,
      endDate: endDateWatch,
      rebalanceFrequency: rebalanceFrequencyWatch,
    };
  }, [assetsWatch, startDateWatch, endDateWatch, rebalanceFrequencyWatch]);

  const {
    data: portfolioData,
    // isLoading: portfolioLoading,
    // isError: portfolioError,
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

  const { data: monthlyPortfolioData, refetch: executeMonthlyBacktest } =
    useGetBacktestingMonthlyData({
      req: {
        ticker: assetsWatch.map((asset) => asset.symbol),
        startDate: startDateWatch,
        endDate: endDateWatch,
        rebalanceFrequency: rebalanceFrequencyWatch,
      },
      options: {
        enabled: false,
        retry: false,
      },
    });

  // const portfolioSimulationData = usePortfolioSimulation({
  //   data: backtestingData,
  //   initialAmount: initialAmountWatch,
  //   setting: settingWatch as PortfolioSettingReqDTO,
  //   assets: assetsWatch as PortfolioAssetReqDTO[],
  // });

  const portfolioSimulationMonthlyData = usePortfolioSimulationMonthly({
    data: monthlyPortfolioData,
    initialAmount: initialAmountWatch,
    setting: settingWatch as PortfolioSettingReqDTO,
    assets: assetsWatch as PortfolioAssetReqDTO[],
  });

  useEffect(() => {
    if (portfolioId && portfolioData) {
      setValue("name", portfolioData?.name);
      setValue("description", portfolioData?.description);
      setValue("assets", portfolioData?.assets);
      setValue("setting", portfolioData?.setting);
      setValue("initialAmount", portfolioData?.initialAmount);

      return;
    }

    console.log("portfolio test", portfolioId, portfolioData);

    const preset = PORTFOLIO_PRESETS.find((preset) => preset.id === presetId);

    if (presetId) {
      setValue("name", preset.name);
      setValue("description", preset.description);
      setValue("assets", preset.assets);
      setValue("setting", {
        startDate: new Date(),
        endDate: new Date(),
        rebalanceFrequency: preset.rebalanceFrequency,
      });
      setValue("initialAmount", INITIAL_AMOUNT);
      return;
    }
  }, [portfolioId, portfolioData, presetId, setValue]);

  useEffect(() => {
    setValue("setting", {
      startDate: new Date(),
      endDate: new Date(),
      rebalanceFrequency: RebalanceFrequency.MONTHLY,
    });
  }, [portfolioData, setValue]);

  useEffect(() => {
    console.warn(formState.errors);
  }, [formState.errors]);

  const chartSeries = useMemo(() => {
    if (portfolioSimulationMonthlyData.length > 0 && !backtestingData)
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
        data: portfolioSimulationMonthlyData.map((item) => ({
          x: new Date(item.yearMonth).getTime(),
          y: item.cumulativeReturnsPercent,
        })),
      },
    ];
    return result;
  }, [portfolioSimulationMonthlyData, backtestingData]);

  const handleBacktesting = useCallback(() => {
    if (!formState.isValid) {
      showToast.error("포트폴리오가 유효하지 않습니다");
      return;
    }

    executeMonthlyBacktest();
    executeBacktesting();
  }, [executeBacktesting, formState.isValid, executeMonthlyBacktest]);

  const handleSave = async () => {
    //TODO:수정인 경우에 포트폴리오 저장이 아닌 데이터 수정으로 변경하기

    if (!formState.isValid) {
      showToast.error("포트폴리오가 유효하지 않습니다");
      return;
    }

    await createPortfolioMutation.mutateAsync({
      name: watch("name"),
      initialAmount: watch("initialAmount"),
      description: watch("description"),
      assets: watch("assets").map((asset) => ({
        symbol: asset.symbol,
        weight: asset.weight,
        shares: asset.shares,
      })),
      setting: {
        startDate: watch("setting.startDate"),
        endDate: watch("setting.endDate"),
        rebalanceFrequency: watch("setting.rebalanceFrequency"),
      },
      metrics: {
        totalReturn:
          portfolioSimulationMonthlyData[
            portfolioSimulationMonthlyData.length - 1
          ].cumulativeReturn,
        cagr: 0,
        mdd: 0,
        volatility: 0,
        sharpRatio: 0,
        finalAmount:
          portfolioSimulationMonthlyData[
            portfolioSimulationMonthlyData.length - 1
          ].portfolioValue,
      },
    });

    showToast.success("포트폴리오가 저장되었습니다");

    router.push(`/portfolio`);
  };

  return (
    <section className="flex flex-col w-full gap-10 p-6 ">
      <div className="flex flex-col">
        <h1 className="text-3xl font-bold text-gray-900 ">
          ETF 포트폴리오 백테스팅
        </h1>
        <p className="text-gray-600">
          포트폴리오를 구성하고 과거 성과를 분석해보세요
        </p>
      </div>
      <FormProvider {...method}>
        <form
          onSubmit={handleSubmit(handleSave)}
          className="flex flex-col gap-6 min-h-0"
        >
          <PortfolioBuilder />
          <div className="grid grid-cols-[1fr_2fr] gap-6">
            <PortfolioSetting />
            <div className="flex flex-col w-full gap-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h4 className="text-lg font-semibold ">검증 상태</h4>
              <ul className="flex flex-col gap-2">
                {formState.errors.name && (
                  <li className="text-destructive text-sm">
                    {formState.errors.name.message}
                  </li>
                )}
                {formState.errors.initialAmount && (
                  <li className="text-destructive text-sm">
                    {formState.errors.initialAmount.message}
                  </li>
                )}
                {formState.errors.description && (
                  <li className="text-destructive text-sm">
                    {formState.errors.description.message}
                  </li>
                )}

                {formState.errors.assets && (
                  <li className="text-destructive text-sm">
                    {formState.errors.assets.message}
                  </li>
                )}
                {formState.errors.setting && (
                  <li className="text-destructive text-sm">
                    {formState.errors.setting.message}
                  </li>
                )}
              </ul>
              <Button
                type="button"
                onClick={handleBacktesting}
                className={twMerge(
                  "w-full",
                  !formState.isValid && "bg-red-600"
                )}
                disabled={!formState.isValid}
              >
                {formState.isValid
                  ? "백테스트 실행"
                  : "날짜를 설정해 백테스트를 실행해보세요"}
              </Button>
            </div>
          </div>

          <PortfolioMetrics
            portfolioSimulationData={portfolioSimulationMonthlyData}
            chartSeries={chartSeries}
            backtestingLoading={backtestingLoading}
            backtestingError={backtestingError}
          />
          <div className="flex justify-center items-center">
            <Button
              type="submit"
              className={twMerge(
                "w-full",
                portfolioSimulationMonthlyData.length === 0 && "bg-red-600"
              )}
              disabled={portfolioSimulationMonthlyData.length === 0}
            >
              {portfolioSimulationMonthlyData.length === 0
                ? "시뮬레이션 결과를 생성하고 저장 활성화"
                : "저장하기"}
            </Button>
          </div>
        </form>
      </FormProvider>
    </section>
  );
}

export default BacktestingPage;
