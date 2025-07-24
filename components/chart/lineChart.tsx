'use client';

import dynamic from 'next/dynamic';

import { deepMerge } from "@/lib/utils";
import { ApexOptions } from "apexcharts";
import React, { lazy, useMemo } from "react";
const ReactApexChart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse bg-gray-200 h-64 rounded">
      차트 로딩 중...
    </div>
  )
});

interface LineChartProps {
  options: ApexOptions;
  series: ApexOptions["series"];
  containerClass?: string;
}

function LineChart({ options, series, containerClass }: LineChartProps) {
  const baseOptions: ApexOptions = {
    chart: {
      type: "line",
      height: "100%",
      toolbar: { show: true },
      fontFamily: "'Pretendard', sans-serif",
      zoom: {
        enabled: true,
      },
    },
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 2 },
    legend: { show: true },
    theme: { mode: "light" },
    xaxis: {
      type: "datetime",
      tooltip: {
        enabled: false,
      },
    },
    tooltip: {
      enabled: true,
      x: {
        format: "yyyy-MM-dd",
      },
    },
  };

  const chartOptions = useMemo(() => {
    return deepMerge(baseOptions, options);
  }, [options]);

  return (
    <ReactApexChart
      options={chartOptions}
      series={series}
      className={containerClass}
      type="line"
      height="100%"
      width="100%"
    />
  );
}

export default LineChart;
