'use client';

import { deepMerge } from "@/app/lib/utils";
import { ApexOptions } from "apexcharts";
import React, { lazy, useMemo } from "react";
const ReactApexChart = lazy(() => import("react-apexcharts"));

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
