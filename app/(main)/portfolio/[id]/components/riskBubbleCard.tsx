"use client";

import { ETFPriceMonthlyDTO } from "@/app/interface/dto/etf";
import { PortfolioDTO } from "@/app/interface/dto/portfolio";
import { RebalanceFrequency } from "@/app/interface/enum/rebanalceFrequency";
import BubbleChart from "@/components/chart/bubbleChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createMonthPriceMap } from "@/lib/backtestCalculator";
import { calcETFRiskReturn } from "@/lib/riskCalculator";
import { ApexOptions } from "apexcharts";
import { Activity, Weight } from "lucide-react";
import React, { useEffect, useMemo } from "react";

interface RiskBubbleCardProps {
  portfolioData: PortfolioDTO;
  monthlyPortfolioData: ETFPriceMonthlyDTO[];
}

function RiskBubbleCard({
  portfolioData,
  monthlyPortfolioData,
}: RiskBubbleCardProps) {
  const priceMap = useMemo(() => {
    return createMonthPriceMap(monthlyPortfolioData);
  }, [monthlyPortfolioData]);

  function getPerETFMonthlyReturns(
    priceMap: Record<string, Record<string, number>>, // yearMonth → {symbol: price}
    symbol: string,
  ): number[] {
    const sortedMonths = Object.keys(priceMap).sort();
    const returns: number[] = [];

    for (let i = 1; i < sortedMonths.length; i++) {
      const prev = priceMap[sortedMonths[i - 1]][symbol];
      const curr = priceMap[sortedMonths[i]][symbol];
      if (prev && curr && prev > 0) {
        returns.push((curr - prev) / prev);
      }
    }
    return returns;
  }

  const { etfRisks, chartOptions } = useMemo(() => {
    const etfRisks = portfolioData.assets.map((data) => {
      const risks = getPerETFMonthlyReturns(priceMap, data.symbol);

      const { annualizedReturn, annualizedRisk } = calcETFRiskReturn(risks);

      return {
        symbol: data.symbol,
        annualizedReturn,
        annualizedRisk,
        weight: data.weight,
      };
    });

    const xValues = etfRisks.map((e) => e.annualizedRisk);
    const yValues = etfRisks.map((e) => e.annualizedReturn);
    const xPadding = (Math.max(...xValues) - Math.min(...xValues)) * 0.5;
    const yPadding = (Math.max(...yValues) - Math.min(...yValues)) * 0.5;

    const chartOptions: ApexOptions = {
      chart: {
        type: "bubble",
      },
      xaxis: {
        title: { text: "변동성 (위험도, %)" },
        labels: { formatter: (val) => `${Number(val).toFixed(2)}%` },
        min: Math.max(0, Math.min(...xValues) - xPadding),
        max: Math.max(...xValues) + xPadding,
      },
      yaxis: {
        title: { text: "연환산 수익률 (%)" },
        labels: { formatter: (val) => `${Number(val).toFixed(2)}%` },
        min: Math.max(0, Math.min(...yValues) - yPadding),
        max: Math.max(...yValues) + yPadding,
      },
      tooltip: {
        custom: ({ seriesIndex, w }) => {
          const etf = etfRisks[seriesIndex];
          return `
          <div class="p-3">
            <p class="font-bold">${etf.symbol}</p>
            <p>수익률: ${etf.annualizedReturn.toFixed(2)}%</p>
            <p>변동성: ${etf.annualizedRisk.toFixed(2)}%</p>
            <p>비중: ${etf.weight}%</p>
          </div>
        `;
        },
      },
      dataLabels: {
        enabled: true,
        formatter: (_, opts) => opts.w.config.series[opts.seriesIndex].name,
        style: { fontSize: "11px" },
      },
      fill: { opacity: 0.8 },
      plotOptions: {
        bubble: {
          minBubbleRadius: 20,
        },
      },
    };

    return { etfRisks, chartOptions };
  }, [priceMap, portfolioData.assets]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">리스크-수익률</CardTitle>
        <Activity className="h-5 w-5 text-orange-600" />
      </CardHeader>
      <CardContent className="min-h-100">
        <BubbleChart
          options={chartOptions}
          series={etfRisks.map((data) => {
            return {
              name: data.symbol,
              data: [
                {
                  x: data.annualizedRisk,
                  y: data.annualizedReturn,
                  z: Math.sqrt(Math.sqrt(data.weight)),
                },
              ],
            };
          })}
        />
      </CardContent>
    </Card>
  );
}

export default RiskBubbleCard;
