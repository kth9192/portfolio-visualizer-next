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
  const { setting, initialAmount } = usePortfolioStore();
  const metricsRef = useRef<HTMLDivElement>(null);

  const {
    data: benchmarks,
    isLoading: benchmarkLoading,
    error: benchmarkError,
  } = useGetBenchmarkInfos({
    startDate: setting.startDate!,
    endDate: setting.endDate!,
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
    const symbols = Array.from(
      new Set(benchmarks?.map((benchmark) => benchmark.symbol))
    );

    const source = symbols?.map((symbol) => {
      return {
        name: symbol,
        data:
          benchmarks
            ?.filter((benchmark) => benchmark.symbol === symbol)
            .sort((pre, post) => pre.year_month.localeCompare(post.year_month))
            .map((data) => ({
              x: new Date(data.year_month).getTime(),
              y: data.cumulative_value - 100,
            })) ?? [],
      };
    });

    return chartSeries.concat(source);
  }, [chartSeries, benchmarks]);

  // 성과지표 계산
  let metrics = useMemo(() => {
    if (!portfolioSimulationData.length || !chartSeries[0]?.data.length) {
      return {
        totalReturn: 0,
        cagr: 0,
        mdd: 0,
        volatility: 0,
        sharpRatio: 0,
        finalAmount: initialAmount,
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
        ?.portfolioValue || initialAmount;

    // CAGR 계산
    const totalReturnPercent =
      chartSeries[0].data[chartSeries[0].data.length - 1]?.y || 0;
    const years = differenceInYears(setting.endDate!, setting.startDate!);
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

    return {
      totalReturn,
      cagr,
      mdd,
      volatility,
      sharpRatio,
      finalAmount,
    };
  }, [portfolioSimulationData, chartSeries, setting, initialAmount]);

  useEffect(() => {
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
                colors: [twColor("red-500"), twColor("blue-600")],
                dataLabels: {
                  enabled: false,
                },
                xaxis: {
                  type: "datetime",
                  labels: {
                    datetimeUTC: false,
                    format:
                      differenceInYears(setting.endDate!, setting.startDate!) >=
                      2
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
                      new Date(w.globals.seriesX[seriesIndex][dataPointIndex]),
                      "yyyy-MM-dd",
                      { locale: ko }
                    );
                    const value =
                      series[seriesIndex][dataPointIndex].toFixed(2);
                    return `
                          <div class="p-3 bg-white shadow-lg rounded-lg ">
                            <div class="font-semibold text-gray-800">${date}</div>
                            <div class="flex items-center mt-1">
                              <span class="font-medium text-gray-600">수익률 : </span>
                              <span class="ml-1 font-bold text-blue-600">${value}%</span>
                            </div>
                          </div>
                        `;
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
                ${formatWithCommas(initialAmount)}
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
                {differenceInYears(setting.endDate!, setting.startDate!)}년
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
