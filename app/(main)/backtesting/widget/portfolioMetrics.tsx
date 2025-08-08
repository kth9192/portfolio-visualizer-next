"use client";

import {
  Portfolio,
  PortfolioSimulationData,
} from "@/app/interface/dto/portfolio";
import {
  calculateCAGR,
  calculateDailyReturns,
  calculateVariance,
  calculatMaximumDrawdown,
} from "@/lib/calculator";
import useGetBenchmarkInfos from "@/lib/hooks/query/useGetBenchmarks";
import { twColor } from "@/lib/resource";
import { usePortfolioStore } from "@/lib/store/portfolioStore";
import { formatWithCommas } from "@/lib/utils";
import LineChart from "@/components/chart/lineChart";
import CustomSpinner from "@/components/spinner/customSpinner";
import { ApexOptions } from "apexcharts";
import { differenceInYears, format } from "date-fns";
import { ko } from "date-fns/locale";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { twMerge } from "tailwind-merge";
import { useFormContext } from "react-hook-form";
import { PortfolioCreateSchemaType } from "@/app/interface/schema/portfolio";

interface PortfolioMetricsProps {
  portfolioSimulationData: PortfolioSimulationData[];
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

  const { watch, setValue } = useFormContext<PortfolioCreateSchemaType>();

  const metricsRef = useRef<HTMLDivElement>(null);

  const {
    data: benchmarks,
    isLoading: benchmarkLoading,
    error: benchmarkError,
  } = useGetBenchmarkInfos({
    startDate: watch("setting.startDate"),
    endDate: watch("setting.endDate"),
  });

  const scrollToMetrics = useCallback(() => {
    metricsRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, []);

  const reworkChartSeries = useMemo<
    ApexAxisChartSeries | ApexNonAxisChartSeries | undefined
  >(() => {
    if (!benchmarks?.length) {
      return chartSeries;
    }

    const startDate = new Date(watch("setting.startDate"));
    const endDate = new Date(watch("setting.endDate"));

    // 벤치마크 데이터 필터링 및 정제
    const filteredBenchmarks = benchmarks.filter((benchmark) => {
      const benchmarkDate = new Date(`${benchmark.year_month}-01`);
      const portfolioStart = new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        1
      );
      const portfolioEnd = new Date(
        endDate.getFullYear(),
        endDate.getMonth(),
        1
      );

      return benchmarkDate >= portfolioStart && benchmarkDate <= portfolioEnd;
    });

    const symbols = Array.from(
      new Set(filteredBenchmarks.map((benchmark) => benchmark.symbol))
    );

    const benchmarkSeries = symbols.map((symbol) => {
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
          const lastDayOfMonth = new Date(year, month, 0); // 해당 월의 마지막 날

          return {
            x: lastDayOfMonth.getTime(),
            // 첫 번째 값을 0%로 정규화
            y: ((data.cumulative_value - baseValue) / baseValue) * 100,
          };
        }),
      };
    });

    return [...chartSeries, ...benchmarkSeries];
  }, [
    chartSeries,
    benchmarks,
    watch("setting.startDate"),
    watch("setting.endDate"),
  ]);

  // 성과지표 계산
  let metrics = useMemo(() => {
    if (!portfolioSimulationData.length || !chartSeries[0]?.data.length) {
      return {
        totalReturn: 0,
        cagr: 0,
        mdd: 0,
        volatility: 0,
        sharpRatio: 0,
        finalAmount: watch("initialAmount"),
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
        ?.portfolioValue || watch("initialAmount");

    // CAGR 계산
    const totalReturnPercent =
      chartSeries[0].data[chartSeries[0].data.length - 1]?.y || 0;
    const years = differenceInYears(
      watch("setting.endDate"),
      watch("setting.startDate")
    );
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
    watch("setting"),
    watch("initialAmount"),
  ]);

  useEffect(() => {
    console.log("portfolioSimulationData", portfolioSimulationData);

    const timeoutId = setTimeout(() => {
      requestAnimationFrame(() => {
        scrollToMetrics();
      });
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [portfolioSimulationData]);

  useEffect(() => {
    requestAnimationFrame(() => {
      scrollToMetrics();
    });
  }, [backtestingLoading]);

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
                colors: [twColor("red-500"), twColor("blue-600") , twColor("green-500")],
                dataLabels: {
                  enabled: false,
                },
                xaxis: {
                  type: "datetime",
                  labels: {
                    datetimeUTC: false,
                    format:
                      differenceInYears(
                        watch("setting.endDate"),
                        watch("setting.startDate")
                      ) >= 2
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
                  x: {
                    format: "yyyy-MM-dd",
                  },
                  custom: function ({
                    series,
                    seriesIndex,
                    dataPointIndex,
                    w,
                  }) {
                    const date = format(
                      new Date(w.globals.seriesX[0][dataPointIndex]),
                      "yyyy-MM-dd",
                      { locale: ko }
                    );

                    const value =
                      series[seriesIndex][dataPointIndex].toFixed(2);

                    let tooltipContent = `<div class="p-3 bg-white shadow-lg rounded-lg ">
                      <div class="font-semibold text-gray-800 mb-3 text-center">${date}</div>
                      <div class="space-y-2">
                      `;

                    series.forEach((seriesItem: number[], seriesIndex) => {
                      const seriesName = w.config.series[seriesIndex].name;
                      const seriesValue = seriesItem[dataPointIndex];
                      const seriesColor = w.globals.colors[seriesIndex]; 

                      const value = typeof seriesValue === 'number' ? seriesValue : Number(seriesValue);
      
                      if (!isNaN(value) && value !== null && value !== undefined) {
                        const isPortfolio = seriesName.includes('Portfolio');
                        
                        tooltipContent += `
                          <div class="flex items-center justify-between">
                            <span class="text-sm font-medium text-gray-700">${seriesName}:</span>
                            <span class="ml-2 font-bold " style="color:${seriesColor}">${value.toFixed(2)}%</span>
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
              <h3 className="text-sm font-medium text-gray-600">
                CAGR (연평균 수익률)
              </h3>
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
              <h3 className="text-sm font-medium text-gray-600">
                MDD (최대 낙폭)
              </h3>
              <p className="text-lg font-medium text-red-600">
                {(metrics.mdd * 100).toFixed(2)}%
              </p>
            </li>

            <li className="p-3 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-600">
                변동성 (연간)
              </h3>
              <p className="text-lg font-medium text-gray-900">
                {(metrics.volatility * 100).toFixed(2)}%
              </p>
            </li>

            <li className="p-3 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-600">샤프 비율</h3>
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

          {/* 성과지표 설명 */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              지표 설명
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-600">
              <div>
                <strong>CAGR:</strong> 연평균 복합 성장률
              </div>
              <div>
                <strong>MDD:</strong> 고점 대비 최대 손실률
              </div>
              <div>
                <strong>변동성:</strong> 수익률의 표준편차 (연간)
              </div>
              <div>
                <strong>샤프 비율:</strong> 위험 대비 수익률 (1.0 이상 우수)
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PortfolioMetrics;
