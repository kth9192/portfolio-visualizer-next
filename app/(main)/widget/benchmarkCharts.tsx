"use client";

import { createPortfolioAssetPackage } from "@/app/interface/dto/portfolio";
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
import { useEffect, useMemo } from "react";

function BenchmarkCharts() {
  const {
    data: benchmarks,
    isLoading: benchmarkLoading,
    error: benchmarkError,
  } = useGetBenchmarkInfos({
    startDate: subYears(new Date(), 3),
    endDate: new Date(),
  });

  const monthlySeries = useMonthlySeries({
    portfolio: PORTFOLIO_PRESETS.map((preset) =>
      //프리셋 정보중 필요한 것만
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
    const validSeries: { name: string; data: { x: number; y: number }[] }[] =
      [];

    //벤치마크 디커당
    BENCHMARK_TICKERS.forEach((ticker) => {
      //벤치마크가 없으면 안됨
      if (benchmarks === null || benchmarks === undefined) return null;

      //벤치마크 데이터에서 티커랑 매칭
      const tickerData = benchmarks
        .filter((benchmark) => benchmark.symbol === ticker)
        .sort((a, b) => a.year_month.localeCompare(b.year_month));

      if (tickerData.length === 0) return null;

      //첫 값은 누적수익률에서 의미가 없음
      const baseVal = tickerData[0].close;

      if (!baseVal || baseVal <= 0) {
        console.warn(`Invalid base price for ${ticker}:`, baseVal);
        return;
      }

      //누적 수익률을 구하고 월별로 표기
      const calculateCumulativeSeriesData = tickerData.map((data) => {
        const accumulateValue = (data.close - baseVal) / baseVal;

        return {
          x: new Date(data.year_month + "-01").getTime(),
          y: accumulateValue * 100,
        };
      });

      //벤치마크 데이터를 정리해서 리턴
      validSeries.push({
        name: ticker,
        data: calculateCumulativeSeriesData,
      });
    });

    //표기할 월별 데이터가 없다면, 벤치마크만 내보냄
    if (monthlySeries.length === 0) return validSeries;

    //벤치마크와의 비교를 위해 월별 데이터를 벤치마크 배열에 같은 형식으로 추가함
    monthlySeries.map((series) =>
      validSeries.push({
        name: series[0]?.name,
        data: series.map((data) => ({
          x: new Date(data.year_month + "-01").getTime(),
          y: data.cumulativeReturnsPercent,
        })),
      })
    );

    return validSeries;
  }, [benchmarks, monthlySeries]);

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
                  "teal-500",
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
                    "yyyy-MM",
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
                                    `<li class="flex flex-row justify-between items-center gap-3" style="${
                                      item.value !== undefined ||
                                      item.value !== null
                                        ? ""
                                        : "display: none;"
                                    }">
                                      <div class="flex flex-row items-center gap-1">
                                        <div class="size-2 rounded-full" style="background-color:${
                                          w.config.colors[idx]
                                        };">
                                        </div>
                                        <span>${item.name}</span>
                                      </div>
                                      <span class="ml-1 font-bold" style="color:${
                                        w.config.colors[idx]
                                      };">${item.value}%</span>
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
