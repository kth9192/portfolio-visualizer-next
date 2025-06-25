import ApexCharts, { type ApexOptions } from "apexcharts";
import React, { lazy } from "react";
const ReactApexChart = lazy(() => import("react-apexcharts"));

interface PieChartProps {
  options?: ApexOptions;
  series: ApexOptions["series"];
  containerClass?: string;
}

function PieChart({ options, series, containerClass }: PieChartProps) {
  return (
    <ReactApexChart
      options={options}
      series={series}
      className={containerClass}
      type="pie"
      height="100%"
      width="100%"
    />
  );
}

export default PieChart;
