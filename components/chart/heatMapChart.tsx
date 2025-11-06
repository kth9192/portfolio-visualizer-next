"use client";

import { deepMerge } from "@/lib/utils";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import React, { useMemo } from "react";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse bg-gray-200 h-64 rounded">
      차트 로딩 중...
    </div>
  ),
});

interface HeatMapSeries {
  name: string;
  data: Array<{ s: string; y: number; meta?: any }>;
}

interface HeatMapChartProps {
  options?: ApexOptions;
  series: ApexOptions["series"];
  containerClass?: string;
}

function HeatMapChart({ options, series }: HeatMapChartProps) {
  const chartOptions = useMemo(() => {
    const baseOptions: ApexOptions = {
      chart: {
        type: "heatmap",
        height: 350,
        toolbar: {
          show: true,
          tools: {
            download: true,
            zoom: true,
            zoomin: true,
            zoomout: true,
            pan: false,
            reset: true,
          },
        },
        animations: {
          enabled: true,
          speed: 800,
        },
      },

      // 색상 설정 (수익률에 따라)
      plotOptions: {
        heatmap: {
          shadeIntensity: 0.5,
          radius: 0,
          useFillColorAsStroke: false,
          colorScale: {
            ranges: [
              {
                from: -10,
                to: -2,
                name: "손실 큼",
                color: "#ef4444", // 빨간색 (큰 손실)
              },
              {
                from: -2,
                to: 0,
                name: "소폭 손실",
                color: "#fca5a5", // 연한 빨간색
              },
              {
                from: 0,
                to: 2,
                name: "소폭 이익",
                color: "#86efac", // 연한 초록색
              },
              {
                from: 2,
                to: 5,
                name: "이익",
                color: "#22c55e", // 초록색
              },
              {
                from: 5,
                to: 100,
                name: "이익 큼",
                color: "#15803d", // 진한 초록색
              },
            ],
          },
        },
      },

      // 데이터 레이블
      dataLabels: {
        enabled: true,
        formatter: (val: number) => `${val.toFixed(1)}%`,
        style: {
          fontSize: "12px",
          fontFamily: "inherit",
          fontWeight: 500,
        },
      },

      // X축 설정
      xaxis: {
        type: "category",
        labels: {
          style: {
            fontSize: "12px",
          },
        },
      },

      // Y축 설정
      yaxis: {
        labels: {
          style: {
            fontSize: "12px",
          },
        },
      },

      // 툴팁
      tooltip: {
        enabled: true,
        y: {
          formatter: (val: number) => `${val.toFixed(2)}%`,
        },
        theme: "dark",
      },

      // 제목
      title: {
        text: "월별 수익률 히트맵",
        align: "left",
        style: {
          fontSize: "18px",
          fontWeight: 600,
        },
      },

      // 범례
      legend: {
        show: true,
        position: "bottom",
      },
    };

    return deepMerge(baseOptions, options);
  }, [options]);

  return (
    <ReactApexChart type="heatmap" options={chartOptions} series={series} />
  );
}

export default HeatMapChart;
