"use client";

import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import React, { useMemo } from "react";
import { deepMerge } from "@/lib/utils";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface TreeMapChartProps {
  options?: ApexOptions;
  series: ApexOptions["series"];
  containerClass?: string;
}

function TreeMapChart({ series, options }: TreeMapChartProps) {
  const chartOptions = useMemo(() => {
    const baseOptions: ApexOptions = {
      chart: {
        type: "treemap",
        toolbar: {
          show: false,
        },
        animations: {
          enabled: true,
          speed: 400,
        },
      },
      plotOptions: {
        treemap: {
          enableShades: true,
          shadeIntensity: 0.5,
          reverseNegativeShade: true,

          colorScale: {
            ranges: [
              {
                from: -100,
                to: 0,
                color: "#AB3534", // 큰 하락
              },
              {
                from: 0,
                to: 0,
                color: "#000000", // 중상승
              },
              {
                from: 0,
                to: 100,
                color: "#2AB642", // 큰 상승
              },
            ],
          },
        },
      },
      dataLabels: {
        enabled: true,
        style: {
          fontSize: "14px",
          fontWeight: "bold",
          colors: ["#fff"],
        },
        // ✅ 타입 에러 수정: 명시적 타입 지정
        formatter: function (text: string | number, op: any): string[] {
          const dataPoint = op.w.config.series[0].data[op.dataPointIndex];
          const meta = dataPoint?.meta;

          if (meta) {
            const changeText = `${
              meta.change > 0 ? "+" : ""
            }${meta.change.toFixed(2)}%`;
            return [String(text), changeText];
          }

          return [String(text)];
        },
      },
      tooltip: {
        custom: function ({ seriesIndex, dataPointIndex, w }) {
          const data = w.config.series[seriesIndex].data[dataPointIndex];
          const meta = data?.meta;

          if (!meta) return "";

          return `
          <div class="p-3 bg-white border rounded-lg shadow-lg">
            <div class="font-bold text-lg mb-1">${data.x}</div>
            <div class="text-sm text-gray-600 mb-2">${meta.shortName}</div>
            <div class="flex flex-col gap-1">
              <div class="flex justify-between gap-4">
                <span class="text-gray-500">현재가:</span>
                <span class="font-semibold">$${meta.currentPrice.toFixed(
                  2
                )}</span>
              </div>
              <div class="flex justify-between gap-4">
                <span class="text-gray-500">변동:</span>
                <span class="font-semibold ${
                  meta.change >= 0 ? "text-green-600" : "text-red-600"
                }">
                  ${meta.change > 0 ? "+" : ""}${meta.change.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        `;
        },
      },
      legend: {
        show: false,
      },
    };

    return deepMerge(baseOptions, options);
  }, [options]);

  return (
    <Chart options={chartOptions} series={series} type="treemap" height={600} />
  );
}

export default TreeMapChart;
