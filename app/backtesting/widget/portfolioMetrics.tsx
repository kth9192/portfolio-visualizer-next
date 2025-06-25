import {
  Portfolio,
  PortfolioSimulationData,
} from "@/app/interface/dto/portfolio";
import LineChart from "@/components/chart/lineChart";
import { ApexOptions } from "apexcharts";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import React from "react";

interface PortfolioMetricsProps {
  portfolio: Portfolio;
  portfolioSimulationData: PortfolioSimulationData[];
  chartSeries: Array<{
    name: string;
    data: Array<{ x: number; y: number }>;
  }>;
  startDate: Date;
  endDate: Date;
  initialAmount: number;
}

function PortfolioMetrics({
  portfolio,
  portfolioSimulationData,
  chartSeries,
  startDate,
  endDate,
  initialAmount,
}: PortfolioMetricsProps) {
  return (
    <div className="mb-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <LineChart options={{
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
                  const value = series[seriesIndex][dataPointIndex].toFixed(2);
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
        } as ApexOptions} series={chartSeries} containerClass="h-80" />
      </div>
    </div>
  );
}

export default PortfolioMetrics;
