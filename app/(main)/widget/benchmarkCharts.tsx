"use client";

import {
  createPortfolioAssetPackage
} from "@/app/interface/dto/portfolio";
import { RebalanceFrequency } from "@/app/interface/enum/rebanalceFrequency";
import LineChart from "@/components/chart/lineChart";
import CustomSpinner from "@/components/spinner/customSpinner";
import { PORTFOLIO_PRESETS } from "@/lib/data/portfolioPreset";
import useGetBenchmarkInfos from "@/lib/hooks/query/useGetBenchmarks";
import { useMonthlySeries } from "@/lib/hooks/useMonthlySeries";
import { BENCHMARK_TICKERS, twColor } from "@/lib/resource";
import { ApexOptions } from "apexcharts";
import { format, subYears } from "date-fns";
import { ko } from "date-fns/locale";
import { useMemo } from "react";

function BenchmarkCharts() {
  const {
    data: benchmarks,
    isLoading: benchmarkLoading,
    error: benchmarkError,
  } = useGetBenchmarkInfos({
    startDate: subYears(new Date(), 3),
    endDate: new Date(),
  });

  const testSeries = useMonthlySeries({
    portfolio: PORTFOLIO_PRESETS.map((preset) =>
      createPortfolioAssetPackage({
        name: preset.name,
        assets: preset.assets,
        rebalanceFrequency: preset.rebalanceFrequency,
      })
    ),
    startDate: subYears(new Date(), 3),
    endDate: new Date(),
    rebalanceFrequency: RebalanceFrequency.MONTHLY,
    initialAmount: 1000000,
  });

  const chartSeries = useMemo<
    ApexAxisChartSeries | ApexNonAxisChartSeries | undefined
  >(() => {
    const validSeries: { name: string; data: { x: string; y: number }[] }[] =
      [];

    BENCHMARK_TICKERS.forEach((ticker) => {
      if (benchmarks === null || benchmarks === undefined) return null;
      const tickerData = benchmarks.filter(
        (benchmark) => benchmark.symbol === ticker
      );

      if (tickerData.length === 0) return null;

      const baseVal = tickerData[0].close;

      if (!baseVal || baseVal <= 0) {
        console.warn(`Invalid base price for ${ticker}:`, baseVal);
        return;
      }

      const calculateCumulativeSeriesData = tickerData.map((data) => {
        const accumulateValue = (data.close - baseVal) / baseVal;

        return {
          x: data.year_month,
          y: accumulateValue * 100,
        };
      });

      validSeries.push({
        name: ticker,
        data: calculateCumulativeSeriesData,
      });
    });

    if (testSeries.length === 0) return validSeries;
    testSeries.map((series) =>
      validSeries.push({
        name: series[0]?.name,
        data: series.map((data) => ({
          x: data.year_month,
          y: data.cumulativeReturnsPercent,
        })),
      })
    );

    return validSeries;
  }, [benchmarks, testSeries]);

  if (benchmarkError) {
    return <p>error</p>;
  }

  return (
    <div className="flex flex-col">
      {benchmarkLoading ? (
        <div className="flex flex-col items-center justify-center w-full gap-4 bg-white rounded-lg shadow-sm border border-gray-200 p-12">
          <CustomSpinner />
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
              colors: chartSeries?.map((_, index) => {
                const colors = [
                  "red-500",
                  "blue-600",
                  "green-500",
                  "purple-500",
                  "orange-500",
                  "indigo-500",
                  "pink-500",
                  "teal-500"
                ];
                return twColor(colors[index % colors.length]);
              }),
              dataLabels: {
                enabled: false,
              },
              xaxis: {
                type: "datetime",
                title: {
                  text: "기간",
                },
                labels: {
                  datetimeUTC: false,
                  format: "yy-MM",
                },
              },
              yaxis: {
                title: {
                  text: "누적 수익률 (%)",
                },
                labels: {
                  formatter: (value) => `${value.toFixed(2)}%`,
                },
                axisBorder: { show: true },
                axisTicks: { show: true },
              },
              tooltip: {
                enabled: true,
                x: {
                  format: "yyyy-MM-dd",
                },
                custom: function ({ series, seriesIndex, dataPointIndex, w }) {
                  const date = format(
                    new Date(w.globals.seriesX[seriesIndex][dataPointIndex]),
                    "yyyy-MM-dd",
                    { locale: ko }
                  );

                  const seriesData = series.map(
                    (seriesItem: number[], idx: number) => ({
                      name: w.config.series[idx].name,
                      value: Number(seriesItem[dataPointIndex]).toFixed(2),
                    })
                  );

                  return `<div class="p-3 bg-white shadow-lg rounded-lg ">
                            <div class="font-semibold text-gray-800">${date}</div>
                            <ul class="flex flex-col gap-1">
                              ${seriesData
                                .map(
                                  (
                                    item: { name: string; value: number },
                                    idx: number
                                  ) =>
                                    `<li class="flex flex-row justify-between items-center gap-3" style="${item.value !== undefined  || item.value !== null ? "" : "display: none;"}">
                                      <div class="flex flex-row items-center gap-1">
                                        <div class="size-2 rounded-full" style="background-color:${w.config.colors[idx]};">
                                        </div>
                                        <span>${item.name}</span>
                                      </div>
                                      <span class="ml-1 font-bold" style="color:${w.config.colors[idx]};">${item.value}%</span>
                                    </li>`
                                )
                                .join("")}
                              
                            </ul>
                          </div>`;
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
          series={chartSeries}
          containerClass="w-full h-80"
        />
      )}
    </div>
  );
}

export default BenchmarkCharts;
