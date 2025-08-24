"use client";

import { BacktestingReq } from "@/app/interface/dto/backtesting";
import {
  PortfolioSimulationData,
  PortfolioSimulationMonthData,
} from "@/app/interface/dto/portfolio";
import { PortfolioCreateSchemaType } from "@/app/interface/schema/portfolio";
import LineChart from "@/components/chart/lineChart";
import CustomSpinner from "@/components/spinner/customSpinner";
import CustomTooltip from "@/components/tooltip/customTooltip";
import { Tooltip } from "@/components/ui/tooltip";
import {
  calculateCAGR,
  calculateDailyReturns,
  calculateVariance,
  calculatMaximumDrawdown,
} from "@/lib/calculator";
import useGetBacktestingMonthlyData from "@/lib/hooks/query/useGetBacktestingMonthlyData";
import useGetBenchmarkInfos from "@/lib/hooks/query/useGetBenchmarks";
import { useExtractMonthlyFromPortfolio } from "@/lib/hooks/useExtractMonthlyFromPortfolio";
import { twColor } from "@/lib/resource";
import { formatWithCommas } from "@/lib/utils";
import { ApexOptions } from "apexcharts";
import { differenceInYears, format } from "date-fns";
import { ko } from "date-fns/locale";
import { InfoIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { twMerge } from "tailwind-merge";

interface PortfolioMetricsProps {
  portfolioSimulationData: PortfolioSimulationMonthData[];
  chartSeries: Array<{
    name: string;
    data: Array<{ x: number; y: number }>;
  }>;
  backtestingError?: boolean;
  backtestingLoading?: boolean;
}

function PortfolioMetrics({
  portfolioSimulationData,
  chartSeries,
  backtestingLoading,
  backtestingError,
}: PortfolioMetricsProps) {
  // const { setting, initialAmount } = usePortfolioStore();

  const { watch, control, setValue } =
    useFormContext<PortfolioCreateSchemaType>();

  const metricsRef = useRef<HTMLDivElement>(null);
  // const monthlyPortfolioData = useExtractMonthlyFromPortfolio(portfolioSimulationData);

  const startDateWatch = useWatch({
    control: control,
    name: "setting.startDate",
  });

  const endDateWatch = useWatch({
    control: control,
    name: "setting.endDate",
  });

  const initialAmountWatch = useWatch({
    control: control,
    name: "initialAmount",
  });

  const {
    data: benchmarks,
    // isLoading: benchmarkLoading,
    // error: benchmarkError,
  } = useGetBenchmarkInfos({
    startDate: startDateWatch,
    endDate: endDateWatch,
  });

  const scrollToMetrics = useCallback(() => {
    metricsRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, []);

  // 시뮬레이션 데이터와 벤치마크 데이터 통합
  const reworkChartSeries = useMemo<
    ApexAxisChartSeries | ApexNonAxisChartSeries | undefined
  >(() => {
    // 벤치마크가 없다면 필요없음
    if (!benchmarks?.length) {
      return chartSeries;
    }

    const startDate = new Date(startDateWatch);
    const endDate = new Date(endDateWatch);

    // 벤치마크 데이터 필터링 및 정제
    const filteredBenchmarks = benchmarks.filter((benchmark) => {
      const [year, month] = benchmark.year_month.split("-").map(Number);

      const startYear = startDate.getFullYear();
      const startMonth = startDate.getMonth() + 1;
      const endYear = endDate.getFullYear();
      const endMonth = endDate.getMonth() + 1;

      // 년월 숫자로 비교 (예: 202112)
      const dataYearMonth = year * 100 + month;
      const startYearMonth = startYear * 100 + startMonth;
      const endYearMonth = endYear * 100 + endMonth;

      return dataYearMonth >= startYearMonth && dataYearMonth <= endYearMonth;
    });

    console.log(" filteredBenchmarks", filteredBenchmarks);

    //포트폴리오 월 차트 데이터
    const portfolioMonthlySeries = {
      name: "Portfolio",
      data: portfolioSimulationData.map((data) => ({
        x: new Date(data.yearMonth).getTime(),
        y: data.cumulativeReturnsPercent,
      })),
    };

    const symbols = Array.from(
      new Set(filteredBenchmarks.map((benchmark) => benchmark.symbol))
    );

    // 벤치마크 월 차트 데이터
    const benchmarkSeries = symbols.map((symbol) => {
      //시간순으로 벤치마크 심볼과 일치하는 데이터만 필터링
      const symbolData = filteredBenchmarks
        .filter((benchmark) => benchmark.symbol === symbol)
        .sort((a, b) => a.year_month.localeCompare(b.year_month));

      // 첫 번째 데이터의 cumulative_value를 기준점으로 설정
      const baseValue = symbolData[0]?.cumulative_value || 100;

      return {
        name: `${symbol} (벤치마크)`,
        data: symbolData.map((data) => {
          // 월의 마지막 날짜로 설정 (더 정확한 비교를 위해)
          const [year, month] = data.year_month.split("-").map(Number);

          return {
            x: new Date(data.year_month).getTime(),
            // 첫 번째 값을 0%로 정규화
            y: ((data.cumulative_value - baseValue) / baseValue) * 100,
          };
        }),
      };
    });

    return [portfolioMonthlySeries, ...benchmarkSeries];
  }, [
    chartSeries,
    benchmarks,
    startDateWatch,
    endDateWatch,
    portfolioSimulationData,
  ]);

  useEffect(() => {
    console.log("reworkChartSeries", reworkChartSeries);
  }, [reworkChartSeries]);

  // 성과지표 계산
  const metrics = useMemo(() => {
    if (!portfolioSimulationData.length || !chartSeries[0]?.data.length) {
      return {
        totalReturn: 0,
        cagr: 0,
        mdd: 0,
        volatility: 0,
        sharpRatio: 0,
        finalAmount: initialAmountWatch,
      };
    }

    // 누적 수익률 계산
    const cumulativeReturn = portfolioSimulationData.map(
      (item) => item.cumulativeReturn
    );
    const totalReturn = cumulativeReturn[cumulativeReturn.length - 1] * 100;

    // 최종 포트폴리오 가치
    const finalAmount =
      portfolioSimulationData[portfolioSimulationData.length - 1]
        ?.portfolioValue || initialAmountWatch;

    // CAGR 계산
    const totalReturnPercent =
      chartSeries[0].data[chartSeries[0].data.length - 1]?.y || 0;
    const years = differenceInYears(endDateWatch, startDateWatch);
    const cagr =
      years > 0 ? calculateCAGR(100, 100 + totalReturnPercent, years) : 0;

    // MDD 계산
    const mddData = chartSeries[0].data.map(
      (point) => 100 * (1 + point.y / 100)
    );
    const mdd = calculatMaximumDrawdown(mddData);

    // 변동성 계산
    const dailyReturns = calculateDailyReturns(
      portfolioSimulationData.map((item) => 1 + item.cumulativeReturn)
    );
    let volatility = 0;
    if (dailyReturns.length > 0) {
      const variance = calculateVariance(dailyReturns);
      const dailyVolatility = Math.sqrt(variance);
      volatility = dailyVolatility * Math.sqrt(252); // 연간 변동성
    }

    // 샤프 비율 계산 (무위험 수익률 0으로 가정)
    const sharpRatio =
      cagr && volatility && volatility !== 0 ? cagr / volatility : 0;

    setValue("metrics", {
      totalReturn,
      cagr,
      mdd,
      volatility,
      sharpRatio,
      finalAmount,
    });

    return {
      totalReturn,
      cagr,
      mdd,
      volatility,
      sharpRatio,
      finalAmount,
    };
  }, [
    portfolioSimulationData,
    chartSeries,
    startDateWatch,
    endDateWatch,
    initialAmountWatch,
    setValue,
  ]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      requestAnimationFrame(() => {
        scrollToMetrics();
      });
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [portfolioSimulationData, scrollToMetrics]);

  useEffect(() => {
    requestAnimationFrame(() => {
      scrollToMetrics();
    });
  }, [backtestingLoading, scrollToMetrics]);

  return (
    <div ref={metricsRef} className="flex flex-col gap-6 mb-4">
      <div className="flex justify-center items-center bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {backtestingLoading ? (
          <CustomSpinner className=" my-6" size={80} />
        ) : backtestingError ? (
          <p className="text-destructive text-sm">
            백테스트 중 오류가 발생했습니다
          </p>
        ) : portfolioSimulationData.length === 0 ? (
          <div className="w-full text-center border-2 border-dashed border-gray-300 rounded-lg p-6 mx-auto text-gray-500">
            백테스트 결과가 표시됩니다.
          </div>
        ) : (
          <LineChart
            options={
              {
                chart: {
                  height: 400,
                  type: "line",
                  toolbar: {
                    show: true,
                  },
                },
                colors: [
                  twColor("red-500"),
                  twColor("blue-600"),
                  twColor("green-500"),
                ],
                dataLabels: {
                  enabled: false,
                },
                xaxis: {
                  type: "datetime",
                  labels: {
                    datetimeUTC: false,
                    format:
                      differenceInYears(endDateWatch, startDateWatch) >= 2
                        ? "yy-MM"
                        : "yyyy-MM-dd",
                  },
                },
                yaxis: {
                  title: {
                    text: "누적 수익률 (%)",
                  },
                  labels: {
                    formatter: (value) => `${value.toFixed(2)}%`,
                  },
                },
                tooltip: {
                  enabled: true,
                  shared: true,
                  intersect: false,
                  followCursor: true,
                  x: {
                    format: "yyyy-MM",
                  },
                  custom: function ({ series, dataPointIndex, w }) {
                    const date = format(
                      new Date(w.globals.seriesX[0][dataPointIndex]),
                      "yyyy-MM",
                      { locale: ko }
                    );

                    let tooltipContent = `<div class="p-3 bg-white shadow-lg rounded-lg ">
                      <div class="font-semibold text-gray-800 mb-3 text-center">${date}</div>
                      <div class="space-y-2">
                      `;

                    series.forEach((seriesItem: number[], seriesIndex) => {
                      const seriesName = w.config.series[seriesIndex].name;
                      const seriesValue = seriesItem[dataPointIndex];
                      const seriesColor = w.globals.colors[seriesIndex];

                      const value =
                        typeof seriesValue === "number"
                          ? seriesValue
                          : Number(seriesValue);

                      if (
                        !isNaN(value) &&
                        value !== null &&
                        value !== undefined
                      ) {
                        tooltipContent += `
                          <div class="flex items-center justify-between">
                            <span class="text-sm font-medium text-gray-700">${seriesName}:</span>
                            <span class="ml-2 font-bold " style="color:${seriesColor}">${value.toFixed(
                          2
                        )}%</span>
                          </div>
                        `;
                      }
                    });

                    tooltipContent += `</div></div>`;

                    return tooltipContent;
                  },
                },
                stroke: {
                  width: 2,
                  curve: "smooth",
                },
                grid: {
                  borderColor: "#e7e7e7",
                  row: {
                    colors: ["#f3f3f3", "transparent"],
                    opacity: 0.5,
                  },
                },
              } as ApexOptions
            }
            series={reworkChartSeries}
            containerClass="w-full h-80"
          />
        )}
      </div>

      {portfolioSimulationData.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">성과 지표</h2>

          <ul className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <li className="p-3 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-600">시작 금액</h3>
              <p className="text-lg font-medium text-gray-900">
                ${formatWithCommas(watch("initialAmount"))}
              </p>
            </li>

            <li className="p-3 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-600">최종 금액</h3>
              <p className="text-lg font-medium text-gray-900">
                ${formatWithCommas(Math.round(metrics.finalAmount))}
              </p>
            </li>

            <li className="p-3 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-600">누적 수익률</h3>
              <p
                className={twMerge(
                  "text-lg font-medium",
                  metrics.totalReturn > 0 ? "text-green-600" : "text-red-600"
                )}
              >
                {metrics.totalReturn.toFixed(2)}%
              </p>
            </li>

            <li className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-1">
                <h3 className="text-sm font-medium text-gray-600">CAGR</h3>
                <CustomTooltip
                  content={
                    <div className="flex gap-2 flex-col">
                      <span>
                        연평균 복합 성장률 (Compound Annual Growth Rate).
                      </span>
                      <span>
                        투자의 연간 성장률을 복리 효과를 고려하여 계산한 지표.
                      </span>
                    </div>
                  }
                  contentClass="bg-black py-2"
                >
                  <InfoIcon className="size-3 " />
                </CustomTooltip>
              </div>
              <p
                className={twMerge(
                  "text-lg font-medium",
                  metrics.cagr > 0 ? "text-green-600" : "text-red-600"
                )}
              >
                {(metrics.cagr * 100).toFixed(2)}%
              </p>
            </li>

            <li className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-1">
                <h3 className="text-sm font-medium text-gray-600">MDD</h3>
                <CustomTooltip
                  content={
                    <div className="flex gap-2 flex-col">
                      <span>최대낙폭 (Maximum Drawdown).</span>
                      <span>고점 대비 최대 손실률을 의미한다.</span>
                    </div>
                  }
                  contentClass="bg-black py-2"
                >
                  <InfoIcon className="size-3 " />
                </CustomTooltip>
              </div>

              <p className="text-lg font-medium text-red-600">
                {(metrics.mdd * 100).toFixed(2)}%
              </p>
            </li>

            <li className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-1">
                <h3 className="text-sm font-medium text-gray-600">
                  변동성 (연간)
                </h3>
                <CustomTooltip
                  content={
                    <div className="flex flex-col gap-1">
                      <span>변동성 (Volatility).</span>
                      <span>투자 수익률의 변동 정도를 의미.</span>
                      <span>
                        높은 변동성이라면 리스크가 높지만 높은 수익기회가 존재.
                        낮은 변동성이라면 안정적인 패턴
                      </span>
                    </div>
                  }
                  contentClass="bg-black"
                >
                  <InfoIcon className="size-3 " />
                </CustomTooltip>
              </div>
              <p className="text-lg font-medium text-gray-900">
                {(metrics.volatility * 100).toFixed(2)}%
              </p>
            </li>

            <li className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-1">
                <h3 className="text-sm font-medium text-gray-600">샤프 비율</h3>
                <CustomTooltip
                  content={
                    <div className="flex flex-col gap-1">
                      <span>샤프 비율 (Sharpe Ratio). 위험 대비 수익률.</span>
                      <span>
                        무위험 수익률에 대한 포트폴리오 수익률을 변동성으로 나눈
                        것.
                      </span>
                      <span>높을 수록 단위 위험당 더 많을 수익을 의미</span>
                    </div>
                  }
                  contentClass="bg-black"
                >
                  <InfoIcon className="size-3 " />
                </CustomTooltip>
              </div>

              <p
                className={twMerge(
                  "text-lg font-medium",
                  metrics.sharpRatio > 1
                    ? "text-green-600"
                    : metrics.sharpRatio > 0.5
                    ? "text-yellow-600"
                    : "text-red-600"
                )}
              >
                {metrics.sharpRatio.toFixed(3)}
              </p>
            </li>

            <li className="p-3 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-600">분석 기간</h3>
              <p className="text-lg font-medium text-gray-900">
                {differenceInYears(
                  watch("setting.endDate"),
                  watch("setting.startDate")
                )}
                년
              </p>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default PortfolioMetrics;
