import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import React from "react";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse bg-gray-200 h-64 rounded">
      차트 로딩 중...
    </div>
  ),
});

interface BubbleChartProps {
  options?: ApexOptions;
  series: ApexOptions["series"];
  containerClass?: string;
}

function BubbleChart({ options, series, containerClass }: BubbleChartProps) {
  return (
    <ReactApexChart
      options={options}
      series={series}
      className={containerClass}
      type="bubble"
      height="100%"
      width="100%"
    />
  );
}

export default BubbleChart;
